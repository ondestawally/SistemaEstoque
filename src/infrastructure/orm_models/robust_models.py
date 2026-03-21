from sqlalchemy import Column, String, Integer, Float, Date, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from infrastructure.database import Base
import enum

class StatusPedidoVenda(enum.Enum):
    ORCAMENTO = "ORCAMENTO"
    APROVADO = "APROVADO"
    FATURADO = "FATURADO"
    CANCELADO = "CANCELADO"

class StatusLogistica(enum.Enum):
    PENDENTE = "PENDENTE"
    PICKING = "PICKING"
    PACKING = "PACKING"
    DESPACHADO = "DESPACHADO"
    ENTREGUE = "ENTREGUE"

class StatusFinanceiro(enum.Enum):
    PENDENTE = "PENDENTE"
    PAGO = "PAGO"
    ATRASADO = "ATRASADO"
    CANCELADO = "CANCELADO"

class ClienteORM(Base):
    __tablename__ = "clientes"
    id = Column(String, primary_key=True)
    razao_social = Column(String, nullable=False)
    cnpj_cpf = Column(String, nullable=False)
    email = Column(String)
    telefone = Column(String)
    ativo = Column(Boolean, default=True)

class PedidoVendaORM(Base):
    __tablename__ = "pedidos_venda"
    id = Column(String, primary_key=True)
    cliente_id = Column(String, ForeignKey("clientes.id"))
    data_pedido = Column(Date, nullable=False)
    status = Column(SQLEnum(StatusPedidoVenda), default=StatusPedidoVenda.ORCAMENTO)
    status_logistica = Column(SQLEnum(StatusLogistica), default=StatusLogistica.PENDENTE)
    codigo_rastreio = Column(String, nullable=True)
    valor_total = Column(Float, default=0.0)
    vendedor_id = Column(String, ForeignKey("vendedores.id"), nullable=True)
    
    cliente = relationship("ClienteORM")
    vendedor = relationship("VendedorORM")
    itens = relationship("ItemPedidoVendaORM", back_populates="pedido")

class ItemPedidoVendaORM(Base):
    __tablename__ = "itens_pedido_venda"
    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(String, ForeignKey("pedidos_venda.id"))
    produto_id = Column(String, ForeignKey("produtos.id"))
    quantidade = Column(Integer, nullable=False)
    valor_unitario = Column(Float, nullable=False)
    
    pedido = relationship("PedidoVendaORM", back_populates="itens")

class LancamentoFinanceiroORM(Base):
    __tablename__ = "financeiro_lancamentos"
    id = Column(String, primary_key=True)
    tipo = Column(String, nullable=False) # 'PAGAR' ou 'RECEBER'
    origem_id = Column(String, nullable=False)
    valor = Column(Float, nullable=False)
    data_lancamento = Column(Date, nullable=False)
    vencimento = Column(Date, nullable=False)
    status = Column(SQLEnum(StatusFinanceiro), default=StatusFinanceiro.PENDENTE)
    data_pagamento = Column(Date)
