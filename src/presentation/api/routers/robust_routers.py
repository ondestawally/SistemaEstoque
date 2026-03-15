from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from infrastructure.database import get_db

class CriarClienteDto(BaseModel):
    id: str
    razao_social: str
    cnpj_cpf: str

from application.use_cases.vendas.processar_venda import ProcessarVendaUseCase, CriarVendaDto
from infrastructure.repositories.robust_repositories import ClienteRepositorySQLAlchemy, VendasRepositorySQLAlchemy, FinanceiroRepositorySQLAlchemy
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy
from infrastructure.orm_models.robust_models import ClienteORM, LancamentoFinanceiroORM, PedidoVendaORM

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

@vendas_router.get("/clientes/")
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(ClienteORM).all()

# --- VENDAS (Pedidos) ENDPOINTS ---
@vendas_router.post("/pedidos/", status_code=201)
def criar_venda(dto: CriarVendaDto, use_case: ProcessarVendaUseCase = Depends(get_vendas_use_case)):
    try:
        venda = use_case.executar(dto)
        return {"message": "Venda processada e financeiro gerado", "venda_id": venda.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@vendas_router.get("/pedidos/")
def listar_pedidos_venda(db: Session = Depends(get_db)):
    pedidos = db.query(PedidoVendaORM).order_by(PedidoVendaORM.data_emissao.desc()).all()
    return [
        {
            "id": p.id,
            "cliente_id": p.cliente_id,
            "status": p.status,
            "valor_total": float(p.valor_total),
            "data_emissao": str(p.data_emissao),
        }
        for p in pedidos
    ]

TRANSICOES_VENDA = {
    "RASCUNHO": "APROVADO",
    "APROVADO": "FATURADO",
}

@vendas_router.patch("/pedidos/{pedido_id}/status", status_code=200)
def atualizar_status_venda(pedido_id: str, db: Session = Depends(get_db)):
    """
    Avança o status de um Pedido de Venda: RASCUNHO → APROVADO → FATURADO
    """
    pedido = db.query(PedidoVendaORM).filter(PedidoVendaORM.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido de venda não encontrado")
    proximo = TRANSICOES_VENDA.get(pedido.status)
    if not proximo:
        raise HTTPException(status_code=400, detail=f"Status '{pedido.status}' não pode ser avançado")
    pedido.status = proximo
    db.commit()
    return {"message": f"Status atualizado para {proximo}", "pedido_id": pedido_id, "novo_status": proximo}

# --- FINANCEIRO ENDPOINTS ---
@financeiro_router.get("/fluxo-caixa/")
def get_fluxo_caixa(db: Session = Depends(get_db)):
    lancamentos = db.query(LancamentoFinanceiroORM).order_by(LancamentoFinanceiroORM.data_lancamento.desc()).all()
    total_receber = float(sum(l.valor for l in lancamentos if l.tipo == 'RECEBER'))
    total_pagar = float(sum(l.valor for l in lancamentos if l.tipo == 'PAGAR'))
    return {
        "resumo": {
            "total_receber": total_receber,
            "total_pagar": total_pagar,
            "saldo": total_receber - total_pagar
        },
        "detalhes": [
            {
                "id": l.id,
                "tipo": l.tipo,
                "descricao": l.descricao,
                "valor": float(l.valor),
                "status": l.status,
                "data_lancamento": str(l.data_lancamento),
                "data_vencimento": str(l.data_vencimento) if l.data_vencimento else None,
            }
            for l in lancamentos
        ]
    }
