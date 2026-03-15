from typing import Optional, List
from sqlalchemy.orm import Session
from domain.vendas.cliente import Cliente
from domain.vendas.pedidos import PedidoVenda, ItemPedidoVenda, StatusPedidoVenda
from domain.financeiro.conta_receber import ContaReceber, StatusFinanceiro
from domain.value_objects import Money
from infrastructure.orm_models.robust_models import ClienteORM, PedidoVendaORM, ItemPedidoVendaORM, LancamentoFinanceiroORM

class ClienteRepositorySQLAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def salvar(self, cliente: Cliente) -> None:
        orm = self.db.query(ClienteORM).filter(ClienteORM.id == cliente.id).first()
        if not orm:
            orm = ClienteORM(id=cliente.id)
            self.db.add(orm)
        orm.razao_social = cliente.razao_social
        orm.cnpj_cpf = cliente.cnpj_cpf
        orm.email = cliente.email
        orm.telefone = cliente.telefone
        orm.ativo = cliente.ativo
        self.db.commit()

    def buscar_por_id(self, id: str) -> Optional[Cliente]:
        orm = self.db.query(ClienteORM).filter(ClienteORM.id == id).first()
        if not orm: return None
        return Cliente(
            id=orm.id, razao_social=orm.razao_social, 
            cnpj_cpf=orm.cnpj_cpf, email=orm.email, 
            telefone=orm.telefone, ativo=orm.ativo
        )

    def listar_todos(self) -> List[Cliente]:
        orms = self.db.query(ClienteORM).all()
        return [Cliente(id=o.id, razao_social=o.razao_social, cnpj_cpf=o.cnpj_cpf) for o in orms]

class VendasRepositorySQLAlchemy:
    def __init__(self, db: Session, cliente_repo: ClienteRepositorySQLAlchemy):
        self.db = db
        self.cliente_repo = cliente_repo

    def salvar(self, pedido: PedidoVenda) -> None:
        orm = self.db.query(PedidoVendaORM).filter(PedidoVendaORM.id == pedido.id).first()
        if not orm:
            orm = PedidoVendaORM(id=pedido.id)
            self.db.add(orm)
        orm.cliente_id = pedido.cliente.id
        orm.data_pedido = pedido.data_pedido
        orm.status = pedido.status.value

        # Itens
        self.db.query(ItemPedidoVendaORM).filter(ItemPedidoVendaORM.pedido_id == pedido.id).delete()
        for item in pedido.itens:
            item_orm = ItemPedidoVendaORM(
                pedido_id=pedido.id,
                produto_id=item.produto.id,
                quantidade=item.quantidade,
                valor_unitario=item.valor_unitario.amount
            )
            self.db.add(item_orm)
        self.db.commit()

class FinanceiroRepositorySQLAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def salvar_recebivel(self, conta: ContaReceber) -> None:
        orm = self.db.query(LancamentoFinanceiroORM).filter(LancamentoFinanceiroORM.id == conta.id).first()
        if not orm:
            orm = LancamentoFinanceiroORM(id=conta.id, tipo="RECEBER", origem_id=conta.origem_id)
            self.db.add(orm)
        orm.valor = conta.valor.amount
        orm.vencimento = conta.data_vencimento
        orm.status = conta.status.value
        orm.data_pagamento = conta.data_pagamento
        self.db.commit()
