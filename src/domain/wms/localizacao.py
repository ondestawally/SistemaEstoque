from dataclasses import dataclass

@dataclass
class Armazem:
    id: str
    nome: str
    ativo: bool = True

    def ativar(self):
        self.ativo = True

    def desativar(self):
        self.ativo = False

@dataclass
class Posicao:
    id: str
    codigo: str  # Ex: "R01-P02-N03"
    armazem: Armazem
    bloqueada: bool = False

    def bloquear(self):
        self.bloqueada = True

    def desbloquear(self):
        self.bloqueada = False
