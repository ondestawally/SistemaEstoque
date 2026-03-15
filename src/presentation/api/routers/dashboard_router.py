from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.database import get_db
from infrastructure.orm_models.erp_models import ProdutoORM, PedidoORM
from infrastructure.orm_models.wms_models import LoteORM, ArmazemORM

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total de Produtos
    total_produtos = db.query(ProdutoORM).count()
    
    # 2. Total de Pedidos (Simplificado - Todos)
    total_pedidos = db.query(PedidoORM).count()
    
    # 3. Lotes no WMS
    total_lotes = db.query(LoteORM).count()
    
    # 4. Distribuição de Estoque por Produto (para o gráfico)
    # Buscamos a soma de quantidade disponível agrupada por produto_id
    distribuicao = db.query(
        LoteORM.produto_id, 
        func.sum(LoteORM.quantidade_disponivel).label("total")
    ).group_by(LoteORM.produto_id).all()
    
    chart_data = []
    for d in distribuicao:
        # Tenta buscar o nome do produto para o label
        prod = db.query(ProdutoORM).filter(ProdutoORM.id == d.produto_id).first()
        nome = prod.nome if prod else d.produto_id
        chart_data.append({"name": nome, "value": int(d.total)})

    return {
        "cards": {
            "total_produtos": total_produtos,
            "total_pedidos": total_pedidos,
            "total_lotes": total_lotes,
            "health": "100%"
        },
        "chart_data": chart_data
    }
