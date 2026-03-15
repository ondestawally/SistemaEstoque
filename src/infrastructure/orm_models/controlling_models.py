"""
ORM Models — Controlling
Centros de Custo, Plano Orçamentário, Realizado
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, Numeric, UniqueConstraint
from datetime import datetime
from infrastructure.database import Base


class CentroCustoORM(Base):
    __tablename__ = "centros_custo"
    id = Column(String, primary_key=True)
    codigo = Column(String, unique=True, nullable=False)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)      # PRODUCAO, ADMINISTRATIVO, VENDAS, TI, etc.
    responsavel = Column(String, nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class PlanoOrcamentarioORM(Base):
    __tablename__ = "plano_orcamentario"
    id = Column(String, primary_key=True)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)       # 1-12
    centro_custo_id = Column(String, nullable=False)
    conta_codigo = Column(String, nullable=False)
    valor_orcado = Column(Numeric(14, 2), nullable=False)
    observacao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        UniqueConstraint("ano", "mes", "centro_custo_id", "conta_codigo", name="uq_plano_orcamentario"),
    )


class RealizadoCustoORM(Base):
    __tablename__ = "realizado_custo"
    id = Column(String, primary_key=True)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)
    centro_custo_id = Column(String, nullable=False)
    conta_codigo = Column(String, nullable=False)
    valor_realizado = Column(Numeric(14, 2), nullable=False)
    descricao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
