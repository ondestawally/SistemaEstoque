from dataclasses import dataclass

@dataclass
class Produto:
    id: str
    nome: str
    descricao: str
    codigo_barras: str
    ativo: bool = True

    def ativar(self):
        self.ativo = True

    def desativar(self):
        self.ativo = False
