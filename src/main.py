from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database import engine, Base
from pathlib import Path

from presentation.api.routers import (
    auth_router, erp_router, wms_router, compras_router, 
    contabilidade_router, fiscal_router, estoque_router, faturamento_router, 
    contratos_router, logistica_router, dashboard_router,
    crm_router, rh_router, controlling_router, analytics_router, robust_routers
)
from presentation.api.middlewares.error_handler import add_exception_handlers

app = FastAPI(title="ERP & WMS API")
add_exception_handlers(app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# Fase 1-5 (Core)
app.include_router(erp_router.router, prefix="/api/v1")
app.include_router(logistica_router.router, prefix="/api/v1")
app.include_router(crm_router.router, prefix="/api/v1")
app.include_router(contratos_router.router, prefix="/api/v1")
app.include_router(dashboard_router.router, prefix="/api/v1")
app.include_router(robust_routers.vendas_router, prefix="/api/v1")
app.include_router(robust_routers.financeiro_router, prefix="/api/v1")

# Fase 6 (ERP Completo)
app.include_router(estoque_router.router, prefix="/api/v1")
app.include_router(compras_router.router, prefix="/api/v1")
app.include_router(fiscal_router.router, prefix="/api/v1")
app.include_router(faturamento_router.router, prefix="/api/v1")
app.include_router(contratos_router.router, prefix="/api/v1")
app.include_router(contabilidade_router.router, prefix="/api/v1")

# Fase 7 (Enterprise)
app.include_router(rh_router.router, prefix="/api/v1")
app.include_router(controlling_router.router, prefix="/api/v1")

# Fase 8 (Segurança)
app.include_router(auth_router.router, prefix="/api/v1")

# Fase 9 (Analytics & BI)
app.include_router(analytics_router.router, prefix="/api/v1")

# Fase 10 (Logística Avançada)
app.include_router(logistica_router.router, prefix="/api/v1")

# Serve a Single Page Application (UI)
_STATIC_DIR = Path(__file__).parent.parent / "static"
app.mount("/", StaticFiles(directory=str(_STATIC_DIR), html=True), name="static")
