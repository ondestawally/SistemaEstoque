"""
Router — Contabilidade
Plano de Contas, Lançamentos D/C (Partidas Dobradas), Balancete
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import date, datetime

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import (
    ContaContabilORM, LancamentoContabilORM, PartidaORM
)

router = APIRouter(prefix="/contabilidade", tags=["Contabilidade"])


# ─────────────────────────── DTOs ───────────────────────────

class ContaDTO(BaseModel):
    codigo: str
    nome: str
    tipo: str          # ATIVO, PASSIVO, RECEITA, DESPESA, PATRIMONIO
    natureza: str      # DEVEDORA, CREDORA
    descricao: Optional[str] = None

    @validator("tipo")
    def tipo_valido(cls, v):
        validos = {"ATIVO", "PASSIVO", "RECEITA", "DESPESA", "PATRIMONIO"}
        if v.upper() not in validos:
            raise ValueError(f"Tipo inválido: {v}. Permitidos: {validos}")
        return v.upper()

    @validator("natureza")
    def natureza_valida(cls, v):
        if v.upper() not in {"DEVEDORA", "CREDORA"}:
            raise ValueError("Natureza deve ser DEVEDORA ou CREDORA")
        return v.upper()


class PartidaDTO(BaseModel):
    conta_codigo: str
    valor: float
    dc: str  # "D" ou "C"

    @validator("dc")
    def dc_valido(cls, v):
        if v.upper() not in ("D", "C"):
            raise ValueError("DC deve ser 'D' (Débito) ou 'C' (Crédito)")
        return v.upper()

    @validator("valor")
    def valor_positivo(cls, v):
        if v <= 0:
            raise ValueError("Valor deve ser positivo")
        return v


class LancamentoDTO(BaseModel):
    id: str
    data: str           # ISO date: "2026-03-15"
    historico: str
    partidas: List[PartidaDTO]
    usuario: Optional[str] = None


# ─────────────────────────── CONTAS ───────────────────────────

@router.post("/contas/", status_code=201)
def criar_conta(dto: ContaDTO, db: Session = Depends(get_db)):
    existente = db.query(ContaContabilORM).filter(
        ContaContabilORM.codigo == dto.codigo
    ).first()
    if existente:
        raise HTTPException(status_code=409, detail=f"Conta '{dto.codigo}' já existe")

    conta = ContaContabilORM(
        codigo=dto.codigo,
        nome=dto.nome,
        tipo=dto.tipo,
        natureza=dto.natureza,
        descricao=dto.descricao,
        ativo=True
    )
    db.add(conta)
    db.commit()
    return {"message": "Conta criada", "codigo": dto.codigo}


@router.get("/contas/")
def listar_contas(tipo: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(ContaContabilORM).filter(ContaContabilORM.ativo == True)
    if tipo:
        q = q.filter(ContaContabilORM.tipo == tipo.upper())
    contas = q.order_by(ContaContabilORM.codigo).all()
    return [
        {
            "codigo": c.codigo,
            "nome": c.nome,
            "tipo": c.tipo,
            "natureza": c.natureza,
            "descricao": c.descricao,
        }
        for c in contas
    ]


# ─────────────────────────── LANÇAMENTOS ───────────────────────────

@router.post("/lancamentos/", status_code=201)
def criar_lancamento(dto: LancamentoDTO, db: Session = Depends(get_db)):
    # Validar equilíbrio D/C
    total_debito = sum(p.valor for p in dto.partidas if p.dc == "D")
    total_credito = sum(p.valor for p in dto.partidas if p.dc == "C")
    if round(total_debito, 2) != round(total_credito, 2):
        raise HTTPException(
            status_code=400,
            detail=f"Lançamento desequilibrado: Débitos R$ {total_debito:.2f} ≠ Créditos R$ {total_credito:.2f}"
        )

    # Verificar contas existem
    for p in dto.partidas:
        conta = db.query(ContaContabilORM).filter(
            ContaContabilORM.codigo == p.conta_codigo
        ).first()
        if not conta:
            raise HTTPException(
                status_code=404, detail=f"Conta '{p.conta_codigo}' não encontrada"
            )

    lancamento = LancamentoContabilORM(
        id=dto.id,
        data=date.fromisoformat(dto.data),
        historico=dto.historico,
        usuario=dto.usuario,
        criado_em=datetime.utcnow()
    )
    db.add(lancamento)

    for p in dto.partidas:
        partida = PartidaORM(
            lancamento_id=dto.id,
            conta_codigo=p.conta_codigo,
            valor=p.valor,
            dc=p.dc
        )
        db.add(partida)

    db.commit()
    return {
        "message": "Lançamento criado",
        "id": dto.id,
        "total_debito": total_debito,
        "total_credito": total_credito
    }


@router.get("/lancamentos/")
def listar_lancamentos(
    data_ini: Optional[str] = None,
    data_fim: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(LancamentoContabilORM)
    if data_ini:
        q = q.filter(LancamentoContabilORM.data >= date.fromisoformat(data_ini))
    if data_fim:
        q = q.filter(LancamentoContabilORM.data <= date.fromisoformat(data_fim))
    lancamentos = q.order_by(LancamentoContabilORM.data.desc()).all()
    return [
        {
            "id": l.id,
            "data": str(l.data),
            "historico": l.historico,
            "usuario": l.usuario,
            "criado_em": str(l.criado_em),
            "partidas": [
                {
                    "conta_codigo": p.conta_codigo,
                    "valor": float(p.valor),
                    "dc": p.dc
                }
                for p in l.partidas
            ]
        }
        for l in lancamentos
    ]


# ─────────────────────────── BALANCETE ───────────────────────────

@router.get("/balancete/")
def gerar_balancete(
    data_ini: Optional[str] = None,
    data_fim: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retorna saldo por conta no período: total_debito, total_credito, saldo_liquido.
    """
    q = db.query(
        PartidaORM.conta_codigo,
        PartidaORM.dc,
        func.sum(PartidaORM.valor).label("total")
    ).join(
        LancamentoContabilORM, PartidaORM.lancamento_id == LancamentoContabilORM.id
    )
    if data_ini:
        q = q.filter(LancamentoContabilORM.data >= date.fromisoformat(data_ini))
    if data_fim:
        q = q.filter(LancamentoContabilORM.data <= date.fromisoformat(data_fim))

    rows = q.group_by(PartidaORM.conta_codigo, PartidaORM.dc).all()

    # Agrupa por conta
    saldos: dict = {}
    for conta_codigo, dc, total in rows:
        if conta_codigo not in saldos:
            saldos[conta_codigo] = {"debito": 0.0, "credito": 0.0}
        if dc == "D":
            saldos[conta_codigo]["debito"] += float(total)
        else:
            saldos[conta_codigo]["credito"] += float(total)

    # Busca metadados das contas
    contas_map = {
        c.codigo: c
        for c in db.query(ContaContabilORM).filter(
            ContaContabilORM.codigo.in_(list(saldos.keys()))
        ).all()
    }

    resultado = []
    for codigo, vals in sorted(saldos.items()):
        conta = contas_map.get(codigo)
        debito = vals["debito"]
        credito = vals["credito"]
        natureza = conta.natureza if conta else "DEVEDORA"
        saldo = (debito - credito) if natureza == "DEVEDORA" else (credito - debito)
        resultado.append({
            "codigo": codigo,
            "nome": conta.nome if conta else codigo,
            "tipo": conta.tipo if conta else "?",
            "natureza": natureza,
            "total_debito": debito,
            "total_credito": credito,
            "saldo": saldo,
        })

    total_d = sum(r["total_debito"] for r in resultado)
    total_c = sum(r["total_credito"] for r in resultado)

    return {
        "periodo": {"data_ini": data_ini, "data_fim": data_fim},
        "contas": resultado,
        "totais": {"total_debito": total_d, "total_credito": total_c, "equilibrado": round(total_d, 2) == round(total_c, 2)},
    }
