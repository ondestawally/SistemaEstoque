from dataclasses import dataclass
from domain.wms.lote import Lote
from domain.wms.localizacao import Posicao

@dataclass
class Alocacao:
    """
    Representa a alocação física de uma certa quantidade de um lote
    numa posição de armazém específica.
    """
    id: str
    lote: Lote
    posicao: Posicao
    quantidade: int

    def __post_init__(self):
        if self.quantidade <= 0:
            raise ValueError("A quantidade alocada deve ser maior que zero")
        if self.posicao.bloqueada:
            raise ValueError("Não é possível alocar em uma posição bloqueada")

    def remover(self, qtd_remover: int):
        if qtd_remover <= 0:
            raise ValueError("A quantidade a remover deve ser maior que zero")
        if qtd_remover > self.quantidade:
            raise ValueError("Não é possível remover mais do que há alocado nesta posição")
        self.quantidade -= qtd_remover

