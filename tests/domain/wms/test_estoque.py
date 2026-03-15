from domain.wms.localizacao import Armazem, Posicao
from domain.wms.lote import Lote
from domain.wms.estoque import Alocacao
from domain.erp.produto import Produto

def test_criar_alocacao():
    produto = Produto(id="1", nome="Cadeira", descricao="Movel", codigo_barras="123")
    lote = Lote(id="L1", produto=produto, quantidade_inicial=100)
    
    armazem = Armazem(id="A1", nome="CD")
    posicao = Posicao(id="P1", codigo="R1-P1", armazem=armazem)
    
    # Ao alocar fisicamente em uma posicao, tiramos a 'quantidade_disponivel' virtual do lote e movemos 
    # pra uma alocacao especifica (essa eh uma modelagem possivel, mas no real o lote todo fica na posicao na hora do recebimento)
    # Por simplicidade, digamos que um Lote pode ser dividido em varias posicoes.
    alocacao = Alocacao(id="AL1", lote=lote, posicao=posicao, quantidade=10)
    
    assert alocacao.id == "AL1"
    assert alocacao.lote == lote
    assert alocacao.posicao == posicao
    assert alocacao.quantidade == 10

def test_remover_quantidade_da_alocacao():
    produto = Produto(id="1", nome="Cadeira", descricao="Movel", codigo_barras="123")
    lote = Lote(id="L1", produto=produto, quantidade_inicial=100)
    
    armazem = Armazem(id="A1", nome="CD")
    posicao = Posicao(id="P1", codigo="R1-P1", armazem=armazem)
    
    alocacao = Alocacao(id="AL1", lote=lote, posicao=posicao, quantidade=10)
    alocacao.remover(4)
    
    assert alocacao.quantidade == 6

def test_erro_ao_remover_mais_que_existe():
    import pytest
    produto = Produto(id="1", nome="Cadeira", descricao="Movel", codigo_barras="123")
    lote = Lote(id="L1", produto=produto, quantidade_inicial=100)
    
    armazem = Armazem(id="A1", nome="CD")
    posicao = Posicao(id="P1", codigo="R1-P1", armazem=armazem)
    
    alocacao = Alocacao(id="AL1", lote=lote, posicao=posicao, quantidade=10)
    
    with pytest.raises(ValueError, match="Não é possível remover mais do que há alocado"):
        alocacao.remover(15)
