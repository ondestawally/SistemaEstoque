from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from infrastructure.database import Base
# O ProdutoORM já está em erp_models, podemos importar ou usar string references 
# nas ForeignKey ("produtos.id"). Por simplicidade, usaremos ForeignKey string.

class ArmazemORM(Base):
    __tablename__ = "armazens"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)

    posicoes = relationship("PosicaoORM", back_populates="armazem", cascade="all, delete-orphan")

class PosicaoORM(Base):
    __tablename__ = "posicoes"

    id = Column(String, primary_key=True, index=True)
    codigo = Column(String, nullable=False, unique=True)
    armazem_id = Column(String, ForeignKey("armazens.id"))
    bloqueada = Column(Boolean, default=False)

    armazem = relationship("ArmazemORM", back_populates="posicoes")
    # Uma posicao pode ter muitas alocacoes
    alocacoes = relationship("AlocacaoORM", back_populates="posicao", cascade="all, delete-orphan")

class LoteORM(Base):
    __tablename__ = "lotes"

    id = Column(String, primary_key=True, index=True)
    produto_id = Column(String, ForeignKey("produtos.id"))
    quantidade_inicial = Column(Integer, nullable=False)
    quantidade_disponivel = Column(Integer, nullable=False)
    data_validade = Column(Date, nullable=True)

    # produto = relationship("ProdutoORM") # Para evitar import circular ou setup complexo, podemos acessar pos id
    alocacoes = relationship("AlocacaoORM", back_populates="lote", cascade="all, delete-orphan")

class AlocacaoORM(Base):
    __tablename__ = "alocacoes"

    id = Column(String, primary_key=True, index=True)
    lote_id = Column(String, ForeignKey("lotes.id"))
    posicao_id = Column(String, ForeignKey("posicoes.id"))
    quantidade = Column(Integer, nullable=False)

    lote = relationship("LoteORM", back_populates="alocacoes")
    posicao = relationship("PosicaoORM", back_populates="alocacoes")
