from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database import get_db
from infrastructure.orm_models.crm_models import ContratoORM
from infrastructure.orm_models.robust_models import ClienteORM
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/contratos", tags=["Gestão de Contratos"])

class ContratoDTO(BaseModel):
    id: str
    cliente_id: str
    titulo: str
    valor_recorrente: float
    dia_faturamento: int = 1
    data_inicio: str
    data_fim: Optional[str] = None

@router.get("/")
def listar_contratos(db: Session = Depends(get_db)):
    contratos = db.query(ContratoORM).all()
    return [
        {
            "id": c.id,
            "cliente": c.cliente.razao_social if c.cliente else "N/A",
            "titulo": c.titulo,
            "valor": c.valor_recorrente,
            "dia_faturamento": c.dia_faturamento,
            "status": "Ativo" if c.ativo else "Inativo"
        } for c in contratos
    ]

@router.post("/", status_code=201)
def criar_contrato(dto: ContratoDTO, db: Session = Depends(get_db)):
    contrato = ContratoORM(
        id=dto.id,
        cliente_id=dto.cliente_id,
        titulo=dto.titulo,
        valor_recorrente=dto.valor_recorrente,
        dia_faturamento=dto.dia_faturamento,
        data_inicio=datetime.strptime(dto.data_inicio, "%Y-%m-%d").date(),
        data_fim=datetime.strptime(dto.data_fim, "%Y-%m-%d").date() if dto.data_fim else None
    )
    db.add(contrato)
    db.commit()
    return {"message": "Contrato registrado"}

@router.post("/{id}/faturar")
def gerar_faturamento_contrato(id: str, db: Session = Depends(get_db)):
    """Simula a geração de um pedido de venda baseado no contrato."""
    contrato = db.query(ContratoORM).filter(ContratoORM.id == id).first()
    if not contrato:
        raise HTTPException(status_code=404, detail="Não encontrado")
    
    # Aqui criaria um PedidoVendaORM automaticamente
    return {"message": f"Faturamento gerado para o contrato {id} no valor de R$ {contrato.valor_recorrente}"}
