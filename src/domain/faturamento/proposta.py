"""
Módulo de Faturamento — Domínio
Proposta Comercial, NF de Saída
"""
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional, List
from enum import Enum


class StatusProposta(str, Enum):
    RASCUNHO = "RASCUNHO"
    ENVIADA = "ENVIADA"
    EM_NEGOCIACAO = "EM_NEGOCIACAO"
    ACEITA = "ACEITA"
    RECUSADA = "RECUSADA"
    EXPIRADA = "EXPIRADA"


@dataclass
class ItemProposta:
    produto_id: str
    produto_nome: str
    quantidade: float
    preco_unitario: float
    desconto_pct: float = 0.0

    @property
    def valor_total(self) -> float:
        return self.quantidade * self.preco_unitario * (1 - self.desconto_pct / 100)


@dataclass
class PropostaComercial:
    id: str
    cliente_id: str
    validade: date
    itens: List[ItemProposta] = field(default_factory=list)
    status: StatusProposta = StatusProposta.RASCUNHO
    desconto_global_pct: float = 0.0
    condicao_pagamento: str = "30 dias"
    observacao: Optional[str] = None
    data_criacao: datetime = field(default_factory=datetime.utcnow)

    TRANSICOES = {
        StatusProposta.RASCUNHO: StatusProposta.ENVIADA,
        StatusProposta.ENVIADA: StatusProposta.EM_NEGOCIACAO,
        StatusProposta.EM_NEGOCIACAO: StatusProposta.ACEITA,
    }

    def valor_total(self) -> float:
        subtotal = sum(i.valor_total for i in self.itens)
        return subtotal * (1 - self.desconto_global_pct / 100)

    def avancar_status(self) -> None:
        proximo = self.TRANSICOES.get(self.status)
        if not proximo:
            raise ValueError(f"Status '{self.status}' não pode ser avançado")
        self.status = proximo

    def recusar(self) -> None:
        self.status = StatusProposta.RECUSADA

    def expirou(self) -> bool:
        return date.today() > self.validade and self.status not in (
            StatusProposta.ACEITA, StatusProposta.RECUSADA, StatusProposta.EXPIRADA
        )


@dataclass
class NotaFiscalSaida:
    id: str
    pedido_venda_id: str
    numero_nf: str
    serie: str
    valor_produtos: float
    valor_total: float
    data_emissao: datetime = field(default_factory=datetime.utcnow)
    chave_acesso: Optional[str] = None
    valor_icms: float = 0.0
    valor_pis: float = 0.0
    valor_cofins: float = 0.0
    valor_ipi: float = 0.0
    status: str = "EMITIDA"  # EMITIDA, CANCELADA, DENEGADA
