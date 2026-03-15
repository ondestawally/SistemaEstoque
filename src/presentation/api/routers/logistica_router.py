from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.database import get_db
from infrastructure.orm_models.robust_models import PedidoVendaORM, StatusPedidoVenda, StatusLogistica
from infrastructure.orm_models.erp_models import ProdutoORM
from infrastructure.orm_models.phase6_models import ItemNotaFiscalEntradaORM, NotaFiscalEntradaORM, ParametroEstoqueORM
from presentation.api.routers.auth_router import require_role, get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/logistica", 
    tags=["Logística & Expedição"],
    dependencies=[Depends(require_role(["ADMIN", "LOGISTICS_USER"]))]
)

class DespachoDTO(BaseModel):
    codigo_rastreio: str

@router.get("/expedicao/pendentes", response_model=List[dict])
def listar_pendentes(db: Session = Depends(get_db)):
    """Lista pedidos faturados que aguardam expedição."""
    pedidos = db.query(PedidoVendaORM).filter(
        PedidoVendaORM.status == StatusPedidoVenda.FATURADO,
        PedidoVendaORM.status_logistica != StatusLogistica.ENTREGUE
    ).all()
    
    return [
        {
            "id": p.id,
            "cliente": p.cliente.razao_social if p.cliente else "N/A",
            "data": p.data_pedido,
            "status_logistica": p.status_logistica.value,
            "valor_total": p.valor_total
        } for p in pedidos
    ]

@router.post("/expedicao/{pedido_id}/avancar")
def avancar_status_logistico(pedido_id: str, db: Session = Depends(get_db)):
    """Avança o pedido no fluxo logístico (Picking -> Packing -> Despachado)."""
    pedido = db.query(PedidoVendaORM).filter(PedidoVendaORM.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    current = pedido.status_logistica
    if current == StatusLogistica.PENDENTE:
        pedido.status_logistica = StatusLogistica.PICKING
    elif current == StatusLogistica.PICKING:
        pedido.status_logistica = StatusLogistica.PACKING
    elif current == StatusLogistica.PACKING:
        pedido.status_logistica = StatusLogistica.DESPACHADO
    else:
        raise HTTPException(status_code=400, detail="O status não pode ser avançado automaticamente além de Despachado")
    
    db.commit()
    return {"message": f"Status alterado para {pedido.status_logistica.value}"}

@router.post("/expedicao/{pedido_id}/despachar")
def despachar_pedido(pedido_id: str, dto: DespachoDTO, db: Session = Depends(get_db)):
    """Finaliza a expedição adicionando o código de rastreio."""
    pedido = db.query(PedidoVendaORM).filter(PedidoVendaORM.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status_logistica = StatusLogistica.DESPACHADO
    pedido.codigo_rastreio = dto.codigo_rastreio
    db.commit()
    return {"message": "Pedido despachado!", "codigo_rastreio": pedido.codigo_rastreio}

@router.get("/curva-abc")
def curva_abc(db: Session = Depends(get_db)):
    """Calcula a Curva ABC baseada no valor total em estoque (valor * quantidade)."""
    produtos = db.query(ProdutoORM).all()
    
    # Calcular valor total e ordenar
    lista = []
    total_geral = 0
    for p in produtos:
        valor_estoque = p.estoque_atual * p.preco_venda
        total_geral += valor_estoque
        lista.append({
            "id": p.id,
            "nome": p.nome,
            "valor_estoque": valor_estoque
        })
    
    lista.sort(key=lambda x: x["valor_estoque"], reverse=True)
    
    # Calcular acumulado e classificar
    acumulado = 0
    for item in lista:
        if total_geral > 0:
            percent_individual = (item["valor_estoque"] / total_geral) * 100
        else:
            percent_individual = 0
            
        acumulado += percent_individual
        item["percent_acumulado"] = acumulado
        
        if acumulado <= 80:
            item["classe"] = "A"
        elif acumulado <= 95:
            item["classe"] = "B"
        else:
            item["classe"] = "C"
            
    return lista

@router.get("/estoque-critico")
def estoque_critico(db: Session = Depends(get_db)):
    """Lista produtos que estão abaixo do ponto de pedido ou estoque mínimo."""
    produtos = db.query(ProdutoORM).all()
    resultado = []
    for p in produtos:
        param = db.query(ParametroEstoqueORM).filter(ParametroEstoqueORM.produto_id == p.id).first()
        if not param: continue
        
        if p.estoque_atual <= param.ponto_pedido:
            resultado.append({
                "id": p.id,
                "nome": p.nome,
                "estoque_atual": p.estoque_atual,
                "ponto_pedido": param.ponto_pedido,
                "estoque_minimo": param.estoque_minimo,
                "nivel": "CRITICO" if p.estoque_atual <= param.estoque_minimo else "ALERTA"
            })
    return resultado

@router.get("/historico-precos/{produto_id}")
def historico_precos(produto_id: str, db: Session = Depends(get_db)):
    """Retorna o histórico de preços de compra de um produto baseado nas NFs de entrada."""
    itens = db.query(ItemNotaFiscalEntradaORM).join(NotaFiscalEntradaORM).filter(
        ItemNotaFiscalEntradaORM.produto_id == produto_id
    ).order_by(NotaFiscalEntradaORM.data_emissao.asc()).all()
    
    return [
        {
            "data": i.nota.data_emissao.strftime("%d/%m/%Y"),
            "preco": float(i.valor_unitario),
            "fornecedor": i.nota.emitente_nome,
            "nf": i.nota.numero
        } for i in itens
    ]

@router.get("/simular-frete")
def simular_frete(cep_destino: str, peso_kg: float):
    """Simula valor e prazo de frete (Modelagem Simplificada)."""
    # Lógica de simulação mockada
    valor_base = 15.0
    valor_peso = peso_kg * 2.5
    distancia_mock = len(cep_destino) * 2 # Mock
    total = valor_base + valor_peso + (distancia_mock / 10)
    
    return {
        "transportadora": "Logística Express",
        "valor": round(total, 2),
        "prazo_dias": 3 if cep_destino.startswith("0") else 7,
        "cep_destino": cep_destino
    }

@router.get("/etiqueta/{pedido_id}")
def gerar_etiqueta(pedido_id: str, db: Session = Depends(get_db)):
    """Retorna dados para impressão de etiqueta de despacho."""
    pedido = db.query(PedidoVendaORM).filter(PedidoVendaORM.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    return {
        "pedido_id": pedido.id,
        "cliente": pedido.cliente_nome,
        "endereco": "Endereço do Cliente (Cadastro)", # Placeholder
        "volume": 1,
        "peso_estimado": 1.5,
        "rastreio": pedido.codigo_rastreio
    }
