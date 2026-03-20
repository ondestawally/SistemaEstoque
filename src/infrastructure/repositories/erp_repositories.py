from typing import Optional
from sqlalchemy.orm import Session
from domain.erp.produto import Produto
from domain.erp.fornecedor import Fornecedor
from domain.erp.compras import OrdemCompra, ItemPedido
from domain.value_objects import CNPJ, Money
from infrastructure.orm_models.erp_models import ProdutoORM, FornecedorORM, PedidoORM, ItemPedidoORM

class ProdutoRepositorySQLAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, id: str) -> Optional[Produto]:
        orm = self.db.query(ProdutoORM).filter(ProdutoORM.id == id).first()
        if not orm: return None
        return Produto(
            id=orm.id, nome=orm.nome, descricao=orm.descricao, 
            codigo_barras=orm.codigo_barras, ativo=orm.ativo
        )

    def salvar(self, produto: Produto) -> None:
        orm = self.db.query(ProdutoORM).filter(ProdutoORM.id == produto.id).first()
        if not orm:
            orm = ProdutoORM(id=produto.id)
            self.db.add(orm)
        orm.nome = produto.nome
        orm.descricao = produto.descricao
        orm.codigo_barras = produto.codigo_barras
        orm.ativo = produto.ativo
        self.db.commit()

    def listar_todos(self) -> List[Produto]:
        orms = self.db.query(ProdutoORM).all()
        return [Produto(id=o.id, nome=o.nome, descricao=o.descricao, codigo_barras=o.codigo_barras, ativo=o.ativo) for o in orms]

class FornecedorRepositorySQLAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, id: str) -> Optional[Fornecedor]:
        orm = self.db.query(FornecedorORM).filter(FornecedorORM.id == id).first()
        if not orm: return None
        return Fornecedor(
            id=orm.id, razao_social=orm.razao_social, 
            cnpj=CNPJ(orm.cnpj), ativo=orm.ativo
        )

    def salvar(self, fornecedor: Fornecedor) -> None:
        orm = self.db.query(FornecedorORM).filter(FornecedorORM.id == fornecedor.id).first()
        if not orm:
            orm = FornecedorORM(id=fornecedor.id)
            self.db.add(orm)
        orm.razao_social = fornecedor.razao_social
        orm.cnpj = str(fornecedor.cnpj)
        orm.ativo = fornecedor.ativo
        self.db.commit()

    def listar_todos(self) -> List[Fornecedor]:
        orms = self.db.query(FornecedorORM).all()
        return [Fornecedor(id=o.id, razao_social=o.razao_social, cnpj=CNPJ(o.cnpj), ativo=o.ativo) for o in orms]

class PedidoRepositorySQLAlchemy:
    def __init__(self, db: Session, fornecedor_repo: FornecedorRepositorySQLAlchemy, produto_repo: ProdutoRepositorySQLAlchemy):
        self.db = db
        self.fornecedor_repo = fornecedor_repo
        self.produto_repo = produto_repo

    def salvar(self, pedido: PedidoBase) -> None:
        orm = self.db.query(PedidoORM).filter(PedidoORM.id == pedido.id).first()
        if not orm:
            orm = PedidoORM(id=pedido.id)
            self.db.add(orm)
            
        orm.fornecedor_id = pedido.fornecedor.id
        orm.data_emissao = pedido.data_emissao
        orm.status = pedido.status
        
        # Limpa os itens antigos para simplificar
        self.db.query(ItemPedidoORM).filter(ItemPedidoORM.pedido_id == pedido.id).delete()
        
        for item in pedido.itens:
            item_orm = ItemPedidoORM(
                pedido_id=pedido.id,
                produto_id=item.produto.id,
                quantidade=item.quantidade,
                valor_unitario=item.valor_unitario.amount,
                moeda=item.valor_unitario.currency
            )
            self.db.add(item_orm)
        
        self.db.commit()

    def buscar_por_id(self, id: str) -> Optional[OrdemCompra]:
        orm = self.db.query(PedidoORM).filter(PedidoORM.id == id).first()
        if not orm: return None
        
        fornecedor = self.fornecedor_repo.buscar_por_id(orm.fornecedor_id)
        if not fornecedor: return None
        
        pedido = OrdemCompra(id=orm.id, fornecedor=fornecedor, data_emissao=orm.data_emissao, status=orm.status)
        for item_orm in orm.itens:
            produto = self.produto_repo.buscar_por_id(item_orm.produto_id)
            if produto:
                item = ItemPedido(
                    produto=produto, 
                    quantidade=item_orm.quantidade, 
                    valor_unitario=Money(amount=item_orm.valor_unitario, currency=item_orm.moeda)
                )
                # Burla a verificacao de item adicionado apenas no RASCUNHO pra recarregar os dados
                pedido.itens.append(item)
                
        return pedido
