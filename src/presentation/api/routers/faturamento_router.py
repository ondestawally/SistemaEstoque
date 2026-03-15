"""
Router — Faturamento
Propostas Comerciais, NF de Saída
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import (
    PropostaComercialORM, ItemPropostaORM, NotaFiscalSaidaORM
)

router = APIRouter(prefix="/faturamento", tags=["Faturamento"])


class ItemPropostaDTO(BaseModel):
    produto_id: str
    produto_nome: str
    quantidade: float
    preco_unitario: float
    desconto_pct: float = 0.0


class PropostaDTO(BaseModel):
    id: str
    cliente_id: str
    validade: str  # ISO date
    itens: List[ItemPropostaDTO]
    desconto_global_pct: float = 0.0
    condicao_pagamento: str = "30 dias"
    observacao: Optional[str] = None


class NFSaidaDTO(BaseModel):
    id: str
    pedido_venda_id: str
    numero_nf: str
    serie: str = "1"
    valor_produtos: float
    valor_total: float
    chave_acesso: Optional[str] = None
    valor_icms: float = 0.0
    valor_pis: float = 0.0
    valor_cofins: float = 0.0
    valor_ipi: float = 0.0


TRANSICOES_PROPOSTA = {
    "RASCUNHO": "ENVIADA",
    "ENVIADA": "EM_NEGOCIACAO",
    "EM_NEGOCIACAO": "ACEITA",
}


@router.post("/propostas/", status_code=201)
def criar_proposta(dto: PropostaDTO, db: Session = Depends(get_db)):
    valor_total = sum(
        i.quantidade * i.preco_unitario * (1 - i.desconto_pct / 100)
        for i in dto.itens
    ) * (1 - dto.desconto_global_pct / 100)

    proposta = PropostaComercialORM(
        id=dto.id, cliente_id=dto.cliente_id,
        validade=date.fromisoformat(dto.validade),
        status="RASCUNHO", desconto_global_pct=dto.desconto_global_pct,
        condicao_pagamento=dto.condicao_pagamento, observacao=dto.observacao,
        valor_total=valor_total
    )
    db.add(proposta)
    for item in dto.itens:
        db.add(ItemPropostaORM(
            proposta_id=dto.id, produto_id=item.produto_id,
            produto_nome=item.produto_nome, quantidade=item.quantidade,
            preco_unitario=item.preco_unitario, desconto_pct=item.desconto_pct
        ))
    db.commit()
    return {"message": "Proposta criada", "id": dto.id, "valor_total": valor_total}


@router.get("/propostas/")
def listar_propostas(db: Session = Depends(get_db)):
    propostas = db.query(PropostaComercialORM).order_by(PropostaComercialORM.data_criacao.desc()).all()
    return [
        {
            "id": p.id, "cliente_id": p.cliente_id, "validade": str(p.validade),
            "status": p.status, "valor_total": float(p.valor_total or 0),
            "condicao_pagamento": p.condicao_pagamento, "data_criacao": str(p.data_criacao)
        }
        for p in propostas
    ]


@router.patch("/propostas/{proposta_id}/status")
def avancar_proposta(proposta_id: str, db: Session = Depends(get_db)):
    proposta = db.query(PropostaComercialORM).filter(PropostaComercialORM.id == proposta_id).first()
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    proximo = TRANSICOES_PROPOSTA.get(proposta.status)
    if not proximo:
        raise HTTPException(status_code=400, detail=f"Status '{proposta.status}' não pode avançar")
    proposta.status = proximo
    db.commit()
    return {"message": f"Proposta → {proximo}", "novo_status": proximo}


@router.patch("/propostas/{proposta_id}/recusar")
def recusar_proposta(proposta_id: str, db: Session = Depends(get_db)):
    proposta = db.query(PropostaComercialORM).filter(PropostaComercialORM.id == proposta_id).first()
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    proposta.status = "RECUSADA"
    db.commit()
    return {"message": "Proposta recusada"}


@router.post("/nf-saida/", status_code=201)
def emitir_nf_saida(dto: NFSaidaDTO, db: Session = Depends(get_db)):
    nf = NotaFiscalSaidaORM(**dto.dict())
    nf.data_emissao = datetime.utcnow()
    db.add(nf)

    # ── Integração E2E: NF Saída → Livro Fiscal Automático ──
    livro_id = None
    try:
        from infrastructure.orm_models.phase6_models import LivroFiscalORM
        livro = LivroFiscalORM(
            id=f"LF-{dto.id}",
            tipo="SAIDA",
            data=datetime.utcnow(),
            numero_nf=dto.numero_nf,
            serie_nf=dto.serie,
            cfop="5.102",  # CFOP padrão venda produção do estabelecimento
            valor_contabil=dto.valor_total,
            valor_icms=dto.valor_icms,
            valor_pis=dto.valor_pis,
            valor_cofins=dto.valor_cofins,
            valor_ipi=dto.valor_ipi,
            participante_cnpj="00.000.000/0000-00",
            participante_nome=f"Venda:{dto.pedido_venda_id}"
        )
        db.add(livro)
        livro_id = livro.id
    except Exception:
        pass

    db.commit()
    return {
        "message": "NF de saída emitida", 
        "id": dto.id, 
        "numero_nf": dto.numero_nf,
        "integracao_fiscal": livro_id
    }


@router.get("/nf-saida/")
def listar_nf_saida(db: Session = Depends(get_db)):
    nfs = db.query(NotaFiscalSaidaORM).order_by(NotaFiscalSaidaORM.data_emissao.desc()).all()
    return [
        {
            "id": n.id, "pedido_venda_id": n.pedido_venda_id, "numero_nf": n.numero_nf,
            "valor_total": float(n.valor_total), "status": n.status,
            "data_emissao": str(n.data_emissao)
        }
        for n in nfs
    ]
