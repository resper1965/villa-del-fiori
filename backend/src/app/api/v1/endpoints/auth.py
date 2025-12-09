from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    get_current_user,
)
from app.core.config import settings
from app.core.database import get_db
from app.models.stakeholder import Stakeholder, UserRole


router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    user_role: str
    type: str
    is_active: bool

    class Config:
        from_attributes = True


class PasswordLogin(BaseModel):
    """Login simples com senha (para compatibilidade)"""
    password: str


class EmailPasswordLogin(BaseModel):
    """Login com email e senha"""
    email: EmailStr
    password: str


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login com OAuth2 (username=email, password)
    """
    # Buscar usuário por email (OAuth2 usa 'username' como campo)
    user = db.query(Stakeholder).filter(Stakeholder.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar senha
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não possui senha configurada. Contate o administrador.",
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    
    # Criar tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.user_role.value,
        },
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "user_role": user.user_role.value,
            "type": user.type.value,
        },
    }


@router.post("/login-simple", response_model=TokenResponse)
async def login_simple(
    login_data: PasswordLogin,
    db: Session = Depends(get_db),
):
    """
    Login simples apenas com senha (para compatibilidade com sistema antigo)
    Cria ou usa usuário admin padrão
    """
    ADMIN_PASSWORD = "cvdf2025"
    
    if login_data.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha incorreta",
        )
    
    # Buscar ou criar usuário admin padrão
    admin_email = "admin@condominio.com"
    admin = db.query(Stakeholder).filter(Stakeholder.email == admin_email).first()
    
    if not admin:
        # Criar admin padrão
        from app.models.stakeholder import StakeholderType
        admin = Stakeholder(
            name="Administrador",
            email=admin_email,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            type=StakeholderType.SINDICO,
            user_role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    
    # Criar tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "email": admin.email,
            "role": admin.user_role.value,
        },
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(
        data={
            "sub": str(admin.id),
            "email": admin.email,
        }
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(admin.id),
            "name": admin.name,
            "email": admin.email,
            "user_role": admin.user_role.value,
            "type": admin.type.value,
        },
    }


@router.post("/login-email", response_model=TokenResponse)
async def login_email(
    login_data: EmailPasswordLogin,
    db: Session = Depends(get_db),
):
    """
    Login com email e senha (alternativa ao OAuth2)
    """
    user = db.query(Stakeholder).filter(Stakeholder.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não possui senha configurada. Contate o administrador.",
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    
    # Criar tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.user_role.value,
        },
        expires_delta=access_token_expires,
    )
    refresh_token = create_refresh_token(
        data={
            "sub": str(user.id),
            "email": user.email,
        }
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "user_role": user.user_role.value,
            "type": user.type.value,
        },
    }


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
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
        
        user_id = payload.get("sub")
        user = db.query(Stakeholder).filter(Stakeholder.id == user_id).first()
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo",
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "role": user.user_role.value,
            },
            expires_delta=access_token_expires,
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "user_role": user.user_role.value,
                "type": user.type.value,
            },
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Stakeholder = Depends(get_current_user),
):
    """
    Obter informações do usuário atual
    """
    return current_user
