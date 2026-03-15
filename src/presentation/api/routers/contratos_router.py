"""
Router — Contratos
Contrato com fornecedor/cliente, alertas de vencimento, renovação
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import ContratoORM

router = APIRouter(prefix="/contratos", tags=["Contratos"])


class ContratoDTO(BaseModel):
    id: str
    tipo: str  # FORNECEDOR, CLIENTE, SERVICO
    parceiro_id: str
    parceiro_nome: str
    objeto: str
    valor_mensal: float = 0.0
    data_inicio: str
    data_fim: str
    numero_contrato: Optional[str] = None
    condicao_pagamento: Optional[str] = None
    observacao: Optional[str] = None


class RenovacaoDTO(BaseModel):
    nova_data_fim: str
    novo_valor_mensal: Optional[float] = None


@router.post("/", status_code=201)
def criar_contrato(dto: ContratoDTO, db: Session = Depends(get_db)):
    contrato = ContratoORM(
        id=dto.id, tipo=dto.tipo, parceiro_id=dto.parceiro_id,
        parceiro_nome=dto.parceiro_nome, objeto=dto.objeto,
        valor_mensal=dto.valor_mensal,
        data_inicio=date.fromisoformat(dto.data_inicio),
        data_fim=date.fromisoformat(dto.data_fim),
        status="ATIVO", numero_contrato=dto.numero_contrato,
        condicao_pagamento=dto.condicao_pagamento, observacao=dto.observacao
    )
    db.add(contrato)
    db.commit()
    return {"message": "Contrato criado", "id": dto.id}


@router.get("/")
def listar_contratos(db: Session = Depends(get_db)):
    contratos = db.query(ContratoORM).order_by(ContratoORM.data_fim).all()
    hoje = date.today()
    return [
        {
            "id": c.id, "tipo": c.tipo, "parceiro_nome": c.parceiro_nome,
            "objeto": c.objeto[:60] + "..." if len(c.objeto) > 60 else c.objeto,
            "valor_mensal": float(c.valor_mensal or 0),
            "data_inicio": str(c.data_inicio), "data_fim": str(c.data_fim),
            "status": c.status, "numero_contrato": c.numero_contrato,
            "dias_para_vencer": (c.data_fim - hoje).days,
            "alerta_vencimento": 0 < (c.data_fim - hoje).days <= 30,
        }
        for c in contratos
    ]


@router.get("/vencendo/")
def contratos_vencendo(dias: int = 30, db: Session = Depends(get_db)):
    """Contratos que vencem nos próximos N dias."""
    todos = listar_contratos(db)
    return [c for c in todos if 0 < c["dias_para_vencer"] <= dias and c["status"] == "ATIVO"]


@router.patch("/{contrato_id}/renovar")
def renovar_contrato(contrato_id: str, dto: RenovacaoDTO, db: Session = Depends(get_db)):
    contrato = db.query(ContratoORM).filter(ContratoORM.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    contrato.data_inicio = date.today()
    contrato.data_fim = date.fromisoformat(dto.nova_data_fim)
    if dto.novo_valor_mensal is not None:
        contrato.valor_mensal = dto.novo_valor_mensal
    contrato.status = "RENOVADO"
    db.commit()
    return {"message": "Contrato renovado", "nova_data_fim": dto.nova_data_fim}


@router.patch("/{contrato_id}/cancelar")
def cancelar_contrato(contrato_id: str, db: Session = Depends(get_db)):
    contrato = db.query(ContratoORM).filter(ContratoORM.id == contrato_id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    contrato.status = "CANCELADO"
    db.commit()
    return {"message": "Contrato cancelado"}
