from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.database import get_db
from infrastructure.orm_models.erp_models import ProdutoORM, PedidoORM
from infrastructure.orm_models.wms_models import LoteORM, ArmazemORM

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Totais básicos
    total_produtos = db.query(ProdutoORM).count()
    total_pedidos_compra = db.query(PedidoORM).count()
    total_lotes = db.query(LoteORM).count()
    
    # 2. Novas Métricas Robustas
    from infrastructure.orm_models.robust_models import LancamentoFinanceiroORM, ClienteORM
    total_clientes = db.query(ClienteORM).count()
    
    lancamentos = db.query(LancamentoFinanceiroORM).all()
    receita = sum(l.valor for l in lancamentos if l.tipo == 'RECEBER')
    despesa = sum(l.valor for l in lancamentos if l.tipo == 'PAGAR')

    # 3. Distribuição de Estoque
    distribuicao = db.query(
        LoteORM.produto_id, 
        func.sum(LoteORM.quantidade_disponivel).label("total")
    ).group_by(LoteORM.produto_id).all()
    
    chart_data = []
    for d in distribuicao:
        prod = db.query(ProdutoORM).filter(ProdutoORM.id == d.produto_id).first()
        nome = prod.nome if prod else d.produto_id
        chart_data.append({"name": nome, "value": int(d.total)})

    return {
        "cards": {
            "total_produtos": total_produtos,
            "total_vendas": receita,
            "total_lotes": total_lotes,
            "saldo_caixa": receita - despesa
        },
        "chart_data": chart_data
    }
