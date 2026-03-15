from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
from infrastructure.database import Base
from datetime import datetime
import enum

class StatusLead(enum.Enum):
    NOVO = "NOVO"
    EM_CONTATO = "EM_CONTATO"
    QUALIFICADO = "QUALIFICADO"
    DESQUALIFICADO = "DESQUALIFICADO"

class EtapaVenda(enum.Enum):
    PROSPECCAO = "PROSPECCAO"
    QUALIFICACAO = "QUALIFICACAO"
    PROPOSTA = "PROPOSTA"
    NEGOCIACAO = "NEGOCIACAO"
    FECHADO_GANHO = "FECHADO_GANHO"
    FECHADO_PERDIDO = "FECHADO_PERDIDO"

class VendedorORM(Base):
    __tablename__ = "vendedores"
    id = Column(String, primary_key=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True)
    comissao_percentual = Column(Float, default=2.0)
    ativo = Column(Boolean, default=True)

class LeadORM(Base):
    __tablename__ = "crm_leads"
    id = Column(String, primary_key=True)
    nome_contato = Column(String, nullable=False)
    empresa = Column(String)
    email = Column(String)
    telefone = Column(String)
    status = Column(SQLEnum(StatusLead), default=StatusLead.NOVO)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    observacoes = Column(Text)

class OportunidadeORM(Base):
    __tablename__ = "crm_oportunidades"
    id = Column(String, primary_key=True)
    lead_id = Column(String, ForeignKey("crm_leads.id"))
    vendedor_id = Column(String, ForeignKey("vendedores.id"))
    titulo = Column(String, nullable=False)
    valor_estimado = Column(Float, default=0.0)
    etapa = Column(SQLEnum(EtapaVenda), default=EtapaVenda.PROSPECCAO)
    data_fechamento_estimada = Column(Date)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    
    lead = relationship("LeadORM")
    vendedor = relationship("VendedorORM")

class ComissaoORM(Base):
    __tablename__ = "comissoes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendedor_id = Column(String, ForeignKey("vendedores.id"))
    pedido_id = Column(String, ForeignKey("pedidos_venda.id"))
    valor_venda = Column(Float, nullable=False)
    valor_comissao = Column(Float, nullable=False)
    data_geracao = Column(DateTime, default=datetime.utcnow)
    paga = Column(Boolean, default=False)
    
    vendedor = relationship("VendedorORM")

class ContratoORM(Base):
    __tablename__ = "contratos_servico"
    id = Column(String, primary_key=True)
    cliente_id = Column(String, ForeignKey("clientes.id"))
    titulo = Column(String, nullable=False)
    valor_recorrente = Column(Float, nullable=False)
    dia_faturamento = Column(Integer, default=1)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date)
    ativo = Column(Boolean, default=True)
    
    cliente = relationship("ClienteORM")
