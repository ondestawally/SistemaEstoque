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
    from infrastructure.orm_models.robust_models import LancamentoFinanceiroORM, ClienteORM, PedidoVendaORM, StatusPedidoVenda
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

    # 4. Métricas Fase 6 (Enterprise)
    from infrastructure.orm_models.phase6_models import (
        NotaFiscalEntradaORM, NotaFiscalSaidaORM, LancamentoContabilORM,
        ContratoORM, SolicitacaoCompraORM
    )
    # Valor Total Estoque (Custo Médio aproximado baseado em entradas)
    valor_estoque = db.query(func.sum(NotaFiscalEntradaORM.valor_total)).scalar() or 0
    
    # Contratos Ativos
    contratos_ativos = db.query(ContratoORM).filter(ContratoORM.data_fim >= hoje).count()
    
    # Pendências Compras
    compras_pendentes = db.query(SolicitacaoCompraORM).filter(SolicitacaoCompraORM).count()
    
    # Pendências Logística (Faturados aguardando expedição)
    expedicao_pendente = db.query(PedidoVendaORM).filter(
        PedidoVendaORM.status == StatusPedidoVenda.FATURADO,
        PedidoVendaORM.codigo_rastreio == None
    ).count()

    # Saldo Contábil do mês
    debito_total = db.query(func.sum(LancamentoContabilORM.total_debitos)).scalar() or 0
    credito_total = db.query(func.sum(LancamentoContabilORM.total_creditos)).scalar() or 0

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
            # Novos Fase 6
            "valor_estoque": float(valor_estoque),
            "contratos_ativos": contratos_ativos,
            "compras_pendentes": compras_pendentes,
            "expedicao_pendente": expedicao_pendente,
            "saldo_contabil": float(debito_total - credito_total)
        },
        "serie_temporal": serie,
        "chart_data": chart_data,
    }

