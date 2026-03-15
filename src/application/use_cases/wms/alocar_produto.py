from dataclasses import dataclass

from application.ports.repositories import LoteRepository, ArmazemRepository
from domain.wms.estoque import Alocacao

# Supondo que tenhamos um repositório para a alocação também a fim de salvá-las
from typing import Protocol, Optional

class AlocacaoRepository(Protocol):
    def salvar(self, alocacao: Alocacao) -> None:
        ...

@dataclass
class AlocarProdutoDto:
    lote_id: str
    armazem_id: str
    posicao_codigo: str
    quantidade_a_alocar: int

class AlocarProdutoUseCase:
    """
    Caso de Uso: Pegar uma quantidade disponível num Lote e alocar numa Posição física do Armazém.
    """
    def __init__(
        self, 
        lote_repo: LoteRepository, 
        armazem_repo: ArmazemRepository,
        alocacao_repo: AlocacaoRepository
    ):
        self.lote_repo = lote_repo
        self.armazem_repo = armazem_repo
        self.alocacao_repo = alocacao_repo

    def executar(self, dto: AlocarProdutoDto) -> Alocacao:
        lote = self.lote_repo.buscar_por_id(dto.lote_id)
        if not lote:
            raise ValueError(f"Lote não encontrado: {dto.lote_id}")

        armazem = self.armazem_repo.buscar_por_id(dto.armazem_id)
        if not armazem:
            raise ValueError(f"Armazém não encontrado: {dto.armazem_id}")
            
        return self._alocar(dto, lote, armazem)

    def _alocar(self, dto, lote, armazem):    
        # Encontra a posição correspondente (em um BD com ORM isso seria uma query)
        posicao = None
        # Para nosso mock aqui e na portabilidade futura, vamos fingir que iteramos ou trazemos 
        # Isso idealmente seria um PosicaoRepository, mas simplificaremos por hora
        pass
