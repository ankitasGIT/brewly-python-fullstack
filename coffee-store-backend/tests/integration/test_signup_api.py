"""
Integration tests for signup endpoints:
  POST /auth/signup — customer self-registration
  POST /admin/managers — manager-only manager creation
"""
import pytest
import respx
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.core.security import hash_password

pytestmark = pytest.mark.asyncio


@pytest.fixture
async def manager_user(session: AsyncSession) -> User:
    """Create or retrieve test manager user."""
    from sqlalchemy import select

    result = await session.execute(
        select(User).where(User.email == "test_manager@example.com")
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email="test_manager@example.com",
            hashed_password=hash_password("password123"),
            role=UserRole.MANAGER,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user


@pytest.fixture
async def manager_token(manager_user: User) -> str:
    """Generate JWT token for manager user."""
    from app.core.auth import create_access_token
    return create_access_token(manager_user.id, UserRole.MANAGER)


@pytest.fixture
async def customer_user(session: AsyncSession) -> User:
    """Create or retrieve test customer user."""
    from sqlalchemy import select

    result = await session.execute(
        select(User).where(User.email == "test_customer@example.com")
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email="test_customer@example.com",
            hashed_password=hash_password("password123"),
            role=UserRole.CUSTOMER,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user


@pytest.fixture
async def customer_token(customer_user: User) -> str:
    """Generate JWT token for customer user."""
    from app.core.auth import create_access_token
    return create_access_token(customer_user.id, UserRole.CUSTOMER)


# --- Customer Signup Tests ---


@respx.mock
async def test_customer_signup_success(client):
    """POST /auth/signup — successfully register a new customer."""
    email = f"new_customer_{uuid4().hex[:8]}@test.com"
    body = {"email": email, "password": "securepass123"}

    response = await client.post("/api/v1/auth/signup", json=body)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "customer"
    assert "id" in data
    assert "created_at" in data


@respx.mock
async def test_customer_signup_duplicate_email(client, customer_user):
    """POST /auth/signup — reject duplicate email with 409."""
    body = {"email": customer_user.email, "password": "securepass123"}

    response = await client.post("/api/v1/auth/signup", json=body)

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


@respx.mock
async def test_customer_signup_short_password(client):
    """POST /auth/signup — reject password shorter than 6 chars."""
    body = {"email": "short_pass@test.com", "password": "abc"}

    response = await client.post("/api/v1/auth/signup", json=body)

    assert response.status_code == 422  # Pydantic validation error


@respx.mock
async def test_customer_signup_invalid_email(client):
    """POST /auth/signup — reject invalid email format."""
    body = {"email": "not-an-email", "password": "securepass123"}

    response = await client.post("/api/v1/auth/signup", json=body)

    assert response.status_code == 422


@respx.mock
async def test_new_customer_can_login(client):
    """Signup → login with same credentials → get JWT token."""
    email = f"login_test_{uuid4().hex[:8]}@test.com"
    password = "securepass123"

    # Signup
    signup_resp = await client.post(
        "/api/v1/auth/signup",
        json={"email": email, "password": password},
    )
    assert signup_resp.status_code == 201

    # Login with same credentials
    login_resp = await client.post(
        "/api/v1/auth/token",
        data={"username": email, "password": password},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Verify JWT has customer role
    from jose import jwt
    from app.config import get_settings
    settings = get_settings()
    payload = jwt.decode(data["access_token"], settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    assert payload["role"] == "customer"


# --- Manager Creation Tests ---


@respx.mock
async def test_manager_create_manager_success(client, manager_token):
    """POST /admin/managers — manager successfully creates a new manager."""
    email = f"new_manager_{uuid4().hex[:8]}@test.com"
    body = {"email": email, "password": "managerpass123"}

    response = await client.post(
        "/api/v1/admin/managers",
        json=body,
        headers={"Authorization": f"Bearer {manager_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "manager"
    assert "id" in data
    assert "created_at" in data


@respx.mock
async def test_manager_create_by_customer_forbidden(client, customer_token):
    """POST /admin/managers — customer cannot create a manager (403)."""
    body = {"email": "sneaky@test.com", "password": "securepass123"}

    response = await client.post(
        "/api/v1/admin/managers",
        json=body,
        headers={"Authorization": f"Bearer {customer_token}"},
    )

    assert response.status_code == 403


@respx.mock
async def test_manager_create_unauthenticated(client):
    """POST /admin/managers — reject if not authenticated (401)."""
    body = {"email": "unauth@test.com", "password": "securepass123"}

    response = await client.post("/api/v1/admin/managers", json=body)

    assert response.status_code == 401


@respx.mock
async def test_manager_create_duplicate_email(client, manager_token, manager_user):
    """POST /admin/managers — reject duplicate email (409)."""
    body = {"email": manager_user.email, "password": "securepass123"}

    response = await client.post(
        "/api/v1/admin/managers",
        json=body,
        headers={"Authorization": f"Bearer {manager_token}"},
    )

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


@respx.mock
async def test_new_manager_can_login(client, manager_token):
    """Manager creates new manager → new manager can login with manager role."""
    email = f"mgr_login_{uuid4().hex[:8]}@test.com"
    password = "managerpass123"

    # Create manager
    create_resp = await client.post(
        "/api/v1/admin/managers",
        json={"email": email, "password": password},
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert create_resp.status_code == 201

    # Login as newly created manager
    login_resp = await client.post(
        "/api/v1/auth/token",
        data={"username": email, "password": password},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data

    # Verify JWT has manager role
    from jose import jwt
    from app.config import get_settings
    settings = get_settings()
    payload = jwt.decode(data["access_token"], settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    assert payload["role"] == "manager"
