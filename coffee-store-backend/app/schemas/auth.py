from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TokenRequest(BaseModel):
    """POST /api/v1/auth/token (form: username=email, password=...)."""

    username: EmailStr  # OAuth2 uses 'username' for email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupRequest(BaseModel):
    """POST /api/v1/auth/signup — customer self-registration."""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 chars)")


class ManagerCreateRequest(BaseModel):
    """POST /api/v1/admin/managers — manager-only manager creation."""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128, description="Password (min 6 chars)")


class UserResponse(BaseModel):
    """Response schema for created users."""

    id: UUID
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}

