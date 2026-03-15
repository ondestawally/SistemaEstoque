import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from infrastructure.database import Base, get_db
from infrastructure.orm_models.erp_models import ProdutoORM, FornecedorORM, PedidoORM, ItemPedidoORM
from infrastructure.orm_models.wms_models import ArmazemORM, PosicaoORM, LoteORM, AlocacaoORM
from main import app

# Configuração de Banco para Testes da API (usando arquivo pra manter estado entre sessões)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_estoque.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Insere dados preliminares
    db.add(ProdutoORM(id="P1", nome="Cadeira", codigo_barras="1234"))
    db.add(FornecedorORM(id="F1", razao_social="Fornecedor SA", cnpj="12345678000199"))
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "ERP & WMS is running"}


def test_criar_pedido_e_receber_mercadoria_via_api():
    # 1. API: Criar Pedido
    pedido_payload = {
        "pedido_id": "OC-999",
        "fornecedor_id": "F1",
        "itens": [
            {
                "produto_id": "P1",
                "quantidade": 150,
                "valor_unitario": "50.00"
            }
        ]
    }
    
    response_pedido = client.post("/erp/pedidos/", json=pedido_payload)
    assert response_pedido.status_code == 201
    assert response_pedido.json()["pedido_id"] == "OC-999"
    assert response_pedido.json()["status"] == "RASCUNHO"

    # Simular aprovação direta no DB pois não expusemos rota pra aprovar
    db = TestingSessionLocal()
    from infrastructure.orm_models.erp_models import PedidoORM
    pedido_orm = db.query(PedidoORM).filter(PedidoORM.id == "OC-999").first()
    pedido_orm.status = "APROVADO"
    db.commit()
    db.close()

    # 2. API: Receber Mercadoria
    receber_payload = {
        "pedido_id": "OC-999",
        "data_recebimento": "2026-03-14"
    }
    
    response_receber = client.post("/wms/receber/", json=receber_payload)
    assert response_receber.status_code == 200
    dados_recebimento = response_receber.json()
    assert "Recebimento concluído" in dados_recebimento["message"]
    # Devem ter sido criados os lotes referentes aos itens
    assert len(dados_recebimento["lotes_gerados"]) == 1
    assert dados_recebimento["lotes_gerados"][0]["quantidade"] == 150
