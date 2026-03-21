"""Add missing tables for robust, phase6, controlling and rh models

Revision ID: 002_missing_tables
Revises: 001_initial
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_missing_tables'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tabelas de robust_models (Vendas e Financeiro)
    
    # Clientes (atualizar se existir)
    op.create_table('clientes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('razao_social', sa.String(), nullable=False),
        sa.Column('cnpj_cpf', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('telefone', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cnpj_cpf')
    )
    
    # Pedidos Venda
    op.create_table('pedidos_venda',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cliente_id', sa.String(), nullable=True),
        sa.Column('data_pedido', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='ORCAMENTO'),
        sa.Column('status_logistica', sa.String(), nullable=False, default='PENDENTE'),
        sa.Column('codigo_rastreio', sa.String(), nullable=True),
        sa.Column('valor_total', sa.Float(), nullable=False, default=0.0),
        sa.Column('vendedor_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.ForeignKeyConstraint(['vendedor_id'], ['vendedores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Itens Pedido Venda
    op.create_table('itens_pedido_venda',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('pedido_id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('valor_unitario', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['pedido_id'], ['pedidos_venda.id']),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Lancamentos Financeiros
    op.create_table('financeiro_lancamentos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('origem_id', sa.String(), nullable=False),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.Column('vencimento', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='PENDENTE'),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Tabelas de phase6_models (Estoque, Compras, Fiscal, Faturamento, Contratos, Contabilidade)
    
    # Parametros Estoque
    op.create_table('parametros_estoque',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('valor', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Custo Medio
    op.create_table('custo_medio',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('data', sa.Date(), nullable=False),
        sa.Column('custo', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Ajustes Estoque
    op.create_table('ajustes_estoque',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('motivo', sa.String(), nullable=True),
        sa.Column('data', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Solicitacoes Compra
    op.create_table('solicitacoes_compra',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('urgencia', sa.String(), nullable=False, default='NORMAL'),
        sa.Column('status', sa.String(), nullable=False, default='ABERTA'),
        sa.Column('data_solicitacao', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Cotacoes
    op.create_table('cotacoes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('solicitacao_id', sa.String(), nullable=False),
        sa.Column('fornecedor_id', sa.String(), nullable=False),
        sa.Column('valor_total', sa.Float(), nullable=False),
        sa.Column('prazo_entrega', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, default='ABERTA'),
        sa.Column('data_cotacao', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['solicitacao_id'], ['solicitacoes_compra.id']),
        sa.ForeignKeyConstraint(['fornecedor_id'], ['fornecedores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Itens Cotacao
    op.create_table('itens_cotacao',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('cotacao_id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('valor_unitario', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['cotacao_id'], ['cotacoes.id']),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Conferencias Fisicas
    op.create_table('conferencias_fisicas',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('data', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='EM_ANDAMENTO'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Notas Fiscais Entrada
    op.create_table('notas_fiscais_entrada',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('numero', sa.String(), nullable=False),
        sa.Column('serie', sa.String(), nullable=True),
        sa.Column('fornecedor_id', sa.String(), nullable=False),
        sa.Column('data_emissao', sa.Date(), nullable=False),
        sa.Column('data_recebimento', sa.Date(), nullable=False),
        sa.Column('valor_total', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='RECEBIDA'),
        sa.ForeignKeyConstraint(['fornecedor_id'], ['fornecedores.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero')
    )
    
    # Itens NF Entrada
    op.create_table('itens_nf_entrada',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nf_id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('valor_unitario', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['nf_id'], ['notas_fiscais_entrada.id']),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Regras Fiscais
    op.create_table('regras_fiscais',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('aliquota', sa.Float(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Livro Fiscal
    op.create_table('livro_fiscal',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('periodo', sa.String(), nullable=False),
        sa.Column('data_emissao', sa.Date(), nullable=False),
        sa.Column('total', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Propostas Comerciais
    op.create_table('propostas_comerciais',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cliente_id', sa.String(), nullable=False),
        sa.Column('valor_total', sa.Float(), nullable=False),
        sa.Column('validade', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='ABERTA'),
        sa.Column('data_criacao', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Itens Proposta
    op.create_table('itens_proposta',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('proposta_id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('valor_unitario', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['proposta_id'], ['propostas_comerciais.id']),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Notas Fiscais Saida
    op.create_table('notas_fiscais_saida',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('numero', sa.String(), nullable=False),
        sa.Column('serie', sa.String(), nullable=True),
        sa.Column('cliente_id', sa.String(), nullable=False),
        sa.Column('data_emissao', sa.Date(), nullable=False),
        sa.Column('valor_total', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='EMITIDA'),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero')
    )
    
    # Contratos
    op.create_table('contratos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cliente_id', sa.String(), nullable=False),
        sa.Column('numero', sa.String(), nullable=False),
        sa.Column('valor_mensal', sa.Float(), nullable=False),
        sa.Column('data_inicio', sa.Date(), nullable=False),
        sa.Column('data_fim', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='ATIVO'),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero')
    )
    
    # Contratos Servico
    op.create_table('contratos_servico',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cliente_id', sa.String(), nullable=False),
        sa.Column('servico', sa.String(), nullable=False),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.Column('data_inicio', sa.Date(), nullable=False),
        sa.Column('data_fim', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='ATIVO'),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Contas Contabeis
    op.create_table('contas_contabeis',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('codigo', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('nivel', sa.Integer(), nullable=False),
        sa.Column('ativa', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo')
    )
    
    # Lancamentos Contabeis
    op.create_table('lancamentos_contabeis',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('data', sa.Date(), nullable=False),
        sa.Column('historico', sa.String(), nullable=True),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Partidas Contabeis
    op.create_table('partidas_contabeis',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('lancamento_id', sa.String(), nullable=False),
        sa.Column('conta_id', sa.String(), nullable=False),
        sa.Column('debito', sa.Float(), nullable=False, default=0.0),
        sa.Column('credito', sa.Float(), nullable=False, default=0.0),
        sa.ForeignKeyConstraint(['lancamento_id'], ['lancamentos_contabeis.id']),
        sa.ForeignKeyConstraint(['conta_id'], ['contas_contabeis.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Tabelas de controlling_models
    
    # Centros Custo
    op.create_table('centros_custo',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('codigo', sa.String(), nullable=False),
        sa.Column('tipo', sa.String(), nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo')
    )
    
    # Plano Orcamentario
    op.create_table('plano_orcamentario',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('ano', sa.Integer(), nullable=False),
        sa.Column('centro_custo_id', sa.String(), nullable=False),
        sa.Column('valor_orcado', sa.Float(), nullable=False),
        sa.Column('valor_realizado', sa.Float(), nullable=False, default=0.0),
        sa.Column('periodo', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['centro_custo_id'], ['centros_custo.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Realizado Custo
    op.create_table('realizado_custo',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('centro_custo_id', sa.String(), nullable=False),
        sa.Column('mes', sa.Integer(), nullable=False),
        sa.Column('ano', sa.Integer(), nullable=False),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['centro_custo_id'], ['centros_custo.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Tabelas de rh_models
    
    # Cargos
    op.create_table('cargos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('salario_base', sa.Float(), nullable=True),
        sa.Column('departamento', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Funcionarios
    op.create_table('funcionarios',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('cpf', sa.String(), nullable=False),
        sa.Column('cargo_id', sa.String(), nullable=True),
        sa.Column('data_admissao', sa.Date(), nullable=False),
        sa.Column('salario', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, default='ATIVO'),
        sa.ForeignKeyConstraint(['cargo_id'], ['cargos.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf')
    )
    
    # Folhas Pagamento
    op.create_table('folhas_pagamento',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('funcionario_id', sa.String(), nullable=False),
        sa.Column('mes', sa.Integer(), nullable=False),
        sa.Column('ano', sa.Integer(), nullable=False),
        sa.Column('salario_bruto', sa.Float(), nullable=False),
        sa.Column('salario_liquido', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='PENDENTE'),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['funcionario_id'], ['funcionarios.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Registros Ponto
    op.create_table('registros_ponto',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('funcionario_id', sa.String(), nullable=False),
        sa.Column('data', sa.Date(), nullable=False),
        sa.Column('hora_entrada', sa.Time(), nullable=True),
        sa.Column('hora_saida', sa.Time(), nullable=True),
        sa.ForeignKeyConstraint(['funcionario_id'], ['funcionarios.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # RH
    op.drop_table('registros_ponto')
    op.drop_table('folhas_pagamento')
    op.drop_table('funcionarios')
    op.drop_table('cargos')
    
    # Controlling
    op.drop_table('realizado_custo')
    op.drop_table('plano_orcamentario')
    op.drop_table('centros_custo')
    
    # Contabilidade
    op.drop_table('partidas_contabeis')
    op.drop_table('lancamentos_contabeis')
    op.drop_table('contas_contabeis')
    
    # Contratos e Faturamento
    op.drop_table('contratos_servico')
    op.drop_table('contratos')
    op.drop_table('notas_fiscais_saida')
    op.drop_table('itens_proposta')
    op.drop_table('propostas_comerciais')
    op.drop_table('livro_fiscal')
    op.drop_table('regras_fiscais')
    op.drop_table('itens_nf_entrada')
    op.drop_table('notas_fiscais_entrada')
    op.drop_table('conferencias_fisicas')
    op.drop_table('itens_cotacao')
    op.drop_table('cotacoes')
    op.drop_table('solicitacoes_compra')
    op.drop_table('ajustes_estoque')
    op.drop_table('custo_medio')
    op.drop_table('parametros_estoque')
    
    # Financeiro
    op.drop_table('financeiro_lancamentos')
    op.drop_table('itens_pedido_venda')
    op.drop_table('pedidos_venda')
    op.drop_table('clientes')