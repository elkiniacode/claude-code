from sqlalchemy import Column, String, Boolean
from .base import BaseModel


class User(BaseModel):
    """
    User model for authentication and authorization.
    """
    __tablename__ = 'users'

    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"
