from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from infrastructure.database import Base

class ProdutoORM(Base):
    __tablename__ = "produtos"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    codigo_barras = Column(String, unique=True, index=True)
    ativo = Column(Boolean, default=True)

class FornecedorORM(Base):
    __tablename__ = "fornecedores"

    id = Column(String, primary_key=True, index=True)
    razao_social = Column(String, nullable=False)
    cnpj = Column(String, unique=True, index=True) # Guardaremos o numero limpo
    ativo = Column(Boolean, default=True)

class PedidoORM(Base):
    __tablename__ = "pedidos"

    id = Column(String, primary_key=True, index=True)
    fornecedor_id = Column(String, ForeignKey("fornecedores.id"))
    data_emissao = Column(Date, nullable=False)
    status = Column(String, default="RASCUNHO")

    fornecedor = relationship("FornecedorORM")
    itens = relationship("ItemPedidoORM", back_populates="pedido", cascade="all, delete-orphan")

class ItemPedidoORM(Base):
    __tablename__ = "itens_pedido"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pedido_id = Column(String, ForeignKey("pedidos.id"))
    produto_id = Column(String, ForeignKey("produtos.id"))
    quantidade = Column(Integer, nullable=False)
    valor_unitario = Column(Numeric(10, 2), nullable=False)
    moeda = Column(String, default="BRL")

    pedido = relationship("PedidoORM", back_populates="itens")
    produto = relationship("ProdutoORM")
