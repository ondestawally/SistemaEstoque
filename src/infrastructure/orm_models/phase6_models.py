"""
ORM Models — Fase 6
Estoque/Custos, Compras Workflow, Fiscal, Faturamento, Contratos
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, Date, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.database import Base


# ============================================================
# ESTOQUE E CUSTOS
# ============================================================
class ParametroEstoqueORM(Base):
    __tablename__ = "parametros_estoque"
    produto_id = Column(String, ForeignKey("produtos.id"), primary_key=True)
    estoque_minimo = Column(Float, default=0.0)
    estoque_maximo = Column(Float, default=0.0)
    ponto_pedido = Column(Float, default=0.0)
    lead_time_dias = Column(Integer, default=0)

class CustoMedioORM(Base):
    __tablename__ = "custo_medio"
    produto_id = Column(String, ForeignKey("produtos.id"), primary_key=True)
    custo_medio_atual = Column(Float, default=0.0)
    quantidade_em_estoque = Column(Float, default=0.0)
    ultima_atualizacao = Column(DateTime, default=datetime.utcnow)

class AjusteEstoqueORM(Base):
    __tablename__ = "ajustes_estoque"
    id = Column(String, primary_key=True)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    tipo = Column(String, nullable=False)  # ENTRADA, SAIDA, INVENTARIO
    quantidade = Column(Float, nullable=False)
    custo_unitario = Column(Float, default=0.0)
    motivo = Column(Text)
    usuario = Column(String)
    data_ajuste = Column(DateTime, default=datetime.utcnow)


# ============================================================
# COMPRAS WORKFLOW
# ============================================================
class SolicitacaoCompraORM(Base):
    __tablename__ = "solicitacoes_compra"
    id = Column(String, primary_key=True)
    solicitante = Column(String, nullable=False)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Float, nullable=False)
    justificativa = Column(Text)
    urgencia = Column(String, default="NORMAL")
    status = Column(String, default="RASCUNHO")
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_necessidade = Column(DateTime, nullable=True)

class CotacaoORM(Base):
    __tablename__ = "cotacoes"
    id = Column(String, primary_key=True)
    solicitacao_id = Column(String, ForeignKey("solicitacoes_compra.id"), nullable=False)
    status = Column(String, default="ABERTA")
    fornecedor_vencedor_id = Column(String, nullable=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    itens = relationship("ItemCotacaoORM", back_populates="cotacao", cascade="all, delete-orphan")

class ItemCotacaoORM(Base):
    __tablename__ = "itens_cotacao"
    id = Column(Integer, primary_key=True, autoincrement=True)
    cotacao_id = Column(String, ForeignKey("cotacoes.id"), nullable=False)
    fornecedor_id = Column(String, ForeignKey("fornecedores.id"), nullable=False)
    fornecedor_nome = Column(String)
    preco_unitario = Column(Float, nullable=False)
    condicao_pagamento = Column(String, default="30 dias")
    prazo_entrega_dias = Column(Integer, default=7)
    observacao = Column(Text)
    cotacao = relationship("CotacaoORM", back_populates="itens")

class ConferenciaFisicaORM(Base):
    __tablename__ = "conferencias_fisicas"
    id = Column(String, primary_key=True)
    pedido_id = Column(String, ForeignKey("pedidos.id"), nullable=False)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    quantidade_pedida = Column(Float, nullable=False)
    quantidade_recebida = Column(Float, nullable=False)
    data_conferencia = Column(DateTime, default=datetime.utcnow)
    responsavel = Column(String)
    observacao = Column(Text)

class NotaFiscalEntradaORM(Base):
    __tablename__ = "notas_fiscais_entrada"
    id = Column(String, primary_key=True)
    numero = Column(String, nullable=False)
    serie = Column(String, nullable=False)
    emitente_cnpj = Column(String, nullable=False)
    emitente_nome = Column(String, nullable=False)
    pedido_id = Column(String, ForeignKey("pedidos.id"), nullable=True)
    valor_total = Column(Numeric(12, 2), nullable=False)
    data_emissao = Column(DateTime, nullable=False)
    data_entrada = Column(DateTime, default=datetime.utcnow)
    chave_acesso = Column(String, unique=True, nullable=True)
    observacao = Column(Text)
    itens = relationship("ItemNotaFiscalEntradaORM", back_populates="nota", cascade="all, delete-orphan")

class ItemNotaFiscalEntradaORM(Base):
    __tablename__ = "itens_nf_entrada"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nota_id = Column(String, ForeignKey("notas_fiscais_entrada.id"), nullable=False)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Float, nullable=False)
    valor_unitario = Column(Float, nullable=False)
    nota = relationship("NotaFiscalEntradaORM", back_populates="itens")


# ============================================================
# FISCAL
# ============================================================
class RegraFiscalORM(Base):
    __tablename__ = "regras_fiscais"
    id = Column(String, primary_key=True)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    uf_origem = Column(String(2), nullable=False)
    uf_destino = Column(String(2), nullable=False)
    cfop = Column(String(4), nullable=False)
    aliquota_icms = Column(Float, default=0.0)
    aliquota_pis = Column(Float, default=0.0)
    aliquota_cofins = Column(Float, default=0.0)
    aliquota_ipi = Column(Float, default=0.0)
    ativo = Column(Boolean, default=True)

class LivroFiscalORM(Base):
    __tablename__ = "livro_fiscal"
    id = Column(String, primary_key=True)
    tipo = Column(String, nullable=False)  # ENTRADA, SAIDA
    data = Column(DateTime, nullable=False)
    participante_cnpj = Column(String)
    participante_nome = Column(String)
    numero_nf = Column(String, nullable=False)
    serie_nf = Column(String, default="1")
    cfop = Column(String(4))
    valor_contabil = Column(Numeric(12, 2), default=0.0)
    valor_icms = Column(Numeric(12, 2), default=0.0)
    valor_pis = Column(Numeric(12, 2), default=0.0)
    valor_cofins = Column(Numeric(12, 2), default=0.0)
    valor_ipi = Column(Numeric(12, 2), default=0.0)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=True)
    mes_referencia = Column(Integer)
    ano_referencia = Column(Integer)


# ============================================================
# FATURAMENTO
# ============================================================
class PropostaComercialORM(Base):
    __tablename__ = "propostas_comerciais"
    id = Column(String, primary_key=True)
    cliente_id = Column(String, ForeignKey("clientes.id"), nullable=False)
    validade = Column(Date, nullable=False)
    status = Column(String, default="RASCUNHO")
    desconto_global_pct = Column(Float, default=0.0)
    condicao_pagamento = Column(String, default="30 dias")
    observacao = Column(Text)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    valor_total = Column(Float, default=0.0)
    itens = relationship("ItemPropostaORM", back_populates="proposta", cascade="all, delete-orphan")

class ItemPropostaORM(Base):
    __tablename__ = "itens_proposta"
    id = Column(Integer, primary_key=True, autoincrement=True)
    proposta_id = Column(String, ForeignKey("propostas_comerciais.id"), nullable=False)
    produto_id = Column(String, ForeignKey("produtos.id"), nullable=False)
    produto_nome = Column(String)
    quantidade = Column(Float, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    desconto_pct = Column(Float, default=0.0)
    proposta = relationship("PropostaComercialORM", back_populates="itens")

class NotaFiscalSaidaORM(Base):
    __tablename__ = "notas_fiscais_saida"
    id = Column(String, primary_key=True)
    pedido_venda_id = Column(String, ForeignKey("pedidos_venda.id"), nullable=False)
    numero_nf = Column(String, nullable=False)
    serie = Column(String, default="1")
    valor_produtos = Column(Numeric(12, 2), default=0.0)
    valor_total = Column(Numeric(12, 2), nullable=False)
    data_emissao = Column(DateTime, default=datetime.utcnow)
    chave_acesso = Column(String, unique=True, nullable=True)
    valor_icms = Column(Numeric(12, 2), default=0.0)
    valor_pis = Column(Numeric(12, 2), default=0.0)
    valor_cofins = Column(Numeric(12, 2), default=0.0)
    valor_ipi = Column(Numeric(12, 2), default=0.0)
    status = Column(String, default="EMITIDA")


# ============================================================
# CONTRATOS
# ============================================================
class ContratoORM(Base):
    __tablename__ = "contratos"
    id = Column(String, primary_key=True)
    tipo = Column(String, nullable=False)  # FORNECEDOR, CLIENTE, SERVICO
    parceiro_id = Column(String, nullable=False)
    parceiro_nome = Column(String, nullable=False)
    objeto = Column(Text, nullable=False)
    valor_mensal = Column(Numeric(12, 2), default=0.0)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=False)
    status = Column(String, default="ATIVO")
    numero_contrato = Column(String, unique=True, nullable=True)
    condicao_pagamento = Column(String)
    observacao = Column(Text)
    data_criacao = Column(DateTime, default=datetime.utcnow)


# ============================================================
# CONTABILIDADE
# ============================================================
class ContaContabilORM(Base):
    __tablename__ = "contas_contabeis"
    codigo = Column(String, primary_key=True)   # ex: "1.1.01"
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)        # ATIVO, PASSIVO, RECEITA, DESPESA, PATRIMONIO
    natureza = Column(String, nullable=False)    # DEVEDORA, CREDORA
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    partidas = relationship("PartidaORM", back_populates="conta")

class LancamentoContabilORM(Base):
    __tablename__ = "lancamentos_contabeis"
    id = Column(String, primary_key=True)
    data = Column(Date, nullable=False)
    historico = Column(Text, nullable=False)
    usuario = Column(String, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    partidas = relationship("PartidaORM", back_populates="lancamento", cascade="all, delete-orphan")

class PartidaORM(Base):
    __tablename__ = "partidas_contabeis"
    id = Column(Integer, primary_key=True, autoincrement=True)
    lancamento_id = Column(String, ForeignKey("lancamentos_contabeis.id"), nullable=False)
    conta_codigo = Column(String, ForeignKey("contas_contabeis.codigo"), nullable=False)
    valor = Column(Numeric(14, 2), nullable=False)
    dc = Column(String(1), nullable=False)      # "D" = Débito, "C" = Crédito
    lancamento = relationship("LancamentoContabilORM", back_populates="partidas")
    conta = relationship("ContaContabilORM", back_populates="partidas")
