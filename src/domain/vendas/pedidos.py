from dataclasses import dataclass, field
from datetime import date
from typing import List
from enum import Enum
from domain.erp.produto import Produto
from domain.vendas.cliente import Cliente
from domain.value_objects import Money

class StatusPedidoVenda(Enum):
    ORCAMENTO = "ORCAMENTO"
    APROVADO = "APROVADO"
    FATURADO = "FATURADO"
    CANCELADO = "CANCELADO"

@dataclass
class ItemPedidoVenda:
    produto: Produto
    quantidade: int
    valor_unitario: Money

    def total(self) -> Money:
        return Money(self.valor_unitario.amount * self.quantidade, self.valor_unitario.currency)

@dataclass
class PedidoVenda:
    id: str
    cliente: Cliente
    data_pedido: date
    status: StatusPedidoVenda = StatusPedidoVenda.ORCAMENTO
    itens: List[ItemPedidoVenda] = field(default_factory=list)

    def adicionar_item(self, item: ItemPedidoVenda):
        if self.status != StatusPedidoVenda.ORCAMENTO:
            raise ValueError("Só é possível adicionar itens em orçamentos")
        self.itens.append(item)

    def valor_total(self) -> Money:
        if not self.itens:
            return Money(0)
        total = sum((item.valor_unitario.amount * item.quantidade for item in self.itens))
        return Money(total)

    def faturar(self):
        if self.status != StatusPedidoVenda.APROVADO:
            raise ValueError("Somente pedidos aprovados podem ser faturados")
        self.status = StatusPedidoVenda.FATURADO
