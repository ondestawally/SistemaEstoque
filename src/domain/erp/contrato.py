from dataclasses import dataclass
from datetime import date
from typing import Optional
from domain.value_objects import Money
from domain.erp.fornecedor import Fornecedor

@dataclass
class ContratoFornecimento:
    id: str
    fornecedor: Fornecedor
    data_inicio: date
    data_fim: date
    valor_total_estimado: Money
    ativo: bool = True

    def esta_vigente(self, data_base: date) -> bool:
        if not self.ativo:
            return False
        return self.data_inicio <= data_base <= self.data_fim

    def encerrar(self):
        self.ativo = False
