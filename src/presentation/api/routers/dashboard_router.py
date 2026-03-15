from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from infrastructure.database import get_db
from infrastructure.orm_models.erp_models import ProdutoORM, PedidoORM
from infrastructure.orm_models.wms_models import LoteORM

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    from infrastructure.orm_models.robust_models import LancamentoFinanceiroORM, ClienteORM, PedidoVendaORM
    from infrastructure.orm_models.erp_models import FornecedorORM

    # 1. Cards numéricos
    total_produtos = db.query(ProdutoORM).count()
    total_lotes = db.query(LoteORM).count()
    total_clientes = db.query(ClienteORM).count()
    total_fornecedores = db.query(FornecedorORM).count()
    total_pedidos_compra = db.query(PedidoORM).count()
    total_pedidos_venda = db.query(PedidoVendaORM).count()

    lancamentos = db.query(LancamentoFinanceiroORM).all()
    receita = float(sum(l.valor for l in lancamentos if l.tipo == 'RECEBER'))
    despesa = float(sum(l.valor for l in lancamentos if l.tipo == 'PAGAR'))

    # 2. Série temporal dos últimos 7 dias
    hoje = datetime.utcnow().date()
    serie = []
    for i in range(6, -1, -1):
        dia = hoje - timedelta(days=i)
        dia_inicio = datetime(dia.year, dia.month, dia.day, 0, 0, 0)
        dia_fim = datetime(dia.year, dia.month, dia.day, 23, 59, 59)

        r = db.query(func.sum(LancamentoFinanceiroORM.valor)).filter(
            LancamentoFinanceiroORM.tipo == 'RECEBER',
            LancamentoFinanceiroORM.data_lancamento >= dia_inicio,
            LancamentoFinanceiroORM.data_lancamento <= dia_fim
        ).scalar() or 0

        d = db.query(func.sum(LancamentoFinanceiroORM.valor)).filter(
            LancamentoFinanceiroORM.tipo == 'PAGAR',
            LancamentoFinanceiroORM.data_lancamento >= dia_inicio,
            LancamentoFinanceiroORM.data_lancamento <= dia_fim
        ).scalar() or 0

        serie.append({
            "dia": dia.strftime("%d/%m"),
            "receitas": float(r),
            "despesas": float(d),
        })

    # 3. Distribuição de Estoque (Pie Chart)
    distribuicao = db.query(
        LoteORM.produto_id,
        func.sum(LoteORM.quantidade_disponivel).label("total")
    ).group_by(LoteORM.produto_id).all()

    chart_data = []
    for dist in distribuicao:
        prod = db.query(ProdutoORM).filter(ProdutoORM.id == dist.produto_id).first()
        nome = prod.nome if prod else dist.produto_id
        chart_data.append({"name": nome, "value": int(dist.total)})

    return {
        "cards": {
            "total_produtos": total_produtos,
            "total_lotes": total_lotes,
            "total_clientes": total_clientes,
            "total_fornecedores": total_fornecedores,
            "total_pedidos_compra": total_pedidos_compra,
            "total_pedidos_venda": total_pedidos_venda,
            "total_vendas": receita,
            "saldo_caixa": receita - despesa,
            "total_despesas": despesa,
        },
        "serie_temporal": serie,
        "chart_data": chart_data,
    }
