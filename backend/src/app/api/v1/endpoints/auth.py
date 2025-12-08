from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta

from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings

router = APIRouter()

# Senha fixa para autenticação simples
ADMIN_PASSWORD = "cvdf2025"
ADMIN_PASSWORD_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y"  # Hash de cvdf2025


class PasswordLogin(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(password_data: PasswordLogin):
    """
    Login simples apenas com senha
    """
    if password_data.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta",
        )
    
    # Criar tokens para usuário admin
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "admin", "email": "admin@condominio.com", "role": "aprovador"},
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(
        data={"sub": "admin", "email": "admin@condominio.com"}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token_data: RefreshTokenRequest):
    """
    Renovar access token usando refresh token
    """
    from app.core.security import decode_token
    
    refresh_token = refresh_token_data.refresh_token
    
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": payload.get("sub"), "email": payload.get("email"), "role": "aprovador"},
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )

