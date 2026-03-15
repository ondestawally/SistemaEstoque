"""
Módulo de Contratos — Domínio
Gestão de contratos com fornecedores e clientes
"""
from dataclasses import dataclass, field
from datetime import datetime, date, timedelta
from typing import Optional
from enum import Enum


class StatusContrato(str, Enum):
    ATIVO = "ATIVO"
    VENCIDO = "VENCIDO"
    RENOVADO = "RENOVADO"
    CANCELADO = "CANCELADO"
    SUSPENSO = "SUSPENSO"


class TipoContrato(str, Enum):
    FORNECEDOR = "FORNECEDOR"
    CLIENTE = "CLIENTE"
    SERVICO = "SERVICO"


@dataclass
class Contrato:
    id: str
    tipo: TipoContrato
    parceiro_id: str  # cliente_id ou fornecedor_id
    parceiro_nome: str
    objeto: str       # Descrição do contrato
    valor_mensal: float
    data_inicio: date
    data_fim: date
    status: StatusContrato = StatusContrato.ATIVO
    numero_contrato: Optional[str] = None
    condicao_pagamento: Optional[str] = None
    observacao: Optional[str] = None
    data_criacao: datetime = field(default_factory=datetime.utcnow)

    def dias_para_vencer(self) -> int:
        return (self.data_fim - date.today()).days

    def esta_vencendo(self, aviso_dias: int = 30) -> bool:
        return 0 < self.dias_para_vencer() <= aviso_dias

    def esta_vencido(self) -> bool:
        return date.today() > self.data_fim

    def renovar(self, nova_data_fim: date, novo_valor: Optional[float] = None) -> None:
        self.data_inicio = date.today()
        self.data_fim = nova_data_fim
        if novo_valor:
            self.valor_mensal = novo_valor
        self.status = StatusContrato.RENOVADO
