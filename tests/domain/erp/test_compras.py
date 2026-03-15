import pytest
from datetime import date
from decimal import Decimal

from domain.value_objects import Money, CNPJ
from domain.erp.fornecedor import Fornecedor
from domain.erp.produto import Produto
from domain.erp.contrato import ContratoFornecimento
from domain.erp.compras import ItemPedido, OrdemCompra, OrdemFornecimento

def test_criar_ordem_compra_sucesso():
    # Arrange
    fornecedor = Fornecedor(id="f1", razao_social="Fornecedor A", cnpj=CNPJ("11.111.111/0001-11"))
    produto = Produto(id="p1", nome="Notebook", descricao="Dell XPS", codigo_barras="123")
    oc = OrdemCompra(id="oc1", fornecedor=fornecedor, data_emissao=date(2023, 10, 1))
    
    # Act
    item = ItemPedido(produto=produto, quantidade=2, valor_unitario=Money(5000))
    oc.adicionar_item(item)
    
    # Assert
    assert oc.valor_total.amount == Decimal("10000")
    assert len(oc.itens) == 1
    assert oc.status == "RASCUNHO"


def test_ordem_fornecimento_sem_contrato_falha():
    fornecedor = Fornecedor(id="f1", razao_social="Fornecedor A", cnpj=CNPJ("11.111.111/0001-11"))
    
    with pytest.raises(ValueError, match="Uma Ordem de Fornecimento exige um Contrato de Fornecimento"):
        OrdemFornecimento(id="of1", fornecedor=fornecedor, data_emissao=date(2023, 10, 1))


def test_ordem_fornecimento_com_fornecedor_divergente():
    fornecedor_a = Fornecedor(id="f1", razao_social="Fornecedor A", cnpj=CNPJ("11.111.111/0001-11"))
    fornecedor_b = Fornecedor(id="f2", razao_social="Fornecedor B", cnpj=CNPJ("22.222.222/0001-22"))
    
    contrato = ContratoFornecimento(
        id="c1", 
        fornecedor=fornecedor_a, 
        data_inicio=date(2023, 1, 1), 
        data_fim=date(2023, 12, 31), 
        valor_total_estimado=Money(100000)
    )
    
    with pytest.raises(ValueError, match="O fornecedor da OF deve ser o mesmo do Contrato"):
        OrdemFornecimento(id="of1", fornecedor=fornecedor_b, data_emissao=date(2023, 10, 1), contrato=contrato)


def test_ordem_fornecimento_com_contrato_vencido():
    fornecedor = Fornecedor(id="f1", razao_social="Fornecedor A", cnpj=CNPJ("11.111.111/0001-11"))
    
    contrato = ContratoFornecimento(
        id="c1", 
        fornecedor=fornecedor, 
        data_inicio=date(2023, 1, 1), 
        data_fim=date(2023, 6, 30), 
        valor_total_estimado=Money(100000)
    )
    
    # Tentando emitir OF em Outubro, quando contrato já venceu em Junho
    with pytest.raises(ValueError, match="Contrato não está vigente na data de emissão desta OF"):
        OrdemFornecimento(id="of1", fornecedor=fornecedor, data_emissao=date(2023, 10, 1), contrato=contrato)


def test_criar_ordem_fornecimento_sucesso():
    fornecedor = Fornecedor(id="f1", razao_social="Fornecedor A", cnpj=CNPJ("11.111.111/0001-11"))
    
    contrato = ContratoFornecimento(
        id="c1", 
        fornecedor=fornecedor, 
        data_inicio=date(2023, 1, 1), 
        data_fim=date(2023, 12, 31), 
        valor_total_estimado=Money(100000)
    )
    
    of = OrdemFornecimento(id="of1", fornecedor=fornecedor, data_emissao=date(2023, 10, 1), contrato=contrato)
    
    assert of.contrato.id == "c1"
    assert of.status == "RASCUNHO"
