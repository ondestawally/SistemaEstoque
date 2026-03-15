from datetime import date, timedelta
from domain.erp.produto import Produto
from domain.wms.lote import Lote

def test_criar_lote():
    produto = Produto(id="1", nome="Cadeira", descricao="Móvel", codigo_barras="123")
    validade = date.today() + timedelta(days=365)
    
    lote = Lote(id="L001", produto=produto, quantidade_inicial=100, data_validade=validade)
    
    assert lote.id == "L001"
    assert lote.produto == produto
    assert lote.quantidade_inicial == 100
    assert lote.quantidade_disponivel == 100
    assert lote.data_validade == validade

def test_alocar_quantidade_de_lote():
    produto = Produto(id="1", nome="Cadeira", descricao="Móvel", codigo_barras="123")
    lote = Lote(id="L001", produto=produto, quantidade_inicial=100)
    
    lote.alocar(20)
    assert lote.quantidade_disponivel == 80

def test_erro_ao_alocar_quantidade_maior_que_disponivel():
    import pytest
    produto = Produto(id="1", nome="Cadeira", descricao="Móvel", codigo_barras="123")
    lote = Lote(id="L001", produto=produto, quantidade_inicial=50)
    
    with pytest.raises(ValueError, match="Quantidade solicitada maior que a disponível"):
        lote.alocar(60)

def test_lote_esta_vencido():
    produto = Produto(id="1", nome="Cadeira", descricao="Móvel", codigo_barras="123")
    
    # Lote vencido ontem
    validade_vencida = date.today() - timedelta(days=1)
    lote_vencido = Lote(id="L001", produto=produto, quantidade_inicial=100, data_validade=validade_vencida)
    assert lote_vencido.esta_vencido() is True
    
    # Lote válido amanhã
    validade_ok = date.today() + timedelta(days=1)
    lote_ok = Lote(id="L002", produto=produto, quantidade_inicial=100, data_validade=validade_ok)
    assert lote_ok.esta_vencido() is False
    
    # Lote sem validade não vence
    lote_sem_validade = Lote(id="L003", produto=produto, quantidade_inicial=100)
    assert lote_sem_validade.esta_vencido() is False
