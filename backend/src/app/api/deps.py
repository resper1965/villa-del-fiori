from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status

from app.core.database import get_db
from app.core.security import get_current_user

# Database dependency
def get_database() -> Generator:
    """Get database session"""
    yield from get_db()

# Authentication dependency (will be properly implemented when User model is created)
async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """Get current active user"""
    # TODO: Implement proper user fetching from database
    return current_user


