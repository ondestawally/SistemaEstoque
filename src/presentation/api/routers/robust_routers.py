from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from infrastructure.database import get_db

class CriarClienteDto(BaseModel):
    id: str
    razao_social: str
    cnpj_cpf: str
from application.use_cases.vendas.processar_venda import ProcessarVendaUseCase, CriarVendaDto
from infrastructure.repositories.robust_repositories import ClienteRepositorySQLAlchemy, VendasRepositorySQLAlchemy, FinanceiroRepositorySQLAlchemy
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy
from infrastructure.orm_models.robust_models import ClienteORM, LancamentoFinanceiroORM

vendas_router = APIRouter(prefix="/vendas", tags=["ERP - Vendas"])
financeiro_router = APIRouter(prefix="/financeiro", tags=["ERP - Financeiro"])

# Dependency Injection Factories
def get_vendas_use_case(db: Session = Depends(get_db)):
    c_repo = ClienteRepositorySQLAlchemy(db)
    p_repo = ProdutoRepositorySQLAlchemy(db)
    v_repo = VendasRepositorySQLAlchemy(db, c_repo)
    f_repo = FinanceiroRepositorySQLAlchemy(db)
    return ProcessarVendaUseCase(c_repo, p_repo, v_repo, f_repo)

@vendas_router.post("/clientes/", status_code=201)
def criar_cliente(cliente: CriarClienteDto, db: Session = Depends(get_db)):
    repo = ClienteRepositorySQLAlchemy(db)
    from domain.vendas.cliente import Cliente
    novo = Cliente(id=cliente.id, razao_social=cliente.razao_social, cnpj_cpf=cliente.cnpj_cpf)
    repo.salvar(novo)
    return {"message": "Cliente cadastrado com sucesso"}

# --- VENDAS ENDPOINTS ---
@vendas_router.post("/pedidos/", status_code=201)
def criar_venda(dto: CriarVendaDto, use_case: ProcessarVendaUseCase = Depends(get_vendas_use_case)):
    try:
        venda = use_case.executar(dto)
        return {"message": "Venda processada e financeiro gerado", "venda_id": venda.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@vendas_router.get("/clientes/")
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteORM).all()

# --- FINANCEIRO ENDPOINTS ---
@financeiro_router.get("/fluxo-caixa/")
def get_fluxo_caixa(db: Session = Depends(get_db)):
    lancamentos = db.query(LancamentoFinanceiroORM).all()
    total_receber = sum(l.valor for l in lancamentos if l.tipo == 'RECEBER')
    total_pagar = sum(l.valor for l in lancamentos if l.tipo == 'PAGAR')
    return {
        "resumo": {
            "total_receber": total_receber,
            "total_pagar": total_pagar,
            "saldo": total_receber - total_pagar
        },
        "detalhes": lancamentos
    }
