from dataclasses import dataclass
from typing import Optional
from domain.value_objects import CNPJ

@dataclass
class Fornecedor:
    id: str
    razao_social: str
    cnpj: CNPJ
    ativo: bool = True

    def ativar(self):
        self.ativo = True

    def desativar(self):
        self.ativo = False
