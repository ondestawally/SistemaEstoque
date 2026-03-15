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


from pydantic import BaseModel
from typing import List, Optional

class ProdutoDTO(BaseModel):
    id: str
    nome: str
    descricao: Optional[str] = None
    codigo_barras: Optional[str] = None
    ativo: bool = True

class FornecedorDTO(BaseModel):
    id: str
    razao_social: str
    cnpj: str
    ativo: bool = True

@router.post("/produtos/", status_code=201)
def criar_produto(dto: ProdutoDTO, db: Session = Depends(get_db)):
    from domain.erp.produto import Produto
    repo = ProdutoRepositorySQLAlchemy(db)
    produto = Produto(id=dto.id, nome=dto.nome, descricao=dto.descricao, codigo_barras=dto.codigo_barras, ativo=dto.ativo)
    repo.salvar(produto)
    return {"message": "Produto cadastrado"}

@router.get("/produtos/", response_model=List[ProdutoDTO])
def listar_produtos(db: Session = Depends(get_db)):
    repo = ProdutoRepositorySQLAlchemy(db)
    return repo.listar_todos()

@router.post("/fornecedores/", status_code=201)
def criar_fornecedor(dto: FornecedorDTO, db: Session = Depends(get_db)):
    from domain.erp.fornecedor import Fornecedor
    from domain.value_objects import CNPJ
    repo = FornecedorRepositorySQLAlchemy(db)
    fornecedor = Fornecedor(id=dto.id, razao_social=dto.razao_social, cnpj=CNPJ(dto.cnpj), ativo=dto.ativo)
    repo.salvar(fornecedor)
    return {"message": "Fornecedor cadastrado"}

@router.get("/fornecedores/", response_model=List[FornecedorDTO])
def listar_fornecedores(db: Session = Depends(get_db)):
    repo = FornecedorRepositorySQLAlchemy(db)
    return repo.listar_todos()

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

@router.get("/pedidos/")
def listar_pedidos_compra(db: Session = Depends(get_db)):
    from infrastructure.orm_models.erp_models import PedidoORM
    pedidos = db.query(PedidoORM).order_by(PedidoORM.data_emissao.desc()).all()
    return [
        {
            "id": p.id,
            "fornecedor_id": p.fornecedor_id,
            "status": p.status,
            "data_emissao": str(p.data_emissao),
        }
        for p in pedidos
    ]

TRANSICOES_OC = {
    "RASCUNHO": "APROVADO",
    "APROVADO": "RECEBIDO",
}

@router.patch("/pedidos/{pedido_id}/status", status_code=200)
def atualizar_status_pedido(pedido_id: str, db: Session = Depends(get_db)):
    """
    Avança o status de uma OC: RASCUNHO → APROVADO → RECEBIDO
    """
    from infrastructure.orm_models.erp_models import PedidoORM
    pedido = db.query(PedidoORM).filter(PedidoORM.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    proximo = TRANSICOES_OC.get(pedido.status)
    if not proximo:
        raise HTTPException(status_code=400, detail=f"Status '{pedido.status}' não pode ser avançado")
    pedido.status = proximo
    db.commit()
    return {"message": f"Status atualizado para {proximo}", "pedido_id": pedido_id, "novo_status": proximo}
