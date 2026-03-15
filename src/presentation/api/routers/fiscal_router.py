"""
Router — Fiscal
Regras fiscais, Livro Fiscal, Apuração mensal
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import RegraFiscalORM, LivroFiscalORM

router = APIRouter(prefix="/fiscal", tags=["Fiscal"])


class RegraFiscalDTO(BaseModel):
    id: str
    produto_id: str
    uf_origem: str
    uf_destino: str
    cfop: str
    aliquota_icms: float = 0.0
    aliquota_pis: float = 0.0
    aliquota_cofins: float = 0.0
    aliquota_ipi: float = 0.0


class LivroFiscalDTO(BaseModel):
    id: str
    tipo: str  # ENTRADA, SAIDA
    data: str
    participante_cnpj: str
    participante_nome: str
    numero_nf: str
    serie_nf: str = "1"
    cfop: str
    valor_contabil: float
    valor_icms: float = 0.0
    valor_pis: float = 0.0
    valor_cofins: float = 0.0
    valor_ipi: float = 0.0
    produto_id: Optional[str] = None


@router.post("/regras/", status_code=201)
def criar_regra(dto: RegraFiscalDTO, db: Session = Depends(get_db)):
    orm = RegraFiscalORM(**dto.dict())
    db.add(orm)
    db.commit()
    return {"message": "Regra fiscal cadastrada"}


@router.get("/regras/")
def listar_regras(db: Session = Depends(get_db)):
    regras = db.query(RegraFiscalORM).filter(RegraFiscalORM.ativo == True).all()
    return [
        {
            "id": r.id, "produto_id": r.produto_id, "uf_origem": r.uf_origem,
            "uf_destino": r.uf_destino, "cfop": r.cfop,
            "aliquota_icms": r.aliquota_icms, "aliquota_pis": r.aliquota_pis,
            "aliquota_cofins": r.aliquota_cofins, "aliquota_ipi": r.aliquota_ipi
        }
        for r in regras
    ]


@router.post("/livro/", status_code=201)
def lancar_livro(dto: LivroFiscalDTO, db: Session = Depends(get_db)):
    data = datetime.fromisoformat(dto.data)
    orm = LivroFiscalORM(
        id=dto.id, tipo=dto.tipo, data=data,
        participante_cnpj=dto.participante_cnpj, participante_nome=dto.participante_nome,
        numero_nf=dto.numero_nf, serie_nf=dto.serie_nf, cfop=dto.cfop,
        valor_contabil=dto.valor_contabil, valor_icms=dto.valor_icms,
        valor_pis=dto.valor_pis, valor_cofins=dto.valor_cofins, valor_ipi=dto.valor_ipi,
        produto_id=dto.produto_id, mes_referencia=data.month, ano_referencia=data.year
    )
    db.add(orm)
    db.commit()
    return {"message": "Lançamento no livro fiscal realizado"}


@router.get("/apuracao/")
def apuracao_mensal(mes: int, ano: int, db: Session = Depends(get_db)):
    """Apura os tributos do período (mês/ano)."""
    lancamentos = db.query(LivroFiscalORM).filter(
        LivroFiscalORM.mes_referencia == mes,
        LivroFiscalORM.ano_referencia == ano
    ).all()

    totais = {"icms": 0.0, "pis": 0.0, "cofins": 0.0, "ipi": 0.0, "contabil": 0.0}
    entradas = saidas = 0
    for l in lancamentos:
        totais["icms"] += float(l.valor_icms or 0)
        totais["pis"] += float(l.valor_pis or 0)
        totais["cofins"] += float(l.valor_cofins or 0)
        totais["ipi"] += float(l.valor_ipi or 0)
        totais["contabil"] += float(l.valor_contabil or 0)
        if l.tipo == "ENTRADA":
            entradas += 1
        else:
            saidas += 1

    return {
        "mes": mes, "ano": ano,
        "total_entradas": entradas, "total_saidas": saidas,
        "totais_tributos": totais,
        "total_a_recolher": round(totais["icms"] + totais["pis"] + totais["cofins"] + totais["ipi"], 2)
    }


@router.get("/livro-entradas/")
def livro_entradas(db: Session = Depends(get_db)):
    return _livro_por_tipo("ENTRADA", db)


@router.get("/livro-saidas/")
def livro_saidas(db: Session = Depends(get_db)):
    return _livro_por_tipo("SAIDA", db)


def _livro_por_tipo(tipo: str, db: Session):
    items = db.query(LivroFiscalORM).filter(LivroFiscalORM.tipo == tipo)\
        .order_by(LivroFiscalORM.data.desc()).all()
    return [
        {
            "id": l.id, "data": str(l.data), "participante_nome": l.participante_nome,
            "numero_nf": l.numero_nf, "cfop": l.cfop,
            "valor_contabil": float(l.valor_contabil or 0),
            "valor_icms": float(l.valor_icms or 0),
            "valor_pis": float(l.valor_pis or 0),
            "valor_cofins": float(l.valor_cofins or 0),
        }
        for l in items
    ]
