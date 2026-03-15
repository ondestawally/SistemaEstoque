"""
Módulo de Controlling — Domínio
Centros de Custo, Plano Orçamentário, Realizado vs Orçado
"""
from dataclasses import dataclass, field
from typing import Optional, List
from enum import Enum


class TipoCentroCusto(str, Enum):
    PRODUCAO = "PRODUCAO"
    ADMINISTRATIVO = "ADMINISTRATIVO"
    VENDAS = "VENDAS"
    TI = "TI"
    LOGISTICA = "LOGISTICA"
    RH = "RH"


@dataclass
class CentroCusto:
    id: str
    codigo: str
    nome: str
    tipo: TipoCentroCusto
    responsavel: Optional[str] = None
    ativo: bool = True

    def descricao_completa(self) -> str:
        return f"[{self.codigo}] {self.nome} ({self.tipo})"


@dataclass
class PlanoOrcamentario:
    """Valor orçado por conta contábil × centro de custo × mês × ano."""
    id: str
    ano: int
    mes: int              # 1-12
    centro_custo_id: str
    conta_codigo: str     # Código da conta contábil
    valor_orcado: float
    observacao: Optional[str] = None

    def __post_init__(self):
        if not (1 <= self.mes <= 12):
            raise ValueError(f"Mês inválido: {self.mes}")
        if self.valor_orcado < 0:
            raise ValueError("Valor orçado não pode ser negativo")


@dataclass
class RealizadoCusto:
    """Valor real lançado em um centro de custo × conta × mês."""
    id: str
    ano: int
    mes: int
    centro_custo_id: str
    conta_codigo: str
    valor_realizado: float
    descricao: Optional[str] = None


@dataclass
class VariacaoOrcamento:
    """View calculada: Orçado vs Realizado com desvio %."""
    centro_custo_id: str
    centro_custo_nome: str
    conta_codigo: str
    mes: int
    ano: int
    valor_orcado: float
    valor_realizado: float

    @property
    def variacao_absoluta(self) -> float:
        return round(self.valor_realizado - self.valor_orcado, 2)

    @property
    def variacao_percentual(self) -> Optional[float]:
        if self.valor_orcado == 0:
            return None
        return round((self.variacao_absoluta / self.valor_orcado) * 100, 1)

    @property
    def status(self) -> str:
        pct = self.variacao_percentual
        if pct is None:
            return "SEM_ORCAMENTO"
        if abs(pct) <= 5:
            return "OK"
        if abs(pct) <= 10:
            return "ATENCAO"
        return "CRITICO"
