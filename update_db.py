from infrastructure.database import engine, Base
# Import all ORM models to register them with Base
import infrastructure.orm_models.erp_models
import infrastructure.orm_models.wms_models
import infrastructure.orm_models.robust_models

print("Updating database schema in Supabase...")
Base.metadata.create_all(bind=engine)
print("Database schema updated successfully!")
