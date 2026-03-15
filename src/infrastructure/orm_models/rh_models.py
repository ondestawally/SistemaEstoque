"""
ORM Models — RH (Recursos Humanos)
Cargos, Funcionários, Folha de Pagamento, Ponto
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, Date, DateTime, Text, Numeric
from datetime import datetime
from infrastructure.database import Base


class CargoORM(Base):
    __tablename__ = "cargos"
    id = Column(String, primary_key=True)
    nome = Column(String, nullable=False)
    nivel = Column(String, nullable=False)
    salario_base = Column(Float, nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class FuncionarioORM(Base):
    __tablename__ = "funcionarios"
    id = Column(String, primary_key=True)
    nome = Column(String, nullable=False)
    cpf = Column(String(14), unique=True, nullable=False)
    cargo_id = Column(String, nullable=False)
    data_admissao = Column(Date, nullable=False)
    status = Column(String, default="ATIVO")  # ATIVO, FERIAS, AFASTADO, DEMITIDO
    email = Column(String, nullable=True)
    telefone = Column(String, nullable=True)
    num_dependentes = Column(Integer, default=0)
    salario_atual = Column(Float, nullable=True)   # Sobreposição do salário base do cargo
    criado_em = Column(DateTime, default=datetime.utcnow)


class FolhaPagamentoORM(Base):
    __tablename__ = "folhas_pagamento"
    id = Column(String, primary_key=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    funcionario_id = Column(String, nullable=False)
    salario_bruto = Column(Numeric(12, 2), nullable=False)
    desconto_inss = Column(Numeric(12, 2), default=0.0)
    desconto_irrf = Column(Numeric(12, 2), default=0.0)
    outros_descontos = Column(Numeric(12, 2), default=0.0)
    outros_acrescimos = Column(Numeric(12, 2), default=0.0)
    salario_liquido = Column(Numeric(12, 2), nullable=False)
    num_dependentes = Column(Integer, default=0)
    observacao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class RegistroPontoORM(Base):
    __tablename__ = "registros_ponto"
    id = Column(String, primary_key=True)
    funcionario_id = Column(String, nullable=False)
    data = Column(Date, nullable=False)
    entrada = Column(String(5), nullable=True)   # "HH:MM"
    saida = Column(String(5), nullable=True)     # "HH:MM"
    horas_trabalhadas = Column(Float, nullable=True)
    observacao = Column(Text, nullable=True)
