"""
Módulo Fiscal — Domínio
Regras fiscais por produto, Livros fiscais, Apuração de tributos
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class TipoOperacaoFiscal(str, Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"


@dataclass
class RegraFiscal:
    id: str
    produto_id: str
    uf_origem: str
    uf_destino: str
    cfop: str
    aliquota_icms: float = 0.0
    aliquota_pis: float = 0.0
    aliquota_cofins: float = 0.0
    aliquota_ipi: float = 0.0
    ativo: bool = True

    def calcular_tributos(self, valor_produto: float) -> dict:
        return {
            "icms": round(valor_produto * (self.aliquota_icms / 100), 2),
            "pis": round(valor_produto * (self.aliquota_pis / 100), 2),
            "cofins": round(valor_produto * (self.aliquota_cofins / 100), 2),
            "ipi": round(valor_produto * (self.aliquota_ipi / 100), 2),
            "total_tributos": round(
                valor_produto * (
                    self.aliquota_icms + self.aliquota_pis + 
                    self.aliquota_cofins + self.aliquota_ipi
                ) / 100, 2
            )
        }


@dataclass
class LivroFiscal:
    id: str
    tipo: TipoOperacaoFiscal
    data: datetime
    participante_cnpj: str
    participante_nome: str
    numero_nf: str
    serie_nf: str
    cfop: str
    valor_contabil: float
    valor_icms: float = 0.0
    valor_pis: float = 0.0
    valor_cofins: float = 0.0
    valor_ipi: float = 0.0
    produto_id: Optional[str] = None
    mes_referencia: int = field(default_factory=lambda: datetime.utcnow().month)
    ano_referencia: int = field(default_factory=lambda: datetime.utcnow().year)
