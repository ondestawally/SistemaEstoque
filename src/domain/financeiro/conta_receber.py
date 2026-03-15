from dataclasses import dataclass
from datetime import date
from domain.value_objects import Money
from enum import Enum

class StatusFinanceiro(Enum):
    PENDENTE = "PENDENTE"
    PAGO = "PAGO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"

@dataclass
class ContaReceber:
    id: str
    origem_id: str # ID do Pedido de Venda
    valor: Money
    data_vencimento: date
    status: StatusFinanceiro = StatusFinanceiro.PENDENTE
    data_pagamento: Optional[date] = None

    def registrar_pagamento(self, data: date):
        self.status = StatusFinanceiro.PAGO
        self.data_pagamento = data
