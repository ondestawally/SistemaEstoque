"""
Router — Compras Workflow Completo
Solicitação → Cotação → Pedido → Aprovação → Conferência → NF Entrada
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import (
    SolicitacaoCompraORM, CotacaoORM, ItemCotacaoORM,
    ConferenciaFisicaORM, NotaFiscalEntradaORM, ItemNotaFiscalEntradaORM
)

router = APIRouter(prefix="/compras", tags=["Compras - Workflow"])


class SolicitacaoDTO(BaseModel):
    id: str
    solicitante: str
    produto_id: str
    quantidade: float
    justificativa: str
    urgencia: str = "NORMAL"
    data_necessidade: Optional[str] = None


class ItemCotacaoDTO(BaseModel):
    fornecedor_id: str
    fornecedor_nome: str
    preco_unitario: float
    condicao_pagamento: str = "30 dias"
    prazo_entrega_dias: int = 7
    observacao: Optional[str] = None


class CotacaoDTO(BaseModel):
    id: str
    solicitacao_id: str
    itens: List[ItemCotacaoDTO]


class ConferenciaDTO(BaseModel):
    id: str
    pedido_id: str
    produto_id: str
    quantidade_pedida: float
    quantidade_recebida: float
    responsavel: Optional[str] = None
    observacao: Optional[str] = None


class NFEntradaDTO(BaseModel):
    id: str
    numero: str
    serie: str
    emitente_cnpj: str
    emitente_nome: str
    pedido_id: Optional[str] = None
    valor_total: float
    data_emissao: str
    chave_acesso: Optional[str] = None
    observacao: Optional[str] = None
    itens: List[dict] # [{produto_id, quantidade, valor_unitario}]


# --- SOLICITAÇÕES ---
@router.post("/solicitacoes/", status_code=201)
def criar_solicitacao(dto: SolicitacaoDTO, db: Session = Depends(get_db)):
    orm = SolicitacaoCompraORM(
        id=dto.id, solicitante=dto.solicitante, produto_id=dto.produto_id,
        quantidade=dto.quantidade, justificativa=dto.justificativa,
        urgencia=dto.urgencia, status="RASCUNHO"
    )
    db.add(orm)
    db.commit()
    return {"message": "Solicitação criada", "id": dto.id}


@router.get("/solicitacoes/")
def listar_solicitacoes(db: Session = Depends(get_db)):
    items = db.query(SolicitacaoCompraORM).order_by(SolicitacaoCompraORM.data_criacao.desc()).all()
    return [
        {
            "id": s.id, "solicitante": s.solicitante, "produto_id": s.produto_id,
            "quantidade": s.quantidade, "urgencia": s.urgencia, "status": s.status,
            "data_criacao": str(s.data_criacao),
        }
        for s in items
    ]


TRANSICOES_SOL = {
    "RASCUNHO": "APROVADA", "APROVADA": "COTANDO",
    "COTANDO": "PEDIDO_EMITIDO", "PEDIDO_EMITIDO": "FINALIZADA"
}


@router.patch("/solicitacoes/{sol_id}/status")
def avancar_solicitacao(sol_id: str, db: Session = Depends(get_db)):
    sol = db.query(SolicitacaoCompraORM).filter(SolicitacaoCompraORM.id == sol_id).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    proximo = TRANSICOES_SOL.get(sol.status)
    if not proximo:
        raise HTTPException(status_code=400, detail=f"Status '{sol.status}' não pode avançar")
    sol.status = proximo
    db.commit()
    return {"message": f"Status → {proximo}", "novo_status": proximo}


# --- COTAÇÕES ---
@router.post("/cotacoes/", status_code=201)
def criar_cotacao(dto: CotacaoDTO, db: Session = Depends(get_db)):
    cotacao = CotacaoORM(id=dto.id, solicitacao_id=dto.solicitacao_id, status="ABERTA")
    db.add(cotacao)
    for item in dto.itens:
        item_orm = ItemCotacaoORM(
            cotacao_id=dto.id, fornecedor_id=item.fornecedor_id,
            fornecedor_nome=item.fornecedor_nome, preco_unitario=item.preco_unitario,
            condicao_pagamento=item.condicao_pagamento,
            prazo_entrega_dias=item.prazo_entrega_dias, observacao=item.observacao
        )
        db.add(item_orm)
    db.commit()
    return {"message": "Cotação criada", "id": dto.id}


@router.get("/cotacoes/")
def listar_cotacoes(db: Session = Depends(get_db)):
    cotacoes = db.query(CotacaoORM).order_by(CotacaoORM.data_criacao.desc()).all()
    return [
        {
            "id": c.id, "solicitacao_id": c.solicitacao_id, "status": c.status,
            "fornecedor_vencedor_id": c.fornecedor_vencedor_id,
            "itens": [
                {"fornecedor_id": i.fornecedor_id, "fornecedor_nome": i.fornecedor_nome,
                 "preco_unitario": i.preco_unitario, "prazo_entrega_dias": i.prazo_entrega_dias}
                for i in c.itens
            ]
        }
        for c in cotacoes
    ]


@router.patch("/cotacoes/{cot_id}/aprovar")
def aprovar_cotacao(cot_id: str, fornecedor_id: str, db: Session = Depends(get_db)):
    cotacao = db.query(CotacaoORM).filter(CotacaoORM.id == cot_id).first()
    if not cotacao:
        raise HTTPException(status_code=404, detail="Cotação não encontrada")
    cotacao.fornecedor_vencedor_id = fornecedor_id
    cotacao.status = "APROVADA"
    db.commit()
    return {"message": f"Cotação aprovada com fornecedor {fornecedor_id}"}


# --- CONFERÊNCIA FÍSICA ---
@router.post("/conferencia/", status_code=201)
def registrar_conferencia(dto: ConferenciaDTO, db: Session = Depends(get_db)):
    conf = ConferenciaFisicaORM(
        id=dto.id, pedido_id=dto.pedido_id, produto_id=dto.produto_id,
        quantidade_pedida=dto.quantidade_pedida, quantidade_recebida=dto.quantidade_recebida,
        responsavel=dto.responsavel, observacao=dto.observacao,
        data_conferencia=datetime.utcnow()
    )
    db.add(conf)
    db.commit()
    divergencia = dto.quantidade_recebida - dto.quantidade_pedida
    return {
        "message": "Conferência registrada",
        "divergencia": divergencia,
        "aprovado": divergencia >= 0
    }


# --- NF ENTRADA ---
@router.post("/nf-entrada/", status_code=201)
def registrar_nf_entrada(dto: NFEntradaDTO, db: Session = Depends(get_db)):
    nf = NotaFiscalEntradaORM(
        id=dto.id, numero=dto.numero, serie=dto.serie,
        emitente_cnpj=dto.emitente_cnpj, emitente_nome=dto.emitente_nome,
        pedido_id=dto.pedido_id, valor_total=dto.valor_total,
        data_emissao=datetime.fromisoformat(dto.data_emissao),
        chave_acesso=dto.chave_acesso, observacao=dto.observacao
    )
    db.add(nf)

    # Adicionar itens da NF
    for item in dto.itens:
        item_orm = ItemNotaFiscalEntradaORM(
            nota_id=dto.id,
            produto_id=item['produto_id'],
            quantidade=item['quantidade'],
            valor_unitario=item['valor_unitario']
        )
        db.add(item_orm)
        
        # Atualizar Custo Médio e Saldo
        from infrastructure.orm_models.phase6_models import CustoMedioORM
        custo = db.query(CustoMedioORM).filter(CustoMedioORM.produto_id == item['produto_id']).first()
        if not custo:
            custo = CustoMedioORM(produto_id=item['produto_id'])
            db.add(custo)
        
        valor_atual = custo.custo_medio_atual * custo.quantidade_em_estoque
        nova_qtde = custo.quantidade_em_estoque + item['quantidade']
        if nova_qtde > 0:
            custo.custo_medio_atual = (valor_atual + item['quantidade'] * item['valor_unitario']) / nova_qtde
        custo.quantidade_em_estoque = nova_qtde
        custo.ultima_atualizacao = datetime.utcnow()

    # ── Integração E2E: NF Entrada → Lançamento Contábil Automático ──
    # Partida Débito: Estoque (1.1.01) | Partida Crédito: Fornecedores a Pagar (2.1.01)
    try:
        from infrastructure.orm_models.phase6_models import (
            LancamentoContabilORM, PartidaORM, ContaContabilORM
        )
        # Verifica se as contas existem; se não, não bloqueia
        conta_estoque = db.query(ContaContabilORM).filter(ContaContabilORM.codigo == "1.1.01").first()
        conta_fornec = db.query(ContaContabilORM).filter(ContaContabilORM.codigo == "2.1.01").first()

        if conta_estoque and conta_fornec:
            lanc_id = f"LANC-NF-{dto.id}"
            historico = f"NF Entrada {dto.numero}/{dto.serie} — {dto.emitente_nome}"
            lanc = LancamentoContabilORM(
                id=lanc_id, data=datetime.fromisoformat(dto.data_emissao),
                historico=historico, usuario="sistema"
            )
            db.add(lanc)
            db.add(PartidaORM(lancamento_id=lanc_id, conta_codigo="1.1.01", valor=dto.valor_total, dc="D"))
            db.add(PartidaORM(lancamento_id=lanc_id, conta_codigo="2.1.01", valor=dto.valor_total, dc="C"))
            db.commit()
            return {
                "message": "NF de entrada registrada",
                "id": dto.id,
                "integracao_contabil": {
                    "lancamento_id": lanc_id,
                    "debito": "1.1.01 — Estoque",
                    "credito": "2.1.01 — Fornecedores a Pagar",
                    "valor": dto.valor_total
                }
            }
    except Exception:
        pass  # Integração opcional — não bloqueia caso contas não existam

    db.commit()
    return {"message": "NF de entrada registrada", "id": dto.id, "integracao_contabil": None}


@router.get("/nf-entrada/")
def listar_nf_entrada(db: Session = Depends(get_db)):
    nfs = db.query(NotaFiscalEntradaORM).order_by(NotaFiscalEntradaORM.data_entrada.desc()).all()
    return [
        {
            "id": n.id, "numero": n.numero, "serie": n.serie,
            "emitente_nome": n.emitente_nome, "valor_total": float(n.valor_total),
            "data_emissao": str(n.data_emissao), "pedido_id": n.pedido_id
        }
        for n in nfs
    ]

