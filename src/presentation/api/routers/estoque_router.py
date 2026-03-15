"""
Router — Estoque e Custos
Posição de estoque, Custo Médio, Curva ABC, Alertas, Ajustes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from infrastructure.database import get_db
from infrastructure.orm_models.phase6_models import (
    ParametroEstoqueORM, CustoMedioORM, AjusteEstoqueORM
)
from infrastructure.orm_models.erp_models import ProdutoORM
from infrastructure.orm_models.wms_models import LoteORM

router = APIRouter(prefix="/estoque", tags=["Estoque e Custos"])


class ParametroDTO(BaseModel):
    produto_id: str
    estoque_minimo: float = 0.0
    estoque_maximo: float = 0.0
    ponto_pedido: float = 0.0
    lead_time_dias: int = 0


class AjusteDTO(BaseModel):
    id: str
    produto_id: str
    tipo: str  # ENTRADA, SAIDA, INVENTARIO
    quantidade: float
    custo_unitario: float = 0.0
    motivo: str
    usuario: Optional[str] = None


@router.get("/posicao/")
def posicao_estoque(db: Session = Depends(get_db)):
    """Retorna saldo + custo médio por produto com alertas de mínimo."""
    produtos = db.query(ProdutoORM).filter(ProdutoORM.ativo == True).all()
    resultado = []
    for p in produtos:
        # Saldo no WMS
        saldo_wms = db.query(func.sum(LoteORM.quantidade_disponivel)).filter(
            LoteORM.produto_id == p.id
        ).scalar() or 0.0

        custo_orm = db.query(CustoMedioORM).filter(CustoMedioORM.produto_id == p.id).first()
        custo_medio = float(custo_orm.custo_medio_atual) if custo_orm else 0.0

        param = db.query(ParametroEstoqueORM).filter(
            ParametroEstoqueORM.produto_id == p.id
        ).first()
        estoque_min = float(param.estoque_minimo) if param else 0.0
        ponto_pedido = float(param.ponto_pedido) if param else 0.0

        resultado.append({
            "produto_id": p.id,
            "produto_nome": p.nome,
            "quantidade": float(saldo_wms),
            "custo_medio": custo_medio,
            "valor_total": float(saldo_wms) * custo_medio,
            "estoque_minimo": estoque_min,
            "ponto_pedido": ponto_pedido,
            "alerta_minimo": float(saldo_wms) <= estoque_min and estoque_min > 0,
            "alerta_ponto_pedido": float(saldo_wms) <= ponto_pedido and ponto_pedido > 0,
        })
    return resultado


@router.get("/alertas/")
def alertas_estoque_minimo(db: Session = Depends(get_db)):
    """Retorna apenas produtos abaixo do estoque mínimo."""
    todos = posicao_estoque(db)
    return [p for p in todos if p["alerta_minimo"]]


@router.get("/curva-abc/")
def curva_abc(db: Session = Depends(get_db)):
    """Classifica produtos em A/B/C por valor total em estoque."""
    posicao = posicao_estoque(db)
    # Ordena por valor_total desc
    posicao.sort(key=lambda x: x["valor_total"], reverse=True)
    total_geral = sum(p["valor_total"] for p in posicao) or 1
    
    acumulado = 0.0
    for p in posicao:
        acumulado += p["valor_total"]
        pct = (acumulado / total_geral) * 100
        if pct <= 80:
            p["curva_abc"] = "A"
        elif pct <= 95:
            p["curva_abc"] = "B"
        else:
            p["curva_abc"] = "C"
    return posicao


@router.post("/parametros/", status_code=201)
def salvar_parametros(dto: ParametroDTO, db: Session = Depends(get_db)):
    orm = db.query(ParametroEstoqueORM).filter(
        ParametroEstoqueORM.produto_id == dto.produto_id
    ).first()
    if not orm:
        orm = ParametroEstoqueORM(produto_id=dto.produto_id)
        db.add(orm)
    orm.estoque_minimo = dto.estoque_minimo
    orm.estoque_maximo = dto.estoque_maximo
    orm.ponto_pedido = dto.ponto_pedido
    orm.lead_time_dias = dto.lead_time_dias
    db.commit()
    return {"message": "Parâmetros salvos"}


@router.post("/ajuste/", status_code=201)
def lancar_ajuste(dto: AjusteDTO, db: Session = Depends(get_db)):
    ajuste = AjusteEstoqueORM(
        id=dto.id,
        produto_id=dto.produto_id,
        tipo=dto.tipo,
        quantidade=dto.quantidade,
        custo_unitario=dto.custo_unitario,
        motivo=dto.motivo,
        usuario=dto.usuario,
        data_ajuste=datetime.utcnow()
    )
    db.add(ajuste)

    # Atualiza custo médio
    custo_orm = db.query(CustoMedioORM).filter(CustoMedioORM.produto_id == dto.produto_id).first()
    if not custo_orm:
        custo_orm = CustoMedioORM(produto_id=dto.produto_id)
        db.add(custo_orm)

    if dto.tipo == "ENTRADA" and dto.custo_unitario > 0:
        valor_atual = custo_orm.custo_medio_atual * custo_orm.quantidade_em_estoque
        nova_qtde = custo_orm.quantidade_em_estoque + dto.quantidade
        if nova_qtde > 0:
            custo_orm.custo_medio_atual = (valor_atual + dto.quantidade * dto.custo_unitario) / nova_qtde
        custo_orm.quantidade_em_estoque = nova_qtde
    elif dto.tipo == "SAIDA":
        custo_orm.quantidade_em_estoque = max(0, custo_orm.quantidade_em_estoque - dto.quantidade)

    custo_orm.ultima_atualizacao = datetime.utcnow()
    db.commit()
    return {"message": "Ajuste lançado com sucesso"}


@router.get("/ajustes/")
def listar_ajustes(db: Session = Depends(get_db)):
    ajustes = db.query(AjusteEstoqueORM).order_by(AjusteEstoqueORM.data_ajuste.desc()).limit(100).all()
    return [
        {
            "id": a.id,
            "produto_id": a.produto_id,
            "tipo": a.tipo,
            "quantidade": a.quantidade,
            "custo_unitario": a.custo_unitario,
            "motivo": a.motivo,
            "usuario": a.usuario,
            "data_ajuste": str(a.data_ajuste),
        }
        for a in ajustes
    ]
