from fastapi import FastAPI
from infrastructure.database import engine, Base

from presentation.api.routers import erp_router, wms_router

# A cargo do script de migration ou start_app
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ERP & WMS API", 
    description="Sistema corporativo integrado com arquitetura limpa.",
    version="1.0"
)

app.include_router(erp_router.router)
app.include_router(wms_router.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "ERP & WMS is running"}
