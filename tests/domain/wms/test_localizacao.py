from domain.wms.localizacao import Armazem, Posicao

def test_criar_armazem():
    armazem = Armazem(id="A01", nome="CD Principal")
    assert armazem.id == "A01"
    assert armazem.nome == "CD Principal"
    assert armazem.ativo is True

def test_desativar_armazem():
    armazem = Armazem(id="A01", nome="CD Principal")
    armazem.desativar()
    assert armazem.ativo is False

def test_criar_posicao():
    armazem = Armazem(id="A01", nome="CD Principal")
    posicao = Posicao(id="P01", codigo="R01-P02-N03", armazem=armazem)
    
    assert posicao.id == "P01"
    assert posicao.codigo == "R01-P02-N03"
    assert posicao.armazem.id == "A01"
    assert posicao.bloqueada is False

def test_bloquear_desbloquear_posicao():
    armazem = Armazem(id="A01", nome="CD Principal")
    posicao = Posicao(id="P01", codigo="R01-P02-N03", armazem=armazem)
    
    posicao.bloquear()
    assert posicao.bloqueada is True
    
    posicao.desbloquear()
    assert posicao.bloqueada is False
