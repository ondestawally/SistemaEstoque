from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database import get_db
from infrastructure.orm_models.crm_models import LeadORM, OportunidadeORM, VendedorORM, StatusLead, EtapaVenda
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from presentation.api.routers.auth_router import require_role

router = APIRouter(prefix="/crm", tags=["CRM & Vendas"])

class LeadDTO(BaseModel):
    id: str
    nome_contato: str
    empresa: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    status: str = "NOVO"
    observacoes: Optional[str] = None

class OportunidadeDTO(BaseModel):
    id: str
    lead_id: str
    vendedor_id: str
    titulo: str
    valor_estimado: float
    etapa: str = "PROSPECCAO"
    data_fechamento_estimada: Optional[str] = None

@router.get("/leads", response_model=List[LeadDTO])
def listar_leads(db: Session = Depends(get_db)):
    return db.query(LeadORM).all()

@router.post("/leads", status_code=201)
def criar_lead(dto: LeadDTO, db: Session = Depends(get_db)):
    lead = LeadORM(**dto.dict())
    db.add(lead)
    db.commit()
    return {"message": "Lead criado com sucesso"}

@router.get("/oportunidades")
def listar_oportunidades(db: Session = Depends(get_db)):
    ops = db.query(OportunidadeORM).all()
    return [
        {
            "id": o.id,
            "titulo": o.titulo,
            "valor": o.valor_estimado,
            "etapa": o.etapa.value,
            "vendedor": o.vendedor.nome if o.vendedor else "N/A",
            "lead": o.lead.nome_contato if o.lead else "N/A"
        } for o in ops
    ]

@router.post("/oportunidades", status_code=201)
def criar_oportunidade(dto: OportunidadeDTO, db: Session = Depends(get_db)):
    op = OportunidadeORM(
        id=dto.id,
        lead_id=dto.lead_id,
        vendedor_id=dto.vendedor_id,
        titulo=dto.titulo,
        valor_estimado=dto.valor_estimado,
        etapa=EtapaVenda(dto.etapa),
        data_fechamento_estimada=datetime.strptime(dto.data_fechamento_estimada, "%Y-%m-%d").date() if dto.data_fechamento_estimada else None
    )
    db.add(op)
    db.commit()
    return {"message": "Oportunidade criada"}

@router.patch("/oportunidades/{id}/etapa")
def mudar_etapa(id: str, etapa: str, db: Session = Depends(get_db)):
    op = db.query(OportunidadeORM).filter(OportunidadeORM.id == id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Não encontrada")
    op.etapa = EtapaVenda(etapa)
    db.commit()
    return {"message": f"Etapa alterada para {etapa}"}

@router.get("/vendedores")
def listar_vendedores(db: Session = Depends(get_db)):
    return db.query(VendedorORM).filter(VendedorORM.ativo == True).all()

@router.get("/funil")
def get_funil_stats(db: Session = Depends(get_db)):
    """Retorna estatísticas simplificadas para o gráfico de funil."""
    stats = {}
    for etapa in EtapaVenda:
        count = db.query(OportunidadeORM).filter(OportunidadeORM.etapa == etapa).count()
        stats[etapa.value] = count
    return stats
