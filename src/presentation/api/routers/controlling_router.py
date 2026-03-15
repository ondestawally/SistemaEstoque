"""
Router — Controlling (Orçamento & Planejamento)
Centros de Custo, Plano Orçamentário, Realizado, Variações
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

from infrastructure.database import get_db
from infrastructure.orm_models.controlling_models import (
    CentroCustoORM, PlanoOrcamentarioORM, RealizadoCustoORM
)
from presentation.api.routers.auth_router import require_role, get_current_user
from infrastructure.audit import log_audit
from infrastructure.orm_models.auth_models import UserORM

router = APIRouter(
    prefix="/controlling", 
    tags=["Controlling - Orçamento"],
    dependencies=[Depends(require_role(["ADMIN", "FINANCE_USER"]))]
)

MES_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']


# ─────────────────────────── DTOs ───────────────────────────

class CentroCustoDTO(BaseModel):
    id: str
    codigo: str
    nome: str
    tipo: str  # PRODUCAO, ADMINISTRATIVO, VENDAS, TI, LOGISTICA, RH
    responsavel: Optional[str] = None


class PlanoDTO(BaseModel):
    id: str
    ano: int
    mes: int
    centro_custo_id: str
    conta_codigo: str
    valor_orcado: float
    observacao: Optional[str] = None

    @validator("mes")
    def mes_valido(cls, v):
        if not (1 <= v <= 12):
            raise ValueError("Mês deve ser entre 1 e 12")
        return v

    @validator("valor_orcado")
    def valor_nao_negativo(cls, v):
        if v < 0:
            raise ValueError("Valor não pode ser negativo")
        return v


class RealizadoDTO(BaseModel):
    id: str
    ano: int
    mes: int
    centro_custo_id: str
    conta_codigo: str
    valor_realizado: float
    descricao: Optional[str] = None


# ─────────────────────────── CENTROS DE CUSTO ───────────────────────────

@router.post("/centros-custo/", status_code=201)
def criar_centro_custo(dto: CentroCustoDTO, db: Session = Depends(get_db)):
    if db.query(CentroCustoORM).filter(CentroCustoORM.codigo == dto.codigo).first():
        raise HTTPException(status_code=409, detail=f"Código '{dto.codigo}' já existe")
    orm = CentroCustoORM(id=dto.id, codigo=dto.codigo, nome=dto.nome,
                         tipo=dto.tipo, responsavel=dto.responsavel)
    db.add(orm); db.commit()
    return {"message": "Centro de custo criado", "id": dto.id}


@router.get("/centros-custo/")
def listar_centros_custo(db: Session = Depends(get_db)):
    ccs = db.query(CentroCustoORM).filter(CentroCustoORM.ativo == True).order_by(CentroCustoORM.codigo).all()
    return [{"id": c.id, "codigo": c.codigo, "nome": c.nome, "tipo": c.tipo, "responsavel": c.responsavel} for c in ccs]


# ─────────────────────────── PLANO ORÇAMENTÁRIO ───────────────────────────

@router.post("/orcamento/", status_code=201)
def lancar_orcamento(dto: PlanoDTO, db: Session = Depends(get_db), current_user: UserORM = Depends(get_current_user)):
    orm = PlanoOrcamentarioORM(
        id=dto.id, ano=dto.ano, mes=dto.mes,
        centro_custo_id=dto.centro_custo_id, conta_codigo=dto.conta_codigo,
        valor_orcado=dto.valor_orcado, observacao=dto.observacao
    )
    db.add(orm); db.commit()
    
    log_audit(db, current_user.id, current_user.username, "CREATE", "PlanoOrcamentario", dto.id, {"centro_custo_id": dto.centro_custo_id, "mes": dto.mes, "ano": dto.ano, "valor": dto.valor_orcado})
    
    return {"message": "Orçamento lançado"}


@router.get("/orcamento/")
def listar_orcamento(ano: int, centro_custo_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(PlanoOrcamentarioORM).filter(PlanoOrcamentarioORM.ano == ano)
    if centro_custo_id:
        q = q.filter(PlanoOrcamentarioORM.centro_custo_id == centro_custo_id)
    registros = q.order_by(PlanoOrcamentarioORM.mes, PlanoOrcamentarioORM.conta_codigo).all()
    return [
        {
            "id": r.id, "ano": r.ano, "mes": r.mes, "mes_nome": MES_NAMES[r.mes],
            "centro_custo_id": r.centro_custo_id, "conta_codigo": r.conta_codigo,
            "valor_orcado": float(r.valor_orcado), "observacao": r.observacao,
        }
        for r in registros
    ]


# ─────────────────────────── REALIZADO ───────────────────────────

@router.post("/realizado/", status_code=201)
def lancar_realizado(dto: RealizadoDTO, db: Session = Depends(get_db), current_user: UserORM = Depends(get_current_user)):
    orm = RealizadoCustoORM(
        id=dto.id, ano=dto.ano, mes=dto.mes,
        centro_custo_id=dto.centro_custo_id, conta_codigo=dto.conta_codigo,
        valor_realizado=dto.valor_realizado, descricao=dto.descricao
    )
    db.add(orm); db.commit()
    
    log_audit(db, current_user.id, current_user.username, "CREATE", "RealizadoCusto", dto.id, {"centro_custo_id": dto.centro_custo_id, "valor": dto.valor_realizado})
    
    return {"message": "Realizado lançado"}


# ─────────────────────────── VARIAÇÕES (Real vs Orçado) ───────────────────────────

@router.get("/variacao/")
def calcular_variacao(ano: int, mes: Optional[int] = None, centro_custo_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Compara Orçado vs Realizado por centro de custo × conta × mês.
    Retorna variação absoluta, percentual e status (OK/ATENCAO/CRITICO).
    """
    # Query orçado
    q_orc = db.query(
        PlanoOrcamentarioORM.centro_custo_id,
        PlanoOrcamentarioORM.conta_codigo,
        PlanoOrcamentarioORM.mes,
        func.sum(PlanoOrcamentarioORM.valor_orcado).label("orcado")
    ).filter(PlanoOrcamentarioORM.ano == ano)
    if mes: q_orc = q_orc.filter(PlanoOrcamentarioORM.mes == mes)
    if centro_custo_id: q_orc = q_orc.filter(PlanoOrcamentarioORM.centro_custo_id == centro_custo_id)
    orc_rows = q_orc.group_by(PlanoOrcamentarioORM.centro_custo_id, PlanoOrcamentarioORM.conta_codigo, PlanoOrcamentarioORM.mes).all()

    # Query realizado
    q_real = db.query(
        RealizadoCustoORM.centro_custo_id,
        RealizadoCustoORM.conta_codigo,
        RealizadoCustoORM.mes,
        func.sum(RealizadoCustoORM.valor_realizado).label("realizado")
    ).filter(RealizadoCustoORM.ano == ano)
    if mes: q_real = q_real.filter(RealizadoCustoORM.mes == mes)
    if centro_custo_id: q_real = q_real.filter(RealizadoCustoORM.centro_custo_id == centro_custo_id)
    real_rows = q_real.group_by(RealizadoCustoORM.centro_custo_id, RealizadoCustoORM.conta_codigo, RealizadoCustoORM.mes).all()

    # Mapear centros de custo
    ccs = {c.id: c.nome for c in db.query(CentroCustoORM).all()}

    # Montar dict realizado
    real_map = {(r.centro_custo_id, r.conta_codigo, r.mes): float(r.realizado) for r in real_rows}

    resultado = []
    for row in orc_rows:
        key = (row.centro_custo_id, row.conta_codigo, row.mes)
        orcado = float(row.orcado)
        realizado = real_map.get(key, 0.0)
        variacao_abs = round(realizado - orcado, 2)
        variacao_pct = round((variacao_abs / orcado) * 100, 1) if orcado != 0 else None

        if variacao_pct is None:
            status = "SEM_ORCAMENTO"
        elif abs(variacao_pct) <= 5:
            status = "OK"
        elif abs(variacao_pct) <= 10:
            status = "ATENCAO"
        else:
            status = "CRITICO"

        resultado.append({
            "centro_custo_id": row.centro_custo_id,
            "centro_custo_nome": ccs.get(row.centro_custo_id, row.centro_custo_id),
            "conta_codigo": row.conta_codigo,
            "mes": row.mes,
            "mes_nome": MES_NAMES[row.mes],
            "ano": ano,
            "orcado": orcado,
            "realizado": realizado,
            "variacao_absoluta": variacao_abs,
            "variacao_percentual": variacao_pct,
            "status": status,
        })

    return sorted(resultado, key=lambda x: (x["mes"], x["centro_custo_id"]))


@router.get("/resumo/")
def resumo_controlling(ano: int, db: Session = Depends(get_db)):
    total_orcado = db.query(func.sum(PlanoOrcamentarioORM.valor_orcado)).filter(
        PlanoOrcamentarioORM.ano == ano).scalar() or 0.0
    total_realizado = db.query(func.sum(RealizadoCustoORM.valor_realizado)).filter(
        RealizadoCustoORM.ano == ano).scalar() or 0.0
    num_centros = db.query(CentroCustoORM).filter(CentroCustoORM.ativo == True).count()
    return {
        "ano": ano,
        "total_orcado": float(total_orcado),
        "total_realizado": float(total_realizado),
        "variacao_total": round(float(total_realizado - total_orcado), 2),
        "num_centros_custo": num_centros,
    }
