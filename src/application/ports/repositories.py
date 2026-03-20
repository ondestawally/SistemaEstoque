from typing import Protocol, Optional, List, TypeVar, Generic
from domain.erp.produto import Produto
from domain.erp.fornecedor import Fornecedor
from domain.erp.compras import PedidoBase
from domain.wms.lote import Lote
from domain.wms.localizacao import Armazem

T = TypeVar('T')

class ProdutoRepository(Protocol):
    def buscar_por_id(self, id: str) -> Optional[Produto]:
        ...

class FornecedorRepository(Protocol):
    def buscar_por_id(self, id: str) -> Optional[Fornecedor]:
        ...

class PedidoRepository(Protocol):
    def salvar(self, pedido: PedidoBase) -> None:
        ...
        
    def buscar_por_id(self, id: str) -> Optional[PedidoBase]:
        ...

class LoteRepository(Protocol):
    def salvar(self, lote: Lote) -> None:
        ...
        
    def buscar_por_id(self, id: str) -> Optional[Lote]:
        ...
        
class ArmazemRepository(Protocol):
    def buscar_por_id(self, id: str) -> Optional[Armazem]:
        ...
