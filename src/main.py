from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database import engine, Base

from presentation.api.routers import erp_router, wms_router

# A cargo do script de migration ou start_app
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ERP & WMS API", 
    description="Sistema corporativo integrado com arquitetura limpa.",
    version="1.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todos em desenvolvimento. Em prod, usar listagem.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.include_router(erp_router.router)
app.include_router(wms_router.router)

# Serve a Single Page Application (UI)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
