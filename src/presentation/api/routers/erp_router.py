from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database import get_db

from application.use_cases.erp.criar_pedido_compra import CriarPedidoCompraUseCase, CriarPedidoCompraDto, ItemDto
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy, FornecedorRepositorySQLAlchemy, PedidoRepositorySQLAlchemy

router = APIRouter(prefix="/erp", tags=["ERP - Compras"])

# Fábrica de injeção de dependências do FastAPI
def get_criar_pedido_use_case(db: Session = Depends(get_db)):
    prod_repo = ProdutoRepositorySQLAlchemy(db)
    forn_repo = FornecedorRepositorySQLAlchemy(db)
    pedido_repo = PedidoRepositorySQLAlchemy(db, forn_repo, prod_repo)
    return CriarPedidoCompraUseCase(forn_repo, prod_repo, pedido_repo)


@router.post("/pedidos/", status_code=201)
def criar_pedido_compra(dto: CriarPedidoCompraDto, use_case: CriarPedidoCompraUseCase = Depends(get_criar_pedido_use_case)):
    """
    Cria uma nova ordem de compra fornecendo ID do Pedido, ID do Fornecedor e uma lista de Itens.
    """
    try:
        pedido = use_case.executar(dto)
        return {
            "message": "Pedido criado com sucesso",
            "pedido_id": pedido.id,
            "status": pedido.status,
            "valor_total": pedido.valor_total.formatado()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
