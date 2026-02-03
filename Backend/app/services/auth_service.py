"""
Authentication service layer for user management.
"""
from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.schemas.auth import UserCreate, UserLogin, Token


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: UserCreate) -> User:
        """
        Register a new user.

        Args:
            user_data: User registration data

        Returns:
            Created User object

        Raises:
            HTTPException 400: If email already registered
        """
        # Check if email already exists
        existing_user = self.db.query(User).filter(
            User.email == user_data.email,
            User.deleted_at.is_(None)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = get_password_hash(user_data.password)

        # Create new user
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_active=True,
            is_superuser=False
        )

        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)

        return new_user

    def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """
        Authenticate a user by email and password.

        Args:
            login_data: Login credentials

        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.db.query(User).filter(
            User.email == login_data.email,
            User.deleted_at.is_(None),
            User.is_active == True
        ).first()

        if not user:
            return None

        if not verify_password(login_data.password, user.hashed_password):
            return None

        return user

    def create_user_token(self, user: User) -> Token:
        """
        Create access token for user.

        Args:
            user: User object

        Returns:
            Token response with access token
        """
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User object if found, None otherwise
        """
        return self.db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()
