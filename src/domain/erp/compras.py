from dataclasses import dataclass, field
from datetime import date
from typing import List, Optional
from domain.value_objects import Money
from domain.erp.fornecedor import Fornecedor
from domain.erp.produto import Produto
from domain.erp.contrato import ContratoFornecimento

@dataclass
class ItemPedido:
    produto: Produto
    quantidade: int
    valor_unitario: Money

    @property
    def valor_total(self) -> Money:
        return self.valor_unitario * self.quantidade


@dataclass
class PedidoBase:
    id: str
    fornecedor: Fornecedor
    data_emissao: date
    itens: List[ItemPedido] = field(default_factory=list)
    status: str = "RASCUNHO" # RASCUNHO, APROVADO, CANCELADO, RECEBIDO

    def adicionar_item(self, item: ItemPedido):
        if self.status != "RASCUNHO":
            raise ValueError("Não é possível adicionar itens a um pedido não rascunho.")
        self.itens.append(item)

    @property
    def valor_total(self) -> Money:
        if not self.itens:
            # Assumindo a moeda do primeiro item ou BRL como default se vazio
            return Money(0, "BRL")
        total = self.itens[0].valor_total
        for item in self.itens[1:]:
            total += item.valor_total
        return total

    def aprovar(self):
        if not self.itens:
            raise ValueError("O pedido deve ter pelo menos um item para ser aprovado.")
        self.status = "APROVADO"

    def cancelar(self):
        self.status = "CANCELADO"


@dataclass
class OrdemCompra(PedidoBase):
    """
    OC: Ordem de Compra pontual (compra sem disputa formal/contrato prévio).
    Pode ser emitida livremente para um fornecedor.
    """
    pass


@dataclass
class OrdemFornecimento(PedidoBase):
    """
    OF: Ordem de Fornecimento.
    Deve estar obrigatoriamente vinculada a um Contrato de Fornecimento vigente.
    """
    contrato: ContratoFornecimento = None

    def __post_init__(self):
        if not self.contrato:
            raise ValueError("Uma Ordem de Fornecimento exige um Contrato de Fornecimento.")
        if self.contrato.fornecedor.id != self.fornecedor.id:
            raise ValueError("O fornecedor da OF deve ser o mesmo do Contrato.")
        if not self.contrato.esta_vigente(self.data_emissao):
            raise ValueError("Contrato não está vigente na data de emissão desta OF.")

    def aprovar(self):
        super().aprovar()
        # Regra de negócio: O valor total da OF não deveria estourar o limite do contrato.
        # Numa implementação mais completa, o contrato ou serviço de domínio abateria esse saldo.
        if self.valor_total.amount > self.contrato.valor_total_estimado.amount: # Simplificação comparando apenas montantes em BRL
            # Log ou Raise de warning dependendo da regra da empresa. 
            # Vamos deixar apenas um comentário por agora na modelagem de domínio básica.
            pass
