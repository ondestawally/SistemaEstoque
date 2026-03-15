from typing import Optional
from sqlalchemy.orm import Session
from domain.wms.localizacao import Armazem, Posicao
from domain.wms.lote import Lote
from infrastructure.orm_models.wms_models import ArmazemORM, PosicaoORM, LoteORM
from infrastructure.repositories.erp_repositories import ProdutoRepositorySQLAlchemy

class ArmazemRepositorySQLAlchemy:
    def __init__(self, db: Session):
        self.db = db

    def buscar_por_id(self, id: str) -> Optional[Armazem]:
        orm = self.db.query(ArmazemORM).filter(ArmazemORM.id == id).first()
        if not orm: return None
        return Armazem(id=orm.id, nome=orm.nome, ativo=orm.ativo)

class LoteRepositorySQLAlchemy:
    def __init__(self, db: Session, produto_repo: ProdutoRepositorySQLAlchemy):
        self.db = db
        self.produto_repo = produto_repo

    def salvar(self, lote: Lote) -> None:
        orm = self.db.query(LoteORM).filter(LoteORM.id == lote.id).first()
        if not orm:
            orm = LoteORM(id=lote.id)
            self.db.add(orm)
            
        orm.produto_id = lote.produto.id
        orm.quantidade_inicial = lote.quantidade_inicial
        orm.quantidade_disponivel = lote.quantidade_disponivel
        orm.data_validade = lote.data_validade
        
        self.db.commit()

    def buscar_por_id(self, id: str) -> Optional[Lote]:
        orm = self.db.query(LoteORM).filter(LoteORM.id == id).first()
        if not orm: return None
        
        produto = self.produto_repo.buscar_por_id(orm.produto_id)
        if not produto: return None
        
        # Para recriar o Lote sem acionar regras de construtor do zero, 
        # poderíamos usar um memento ou construtor customizado. 
        # Faremos a forma basica aqui
        lote = Lote(
            id=orm.id, 
            produto=produto, 
            quantidade_inicial=orm.quantidade_inicial,
            data_validade=orm.data_validade
        )
        lote.quantidade_disponivel = orm.quantidade_disponivel # Sobrescreve
        
        return lote
