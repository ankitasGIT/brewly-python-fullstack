"""
POST auth — login, returns JWT with role claim.
POST signup — customer self-registration.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token
from app.core.security import hash_password, verify_password
from app.db import get_db
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.schemas.auth import SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


# Security considerations for production:
# - Add a /token/refresh endpoint using short-lived access plus long-lived refresh tokens
# - Consider logging failed login attempts for security monitoring


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="Login",
    description="Returns JWT access token. Token payload includes sub (user id), role (customer|manager), exp.",
)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    repo = UserRepository(session)
    user = await repo.get_by_email(form.username)
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, token_type="bearer")


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Customer signup",
    description="Register a new customer account. No authentication required.",
)
async def signup(
    body: SignupRequest,
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
        role=UserRole.CUSTOMER,
    )
    user = await repo.create(user)
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role.value,
        created_at=user.created_at,
    )
