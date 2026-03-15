"""
Módulo de Contabilidade — Domínio
Plano de Contas (Partidas Dobradas), Lançamentos Contábeis, Balancete
"""
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import List, Optional
from enum import Enum


class TipoConta(str, Enum):
    ATIVO = "ATIVO"
    PASSIVO = "PASSIVO"
    RECEITA = "RECEITA"
    DESPESA = "DESPESA"
    PATRIMONIO = "PATRIMONIO"


class NaturezaConta(str, Enum):
    DEVEDORA = "DEVEDORA"   # Saldo normal a Débito (Ativo, Despesa)
    CREDORA = "CREDORA"     # Saldo normal a Crédito (Passivo, Receita, Patrimônio)


NATUREZA_PADRAO = {
    TipoConta.ATIVO: NaturezaConta.DEVEDORA,
    TipoConta.DESPESA: NaturezaConta.DEVEDORA,
    TipoConta.PASSIVO: NaturezaConta.CREDORA,
    TipoConta.RECEITA: NaturezaConta.CREDORA,
    TipoConta.PATRIMONIO: NaturezaConta.CREDORA,
}


@dataclass
class ContaContabil:
    codigo: str          # ex: "1.1.01" (estruturado)
    nome: str
    tipo: TipoConta
    natureza: NaturezaConta
    ativo: bool = True
    descricao: Optional[str] = None

    def __post_init__(self):
        if not self.natureza:
            self.natureza = NATUREZA_PADRAO[self.tipo]


@dataclass
class Partida:
    """Uma entrada em um lançamento (Débito ou Crédito)."""
    conta_id: str        # código da conta contábil
    valor: float
    dc: str              # "D" = Débito, "C" = Crédito

    def __post_init__(self):
        if self.dc not in ("D", "C"):
            raise ValueError(f"DC deve ser 'D' ou 'C', recebeu: {self.dc}")
        if self.valor <= 0:
            raise ValueError("Valor da partida deve ser positivo")


@dataclass
class LancamentoContabil:
    id: str
    data: date
    historico: str
    partidas: List[Partida] = field(default_factory=list)
    usuario: Optional[str] = None
    criado_em: datetime = field(default_factory=datetime.utcnow)

    def validar_equilibrio(self) -> None:
        """Regra: Total Débitos == Total Créditos (Partidas Dobradas)."""
        debitos = sum(p.valor for p in self.partidas if p.dc == "D")
        creditos = sum(p.valor for p in self.partidas if p.dc == "C")
        if round(debitos, 2) != round(creditos, 2):
            raise ValueError(
                f"Lançamento desequilibrado: Débitos={debitos:.2f} ≠ Créditos={creditos:.2f}"
            )

    def total_debito(self) -> float:
        return sum(p.valor for p in self.partidas if p.dc == "D")

    def total_credito(self) -> float:
        return sum(p.valor for p in self.partidas if p.dc == "C")
