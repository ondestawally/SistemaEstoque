from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.database import Base

class UserORM(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="USER") # ADMIN, RH_USER, FINANCE_USER, LOGISTICS_USER, SALES_USER, USER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLogORM(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=True)
    username = Column(String, nullable=True)
    action = Column(String) # CREATE, UPDATE, DELETE, LOGIN
    entity = Column(String) # Produto, Pedido, etc.
    entity_id = Column(String, nullable=True)
    details = Column(String) # JSON ou Descrição
    timestamp = Column(DateTime, default=datetime.utcnow)
