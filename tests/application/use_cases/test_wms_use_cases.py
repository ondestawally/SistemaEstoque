import pytest
from datetime import date
from domain.erp.produto import Produto
from domain.erp.fornecedor import Fornecedor
from domain.erp.compras import OrdemCompra, ItemPedido
from domain.value_objects import Money

from application.use_cases.wms.receber_mercadoria import ReceberMercadoriaUseCase, ReceberMercadoriaDto

# Fakes
class FakePedidoRepo:
    def __init__(self):
        self.pedidos = {}
        self.pedidos_salvos = []

    def buscar_por_id(self, id: str):
        return self.pedidos.get(id)

    def salvar(self, pedido):
        self.pedidos_salvos.append(pedido)

class FakeLoteRepo:
    def __init__(self):
        self.lotes_salvos = []

    def salvar(self, lote):
        self.lotes_salvos.append(lote)


from domain.value_objects import CNPJ

def test_receber_mercadoria_cria_lotes_do_wms():
    pedido_repo = FakePedidoRepo()
    lote_repo = FakeLoteRepo()

    # Setup do pedido de compra Aprovado
    produto = Produto(id="P1", nome="Cadeira", descricao="Movel", codigo_barras="123")
    fornecedor = Fornecedor(id="F1", razao_social="Fornecedor", cnpj=CNPJ("11111111111111"))
    
    pedido = OrdemCompra(id="OC1", fornecedor=fornecedor, data_emissao=date.today())
    pedido.adicionar_item(ItemPedido(produto=produto, quantidade=50, valor_unitario=Money(10,"BRL")))
    pedido.aprovar()
    
    pedido_repo.pedidos["OC1"] = pedido

    # Executa Recebimento
    use_case = ReceberMercadoriaUseCase(pedido_repo, lote_repo)
    dto = ReceberMercadoriaDto(pedido_id="OC1", data_recebimento=date.today())
    
    lotes_gerados = use_case.executar(dto)
    
    assert len(lotes_gerados) == 1
    lote = lotes_gerados[0]
    assert lote.produto == produto
    assert lote.quantidade_inicial == 50
    assert lote.quantidade_disponivel == 50
    assert lote.id.startswith("LOTE-")
    
    # Verifica mudança de status
    assert pedido.status == "RECEBIDO"
    assert len(pedido_repo.pedidos_salvos) == 1
    
    # Verifica lote salvo no repositório WMS
    assert len(lote_repo.lotes_salvos) == 1
