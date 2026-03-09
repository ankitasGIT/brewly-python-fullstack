"""
Admin: create/update/delete products and variations (manager only).
Manager creation (manager only).
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.product import Product, ProductVariation
from app.schemas.menu import ProductMenuSchema, VariationSchema
from app.repositories.order_repo import OrderRepository
from app.schemas.order import OrderResponse, OrderItemResponse, PaymentInfoSchema
from pydantic import BaseModel, Field
from app.core.auth import require_role
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.schemas.auth import ManagerCreateRequest, UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Request Schemas ---
# These are defined inline rather than in app/schemas/ because they are
# tightly coupled to the admin API and not reused elsewhere.
# If these schemas grow or are needed by other modules,
# they should be moved to a shared schemas module.
# Used selectinload to eagerly fetch related data upfront, since async SQLAlchemy
# doesn’t support lazy loading and it also prevents the N+1 query problem.

class VariationCreate(BaseModel):
    """Request schema for creating a product variation."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Variation name (e.g., 'Vanilla', 'Extra Shot')"
    )
    price_change_cents: int = Field(
        default=0,
        ge=0,
        le=10000,
        description="Price adjustment in cents (0-10000)"
    )


class VariationUpdate(BaseModel):
    """Request schema for updating a product variation."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Variation name"
    )
    price_change_cents: Optional[int] = Field(
        None,
        ge=0,
        le=10000,
        description="Price adjustment in cents"
    )


class ProductCreate(BaseModel):
    """Request schema for creating a product with variations."""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Product name"
    )
    base_price_cents: int = Field(
        ge=0,
        le=100000,
        description="Base price in cents (0-100000)"
    )
    variations: list[VariationCreate] = Field(
        default_factory=list,
        max_items=50,
        description="List of product variations (max 50)"
    )


class ProductUpdate(BaseModel):
    """Request schema for updating a product."""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Product name"
    )
    base_price_cents: Optional[int] = Field(
        None,
        ge=0,
        le=100000,
        description="Base price in cents"
    )


@router.post("/products", response_model=ProductMenuSchema, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> ProductMenuSchema:
    product = Product(name=body.name, base_price_cents=body.base_price_cents)
    session.add(product)
    await session.flush()
    for v in body.variations:
        var = ProductVariation(
            product_id=product.id,
            name=v.name,
            price_change_cents=v.price_change_cents,
        )
        session.add(var)
    await session.flush()
    await session.refresh(product)
    from sqlalchemy.orm import selectinload
    from sqlalchemy import select
    r = await session.execute(
        select(Product).options(selectinload(Product.variations)).where(Product.id == product.id)
    )
    product = r.scalar_one()
    return ProductMenuSchema(
        id=product.id,
        name=product.name,
        base_price_cents=product.base_price_cents,
        variations=[VariationSchema(id=v.id, name=v.name, price_change_cents=v.price_change_cents) for v in product.variations],
    )


@router.patch("/products/{product_id}", response_model=ProductMenuSchema)
async def update_product(
    product_id: UUID,
    body: ProductUpdate,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> ProductMenuSchema:
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    r = await session.execute(
        select(Product).options(selectinload(Product.variations)).where(Product.id == product_id)
    )
    product = r.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if body.name is not None:
        product.name = body.name
    if body.base_price_cents is not None:
        product.base_price_cents = body.base_price_cents
    await session.flush()
    await session.refresh(product)
    r = await session.execute(
        select(Product).options(selectinload(Product.variations)).where(Product.id == product_id)
    )
    product = r.scalar_one()
    return ProductMenuSchema(
        id=product.id,
        name=product.name,
        base_price_cents=product.base_price_cents,
        variations=[VariationSchema(id=v.id, name=v.name, price_change_cents=v.price_change_cents) for v in product.variations],
    )


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> None:
    from sqlalchemy import select
    r = await session.execute(select(Product).where(Product.id == product_id))
    product = r.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await session.delete(product)
    await session.flush()


@router.patch("/products/{product_id}/variations/{variation_id}", response_model=VariationSchema)
async def update_variation(
    product_id: UUID,
    variation_id: UUID,
    body: VariationUpdate,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> VariationSchema:
    """Update a product variation (manager only)."""
    from sqlalchemy import select
    
    # Verify product exists
    product_result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Get the variation
    variation_result = await session.execute(
        select(ProductVariation).where(
            (ProductVariation.id == variation_id) &
            (ProductVariation.product_id == product_id)
        )
    )
    variation = variation_result.scalar_one_or_none()
    if not variation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variation not found")
    
    # Update variation fields
    if body.name is not None:
        variation.name = body.name
    if body.price_change_cents is not None:
        variation.price_change_cents = body.price_change_cents
    
    await session.flush()
    await session.refresh(variation)
    
    return VariationSchema(
        id=variation.id,
        name=variation.name,
        price_change_cents=variation.price_change_cents,
    )


@router.delete("/products/{product_id}/variations/{variation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variation(
    product_id: UUID,
    variation_id: UUID,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Delete a product variation (manager only)."""
    from sqlalchemy import select
    
    # Verify product exists
    product_result = await session.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Get the variation
    variation_result = await session.execute(
        select(ProductVariation).where(
            (ProductVariation.id == variation_id) & 
            (ProductVariation.product_id == product_id)
        )
    )
    variation = variation_result.scalar_one_or_none()
    if not variation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variation not found")
    
    await session.delete(variation)
    await session.flush()


@router.get("/orders", response_model=list[OrderResponse])
async def get_all_orders(
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> list[OrderResponse]:
    """Get all orders (manager only) with enriched product/variation details using eager loading."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.order import Order, OrderItem

    # Single query with eager loading of all relationships
    result = await session.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.items).selectinload(OrderItem.variation),
            selectinload(Order.payment)
        )
    )

    orders = result.unique().scalars().all()


    response_orders = []
    # Single for loop - all data already loaded from database
    for order in orders:
        items = []
        for item in order.items:
            items.append(OrderItemResponse(
                product_id=item.product_id,
                variation_id=item.variation_id,
                quantity=item.quantity,
                unit_price_cents=item.unit_price_cents,
                line_total_cents=item.unit_price_cents * item.quantity,
                product_name=item.product.name if item.product else None,
                variation_name=item.variation.name if item.variation else None,
                variation_price_change_cents=item.variation.price_change_cents if item.variation else None,
                product_base_price_cents=item.product.base_price_cents if item.product else None,
            ))

        response_orders.append(OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            status=order.status.value if hasattr(order.status, 'value') else str(order.status),
            total_cents=order.total_cents,
            metadata=order.metadata_,
            created_at=order.created_at.isoformat(),
            items=items,
            payment=PaymentInfoSchema(
                id=order.payment.id,
                amount_cents=order.payment.amount_cents,
                response_status_code=order.payment.response_status_code
            ) if order.payment else None
        ))

    return response_orders


@router.post(
    "/managers",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create manager",
    description="Create a new manager account. Only accessible by authenticated managers.",
)
async def create_manager(
    body: ManagerCreateRequest,
    current_user: User = require_role(UserRole.MANAGER),
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    repo = UserRepository(session)
    existing = await repo.get_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        role=UserRole.MANAGER,
    )
    user = await repo.create(user)
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role.value,
        created_at=user.created_at,
    )

