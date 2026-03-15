import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from infrastructure.database import Base
from infrastructure.orm_models.erp_models import ProdutoORM, FornecedorORM
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy, PedidoRepositorySQLAlchemy, FornecedorRepositorySQLAlchemy

from domain.erp.compras import OrdemCompra, ItemPedido
from domain.erp.produto import Produto
from domain.erp.fornecedor import Fornecedor
from domain.value_objects import Money, CNPJ

# Cria um DB em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_salvar_e_buscar_pedido_no_banco(db):
    # Setup - Dados base
    prod_orm = ProdutoORM(id="P1", nome="Mesa", codigo_barras="001")
    forn_orm = FornecedorORM(id="F1", razao_social="Fornec", cnpj="11111111111111")
    db.add(prod_orm)
    db.add(forn_orm)
    db.commit()

    # Injeta db nos repositórios
    prod_repo = ProdutoRepositorySQLAlchemy(db)
    forn_repo = FornecedorRepositorySQLAlchemy(db)
    pedido_repo = PedidoRepositorySQLAlchemy(db, forn_repo, prod_repo)
    
    # Monta Entidades
    produto = prod_repo.buscar_por_id("P1")
    fornecedor = forn_repo.buscar_por_id("F1")
    
    pedido = OrdemCompra(id="OC-100", fornecedor=fornecedor, data_emissao=date.today())
    pedido.adicionar_item(ItemPedido(produto=produto, quantidade=5, valor_unitario=Money(100.00)))
    
    # Salva
    pedido_repo.salvar(pedido)
    
    # Busca
    pedido_db = pedido_repo.buscar_por_id("OC-100")
    
    assert pedido_db is not None
    assert pedido_db.id == "OC-100"
    assert pedido_db.fornecedor.id == "F1"
    assert len(pedido_db.itens) == 1
    assert pedido_db.itens[0].quantidade == 5
    assert str(pedido_db.valor_total.amount) == "500.00"
