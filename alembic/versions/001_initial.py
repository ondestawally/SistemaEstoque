"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2024-03-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    # Audit Logs
    op.create_table('audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Armazens
    op.create_table('armazens',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('localizacao', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Posicoes
    op.create_table('posicoes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('armazem_id', sa.String(), nullable=False),
        sa.Column('corredor', sa.String(), nullable=False),
        sa.Column('rack', sa.String(), nullable=False),
        sa.Column('nivel', sa.String(), nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.ForeignKeyConstraint(['armazem_id'], ['armazens.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Produtos
    op.create_table('produtos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('descricao', sa.String(), nullable=True),
        sa.Column('codigo_barras', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Fornecedores
    op.create_table('fornecedores',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('razao_social', sa.String(), nullable=False),
        sa.Column('cnpj', sa.String(), nullable=False),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cnpj')
    )

    # Pedidos (Compra)
    op.create_table('pedidos',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('fornecedor_id', sa.String(), nullable=False),
        sa.Column('data_emissao', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='RASCUNHO'),
        sa.ForeignKeyConstraint(['fornecedor_id'], ['fornecedores.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Itens Pedido
    op.create_table('itens_pedido',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('pedido_id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.Column('valor_unitario', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('moeda', sa.String(), nullable=False, default='BRL'),
        sa.ForeignKeyConstraint(['pedido_id'], ['pedidos.id']),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Lotes
    op.create_table('lotes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('produto_id', sa.String(), nullable=False),
        sa.Column('quantidade_inicial', sa.Integer(), nullable=False),
        sa.Column('quantidade_disponivel', sa.Integer(), nullable=False),
        sa.Column('data_validade', sa.Date(), nullable=True),
        sa.Column('data_recebimento', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['produto_id'], ['produtos.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Alocacoes
    op.create_table('alocacoes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('lote_id', sa.String(), nullable=False),
        sa.Column('posicao_id', sa.String(), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['lote_id'], ['lotes.id']),
        sa.ForeignKeyConstraint(['posicao_id'], ['posicoes.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Clientes
    op.create_table('clientes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('telefone', sa.String(), nullable=True),
        sa.Column('endereco', sa.Text(), nullable=True),
        sa.Column('cnpj_cpf', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )

    # CRM Leads
    op.create_table('crm_leads',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('telefone', sa.String(), nullable=True),
        sa.Column('empresa', sa.String(), nullable=True),
        sa.Column('origem', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, default='NOVO'),
        sa.Column('data_criacao', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # CRM Oportunidades
    op.create_table('crm_oportunidades',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('titulo', sa.String(), nullable=False),
        sa.Column('lead_id', sa.String(), nullable=True),
        sa.Column('cliente_id', sa.String(), nullable=True),
        sa.Column('valor', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('etapa', sa.String(), nullable=False, default='PROSPECCAO'),
        sa.Column('data_fechamento_esperada', sa.Date(), nullable=True),
        sa.Column('data_criacao', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['lead_id'], ['crm_leads.id']),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Vendedores
    op.create_table('vendedores',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('nome', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('telefone', sa.String(), nullable=True),
        sa.Column('ativo', sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Comissoes
    op.create_table('comissoes',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('vendedor_id', sa.String(), nullable=False),
        sa.Column('pedido_venda_id', sa.String(), nullable=True),
        sa.Column('valor_venda', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('percentual', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('valor_comissao', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.String(), nullable=False, default='PENDENTE'),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['vendedor_id'], ['vendedores.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('comissoes')
    op.drop_table('vendedores')
    op.drop_table('crm_oportunidades')
    op.drop_table('crm_leads')
    op.drop_table('clientes')
    op.drop_table('alocacoes')
    op.drop_table('lotes')
    op.drop_table('itens_pedido')
    op.drop_table('pedidos')
    op.drop_table('fornecedores')
    op.drop_table('produtos')
    op.drop_table('posicoes')
    op.drop_table('armazens')
    op.drop_table('audit_logs')
    op.drop_table('users')
