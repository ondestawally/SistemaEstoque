from dataclasses import dataclass, field
from datetime import date
from typing import Optional
from domain.erp.produto import Produto

@dataclass
class Lote:
    id: str
    produto: Produto
    quantidade_inicial: int
    data_validade: Optional[date] = None
    quantidade_disponivel: int = field(init=False)

    def __post_init__(self):
        if self.quantidade_inicial < 0:
            raise ValueError("Quantidade inicial não pode ser negativa")
        self.quantidade_disponivel = self.quantidade_inicial

    def alocar(self, quantidade: int):
        if quantidade <= 0:
            raise ValueError("A quantidade a alocar deve ser maior que zero")
        if quantidade > self.quantidade_disponivel:
            raise ValueError("Quantidade solicitada maior que a disponível no lote")
        
        self.quantidade_disponivel -= quantidade

    def esta_vencido(self) -> bool:
        if not self.data_validade:
            return False
        return date.today() > self.data_validade
