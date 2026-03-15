"""
Módulo de RH — Domínio
Cargos, Funcionários, Folha de Pagamento, Registro de Ponto
"""
from dataclasses import dataclass, field
from datetime import date, datetime, time
from typing import List, Optional
from enum import Enum


class StatusFuncionario(str, Enum):
    ATIVO = "ATIVO"
    FERIAS = "FERIAS"
    AFASTADO = "AFASTADO"
    DEMITIDO = "DEMITIDO"


class NivelCargo(str, Enum):
    JUNIOR = "JUNIOR"
    PLENO = "PLENO"
    SENIOR = "SENIOR"
    ESPECIALISTA = "ESPECIALISTA"
    COORDENADOR = "COORDENADOR"
    GERENTE = "GERENTE"
    DIRETOR = "DIRETOR"


# ── Tabelas de INSS 2026 (simplificadas) ──────────────────────
TABELA_INSS = [
    (1518.00,  7.5),
    (2793.88,  9.0),
    (4190.83, 12.0),
    (8157.41, 14.0),
]

# ── Tabela IRRF 2026 (simplificada) ──────────────────────────
TABELA_IRRF = [
    (2259.20,   0.0,     0.0),
    (2826.65,   7.5,   169.44),
    (3751.05,  15.0,   381.44),
    (4664.68,  22.5,   662.77),
    (float('inf'), 27.5, 896.00),
]

DEDUCAO_DEPENDENTE = 189.59


@dataclass
class Cargo:
    id: str
    nome: str
    nivel: NivelCargo
    salario_base: float
    descricao: Optional[str] = None

    def faixa_salarial(self) -> str:
        return f"R$ {self.salario_base:,.2f}"


@dataclass
class Funcionario:
    id: str
    nome: str
    cpf: str
    cargo_id: str
    data_admissao: date
    status: StatusFuncionario = StatusFuncionario.ATIVO
    email: Optional[str] = None
    telefone: Optional[str] = None
    num_dependentes: int = 0

    def tempo_empresa_meses(self) -> int:
        hoje = date.today()
        return (hoje.year - self.data_admissao.year) * 12 + (hoje.month - self.data_admissao.month)


@dataclass
class ItemDesconto:
    descricao: str
    valor: float
    tipo: str  # INSS, IRRF, VALE_TRANSPORTE, OUTROS


@dataclass
class FolhaPagamento:
    id: str
    mes: int
    ano: int
    funcionario_id: str
    salario_bruto: float
    num_dependentes: int = 0
    outros_descontos: float = 0.0
    outros_acrescimos: float = 0.0
    descontos: List[ItemDesconto] = field(default_factory=list)

    def calcular_inss(self) -> float:
        """Cálculo progressivo de INSS."""
        bruto = self.salario_bruto
        total = 0.0
        anterior = 0.0
        for teto, aliq in TABELA_INSS:
            faixa = min(bruto, teto) - anterior
            if faixa <= 0:
                break
            total += faixa * (aliq / 100)
            anterior = teto
        return round(total, 2)

    def calcular_irrf(self) -> float:
        """Cálculo simplificado de IRRF."""
        base = self.salario_bruto - self.calcular_inss()
        base -= self.num_dependentes * DEDUCAO_DEPENDENTE
        if base <= 0:
            return 0.0
        for teto, aliq, deducao in TABELA_IRRF:
            if base <= teto:
                return round(max(0, base * (aliq / 100) - deducao), 2)
        return 0.0

    def salario_liquido(self) -> float:
        inss = self.calcular_inss()
        irrf = self.calcular_irrf()
        return round(
            self.salario_bruto - inss - irrf - self.outros_descontos + self.outros_acrescimos,
            2
        )


@dataclass
class RegistroPonto:
    id: str
    funcionario_id: str
    data: date
    entrada: Optional[str] = None   # "HH:MM"
    saida: Optional[str] = None     # "HH:MM"
    observacao: Optional[str] = None

    def horas_trabalhadas(self) -> Optional[float]:
        if not self.entrada or not self.saida:
            return None
        h_e, m_e = map(int, self.entrada.split(":"))
        h_s, m_s = map(int, self.saida.split(":"))
        mins = (h_s * 60 + m_s) - (h_e * 60 + m_e)
        return round(mins / 60, 2) if mins > 0 else 0.0
