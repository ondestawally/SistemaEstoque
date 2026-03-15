import pytest
from datetime import date
from domain.erp.produto import Produto
from domain.erp.fornecedor import Fornecedor
from domain.erp.compras import OrdemCompra
from application.use_cases.erp.criar_pedido_compra import CriarPedidoCompraUseCase, CriarPedidoCompraDto, ItemDto

# Fakes (Mocks) para os Repositórios
class FakesProdutoRepo:
    def __init__(self):
        self.produtos = {
            "P1": Produto(id="P1", nome="Cadeira", descricao="Movel", codigo_barras="123")
        }
    def buscar_por_id(self, id: str):
        return self.produtos.get(id)

from domain.value_objects import CNPJ

class FakesFornecedorRepo:
    def __init__(self):
        self.fornecedores = {
            "F1": Fornecedor(id="F1", razao_social="Fornecedor Teste", cnpj=CNPJ("12345678000199"))
        }
    def buscar_por_id(self, id: str):
        return self.fornecedores.get(id)

class FakesPedidoRepo:
    def __init__(self):
        self.salvos = []
    
    def salvar(self, pedido: OrdemCompra):
        self.salvos.append(pedido)

def test_criar_pedido_compra():
    produto_repo = FakesProdutoRepo()
    fornecedor_repo = FakesFornecedorRepo()
    pedido_repo = FakesPedidoRepo()
    
    use_case = CriarPedidoCompraUseCase(fornecedor_repo, produto_repo, pedido_repo)
    
    dto = CriarPedidoCompraDto(
        pedido_id="OC001",
        fornecedor_id="F1",
        itens=[ItemDto(produto_id="P1", quantidade=10, valor_unitario="150.00")]
    )
    
    resultado = use_case.executar(dto)
    
    assert resultado.id == "OC001"
    assert resultado.fornecedor.id == "F1"
    assert len(resultado.itens) == 1
    assert resultado.itens[0].quantidade == 10
    assert str(resultado.valor_total.amount) == "1500.00"
    
    # Verifica se a porta 'salvar' foi chamada corretamente
    assert len(pedido_repo.salvos) == 1
    assert pedido_repo.salvos[0] == resultado
