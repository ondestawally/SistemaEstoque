from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infrastructure.database import get_db

from application.use_cases.wms.receber_mercadoria import ReceberMercadoriaUseCase, ReceberMercadoriaDto
from application.use_cases.wms.alocar_produto import AlocarProdutoUseCase, AlocarProdutoDto
from infrastructure.repositories.erp_repositories import PedidoRepositorySQLAlchemy, FornecedorRepositorySQLAlchemy, ProdutoRepositorySQLAlchemy
from infrastructure.repositories.wms_repositories import LoteRepositorySQLAlchemy, ArmazemRepositorySQLAlchemy

router = APIRouter(prefix="/wms", tags=["WMS - Armazenagem"])

# Fabrica para Recebimento
def get_receber_use_case(db: Session = Depends(get_db)):
    prod_repo = ProdutoRepositorySQLAlchemy(db)
    forn_repo = FornecedorRepositorySQLAlchemy(db)
    pedido_repo = PedidoRepositorySQLAlchemy(db, forn_repo, prod_repo)
    lote_repo = LoteRepositorySQLAlchemy(db, prod_repo)
    return ReceberMercadoriaUseCase(pedido_repo, lote_repo)

# Fabrica para Alocacao
def get_alocar_use_case(db: Session = Depends(get_db)):
    # Usando dependências mínimas necessárias pra simplificar
    prod_repo = ProdutoRepositorySQLAlchemy(db)
    lote_repo = LoteRepositorySQLAlchemy(db, prod_repo)
    armazem_repo = ArmazemRepositorySQLAlchemy(db)
    # Alocacao Repo fariamos se houvesse a classe salva no banco, por hora mockei na usecase:
    # alocacao_repo = AlocacaoRepositorySQLAlchemy(db)
    return AlocarProdutoUseCase(lote_repo, armazem_repo, None) 


@router.post("/receber/", status_code=200)
def receber_mercadoria(dto: ReceberMercadoriaDto, use_case: ReceberMercadoriaUseCase = Depends(get_receber_use_case)):
    """ Confirma recebimento de OC gerando lotes de estoque WMS """
    try:
        lotes = use_case.executar(dto)
        return {
            "message": f"Recebimento concluído. {len(lotes)} lotes gerados.",
            "lotes_gerados": [{"id": l.id, "produto": l.produto.nome, "quantidade": l.quantidade_inicial} for l in lotes]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/armazens/")
def listar_armazens(db: Session = Depends(get_db)):
    from infrastructure.orm_models.wms_models import ArmazemORM
    armazens = db.query(ArmazemORM).all()
    return [{"id": a.id, "nome": a.nome, "ativo": a.ativo} for a in armazens]


@router.post("/alocar/", status_code=200)
def alocar_produto(dto: AlocarProdutoDto, use_case: AlocarProdutoUseCase = Depends(get_alocar_use_case)):
    """ Move o item disponível em um lote para uma posição física do Armazém """
    try:
        # A implementação real do alocar do UseCase seria concluída.
        # Aqui injetamos um simples feedback de WIP.
        aloc_mock = use_case.executar(dto)
        return {"message": "Alocado em mock", "mock_data": str(aloc_mock)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
