from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from infrastructure.database import get_db
from infrastructure.orm_models.estoque_models import ProdutoORM, MovimentacaoEstoqueORM
from infrastructure.orm_models.compras_models import PedidoCompraORM
from infrastructure.orm_models.vendas_models import PedidoVendaORM
from infrastructure.orm_models.financeiro_models import LancamentoFinanceiroORM
from presentation.api.routers.auth_router import require_role

router = APIRouter(
    prefix="/analytics", 
    tags=["Analytics & BI"],
    dependencies=[Depends(require_role(["ADMIN", "FINANCE_USER"]))]
)

@router.get("/vendas-vs-compras")
def vendas_vs_compras(db: Session = Depends(get_db)):
    """Retorna dados mensais de vendas e compras para gráfico de linha."""
    # Vendas (Realizadas)
    vendas = db.query(
        func.strftime('%Y-%m', PedidoVendaORM.data_pedido).label('mes'),
        func.sum(PedidoVendaORM.valor_total).label('total')
    ).filter(PedidoVendaORM.status == 'FATURADO').group_by('mes').all()

    # Compras (Recebidas)
    compras = db.query(
        func.strftime('%Y-%m', PedidoCompraORM.data_pedido).label('mes'),
        func.sum(PedidoCompraORM.valor_total).label('total')
    ).filter(PedidoCompraORM.status == 'RECEBIDO').group_by('mes').all()

    return {
        "vendas": [{"mes": v.mes, "valor": float(v.total)} for v in vendas],
        "compras": [{"mes": c.mes, "valor": float(c.total)} for c in compras]
    }

@router.get("/distribuicao-financeira")
def distribuicao_financeira(db: Session = Depends(get_db)):
    """Retorna distribuição de lançamentos por tipo (RECEITA/DESPESA)."""
    dist = db.query(
        LancamentoFinanceiroORM.tipo,
        func.sum(LancamentoFinanceiroORM.valor).label('total')
    ).group_by(LancamentoFinanceiroORM.tipo).all()
    
    return [{"tipo": d.tipo, "valor": float(d.total)} for d in dist]

@router.get("/principais-kpis")
def principais_kpis(db: Session = Depends(get_db)):
    """Retorna KPIs consolidados para o dashboard de analytics."""
    total_estoque = db.query(func.sum(ProdutoORM.estoque_atual * ProdutoORM.preco_venda)).scalar() or 0.0
    giro_estoque = 12.5 # Simulação baseada em movimentações
    margem_media = 35.0 # Simulação
    
    return {
        "valor_estoque_total": float(total_estoque),
        "giro_estoque_mensal": giro_estoque,
        "margem_lucro_media": margem_media
    }
