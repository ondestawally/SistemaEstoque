from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database import engine, Base
from infrastructure.logging_config import setup_logging
from pathlib import Path
import logging

from presentation.api.routers import (
    auth_router, erp_router, wms_router, compras_router, 
    contabilidade_router, fiscal_router, estoque_router, faturamento_router, 
    contratos_router, logistica_router, dashboard_router,
    crm_router, rh_router, controlling_router, analytics_router, robust_routers
)
from presentation.api.middlewares.error_handler import add_exception_handlers

setup_logging(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SistemaEstoque API",
    description="""
    ## SistemaEstoque - ERP & WMS Enterprise
    
    API RESTful para gestão integrada de:
    - **ERP**: Produtos, Fornecedores, Compras, Vendas
    - **WMS**: Armazéns, Lotes, Alocações
    - **CRM**: Leads, Oportunidades, Vendedores
    - **Financeiro**: Contas a pagar/receber, Fluxo de caixa
    - **RH**: Funcionários, Cargos, Folha de pagamento
    - **Fiscal**: Regras fiscais, Livro fiscal
    - **Contabilidade**: Plano de contas, Lançamentos
    - **Analytics**: Dashboards, KPIs, Relatórios BI
    
    ## Autenticação
    
    Utilize o endpoint `/api/v1/auth/login` para obter um token JWT.
    O token deve ser enviado no header `Authorization: Bearer <token>`.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "SistemaEstoque Team",
        "email": "contato@sistemaestoque.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)
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
app.include_router(wms_router.router, prefix="/api/v1")
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


@app.on_event("startup")
async def startup_event():
    logger.info("SistemaEstoque API starting up")
    logger.info(f"Database URL: {'***' if 'supabase' in str(engine.url) else engine.url}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("SistemaEstoque API shutting down")
