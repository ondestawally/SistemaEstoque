from dataclasses import dataclass
from datetime import date
from typing import List

from domain.value_objects import Money
from domain.erp.compras import OrdemCompra, ItemPedido
from application.ports.repositories import FornecedorRepository, ProdutoRepository, PedidoRepository

from pydantic import BaseModel, Field, validator

class ItemDto(BaseModel):
    produto_id: str
    quantidade: int = Field(..., gt=0)
    valor_unitario: str # Ex: "150.00"

class CriarPedidoCompraDto(BaseModel):
    pedido_id: str
    fornecedor_id: str
    itens: List[ItemDto]

class CriarPedidoCompraUseCase:
    """
    Caso de Uso: Criação de uma Ordem de Compra pontual (ERP).
    """
    def __init__(
        self,
        fornecedor_repo: FornecedorRepository,
        produto_repo: ProdutoRepository,
        pedido_repo: PedidoRepository
    ):
        self.fornecedor_repo = fornecedor_repo
        self.produto_repo = produto_repo
        self.pedido_repo = pedido_repo

    def executar(self, dto: CriarPedidoCompraDto) -> OrdemCompra:
        fornecedor = self.fornecedor_repo.buscar_por_id(dto.fornecedor_id)
        if not fornecedor:
            raise ValueError(f"Fornecedor não encontrado: {dto.fornecedor_id}")

        pedido = OrdemCompra(id=dto.pedido_id, fornecedor=fornecedor, data_emissao=date.today())

        for item_dto in dto.itens:
            produto = self.produto_repo.buscar_por_id(item_dto.produto_id)
            if not produto:
                raise ValueError(f"Produto não encontrado: {item_dto.produto_id}")
            
            # Conversão e criação do VO Money e Entidade ItemPedido
            from decimal import Decimal
            valor = Money(amount=Decimal(item_dto.valor_unitario))
            
            item = ItemPedido(
                produto=produto,
                quantidade=item_dto.quantidade,
                valor_unitario=valor
            )
            pedido.adicionar_item(item)

        # Salva o pedido usando a porta
        self.pedido_repo.salvar(pedido)
        return pedido
