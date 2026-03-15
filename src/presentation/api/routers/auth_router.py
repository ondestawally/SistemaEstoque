from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional

from infrastructure.database import get_db
from infrastructure.auth import (
    verify_password, create_access_token, SECRET_KEY, ALGORITHM
)
from infrastructure.orm_models.auth_models import UserORM, AuditLogORM

router = APIRouter(prefix="/auth", tags=["Autenticação"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    role: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserORM).filter(UserORM.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def require_role(roles: list):
    def role_checker(user: UserORM = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Role(s) permitida(s): {', '.join(roles)}"
            )
        return user
    return role_checker

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserORM).filter(UserORM.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role, 
        "username": user.username
    }

@router.get("/me", response_model=UserProfile)
async def read_users_me(current_user: UserORM = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role
    }

@router.get("/audit-logs")
async def get_audit_logs(db: Session = Depends(get_db), current_user: UserORM = Depends(require_role(["ADMIN"]))):
    logs = db.query(AuditLogORM).order_by(AuditLogORM.timestamp.desc()).limit(100).all()
    return logs
