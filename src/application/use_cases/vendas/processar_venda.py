from dataclasses import dataclass
from datetime import date
from typing import List, Optional
from domain.vendas.pedidos import PedidoVenda, ItemPedidoVenda, StatusPedidoVenda
from domain.financeiro.conta_receber import ContaReceber
from domain.value_objects import Money
from infrastructure.repositories.robust_repositories import ClienteRepositorySQLAlchemy, VendasRepositorySQLAlchemy, FinanceiroRepositorySQLAlchemy
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy

@dataclass
class ItemVendaDto:
    produto_id: str
    quantidade: int
    valor_unitario: float

@dataclass
class CriarVendaDto:
    venda_id: str
    cliente_id: str
    itens: List[ItemVendaDto]

class ProcessarVendaUseCase:
    def __init__(
        self,
        cliente_repo: ClienteRepositorySQLAlchemy,
        produto_repo: ProdutoRepositorySQLAlchemy,
        vendas_repo: VendasRepositorySQLAlchemy,
        financeiro_repo: FinanceiroRepositorySQLAlchemy
    ):
        self.cliente_repo = cliente_repo
        self.produto_repo = produto_repo
        self.vendas_repo = vendas_repo
        self.financeiro_repo = financeiro_repo

    def executar(self, dto: CriarVendaDto) -> PedidoVenda:
        cliente = self.cliente_repo.buscar_por_id(dto.cliente_id)
        if not cliente:
            raise ValueError(f"Cliente não encontrado: {dto.cliente_id}")

        venda = PedidoVenda(id=dto.venda_id, cliente=cliente, data_pedido=date.today())
        
        for item_dto in dto.itens:
            produto = self.produto_repo.buscar_por_id(item_dto.produto_id)
            if not produto:
                raise ValueError(f"Produto não encontrado: {item_dto.produto_id}")
            
            venda.adicionar_item(ItemPedidoVenda(
                produto=produto,
                quantidade=item_dto.quantidade,
                valor_unitario=Money(item_dto.valor_unitario)
            ))

        # Salva a venda
        self.vendas_repo.salvar(venda)

        # Se a venda for "Aprovada" (aqui simplificamos para aprovação automática no rascunho pra fins de demo)
        # Geramos a conta a receber
        conta = ContaReceber(
            id=f"REC-{venda.id}",
            origem_id=venda.id,
            valor=venda.valor_total(),
            data_vencimento=date.today() # Vencimento hoje por padrão
        )
        self.financeiro_repo.salvar_recebivel(conta)

        return venda
