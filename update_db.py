from infrastructure.database import engine, Base
# Import all ORM models to register them with Base
import infrastructure.orm_models.erp_models
import infrastructure.orm_models.wms_models
import infrastructure.orm_models.robust_models
import infrastructure.orm_models.phase6_models
# Fase 7
import infrastructure.orm_models.rh_models
import infrastructure.orm_models.controlling_models
# Fase 8
import infrastructure.orm_models.auth_models
# Fase 11
import infrastructure.orm_models.crm_models

print("Updating database schema in Supabase...")
Base.metadata.create_all(bind=engine)

# Seed Admin User
from sqlalchemy.orm import Session
from infrastructure.database import SessionLocal
from infrastructure.orm_models.auth_models import UserORM
from infrastructure.auth import get_password_hash

db = SessionLocal()
admin = db.query(UserORM).filter(UserORM.username == "admin").first()
if not admin:
    print("Creating initial admin user...")
    admin = UserORM(
        id="ADMIN-001",
        username="admin",
        email="admin@erp.com",
        hashed_password=get_password_hash("admin123"), # Senha padrão
        full_name="Administrador do Sistema",
        role="ADMIN",
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("Admin user created successfully!")
db.close()

print("Database schema updated successfully!")

