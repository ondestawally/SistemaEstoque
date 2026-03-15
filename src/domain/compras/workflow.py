"""
Módulo de Compras Avançado — Domínio
Solicitação → Cotação → Pedido → Aprovação → Conferência → NF Entrada
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class StatusSolicitacao(str, Enum):
    RASCUNHO = "RASCUNHO"
    APROVADA = "APROVADA"
    COTANDO = "COTANDO"
    PEDIDO_EMITIDO = "PEDIDO_EMITIDO"
    FINALIZADA = "FINALIZADA"
    CANCELADA = "CANCELADA"


class StatusCotacao(str, Enum):
    ABERTA = "ABERTA"
    RESPONDIDA = "RESPONDIDA"
    APROVADA = "APROVADA"
    CANCELADA = "CANCELADA"


@dataclass
class SolicitacaoCompra:
    id: str
    solicitante: str
    produto_id: str
    quantidade: float
    justificativa: str
    urgencia: str = "NORMAL"  # NORMAL, URGENTE, CRITICO
    status: StatusSolicitacao = StatusSolicitacao.RASCUNHO
    data_criacao: datetime = field(default_factory=datetime.utcnow)
    data_necessidade: Optional[datetime] = None

    TRANSICOES = {
        StatusSolicitacao.RASCUNHO: StatusSolicitacao.APROVADA,
        StatusSolicitacao.APROVADA: StatusSolicitacao.COTANDO,
        StatusSolicitacao.COTANDO: StatusSolicitacao.PEDIDO_EMITIDO,
        StatusSolicitacao.PEDIDO_EMITIDO: StatusSolicitacao.FINALIZADA,
    }

    def avancar_status(self) -> None:
        proximo = self.TRANSICOES.get(self.status)
        if not proximo:
            raise ValueError(f"Status '{self.status}' não pode ser avançado")
        self.status = proximo

    def cancelar(self) -> None:
        if self.status == StatusSolicitacao.FINALIZADA:
            raise ValueError("Solicitação finalizada não pode ser cancelada")
        self.status = StatusSolicitacao.CANCELADA


@dataclass
class ItemCotacao:
    fornecedor_id: str
    fornecedor_nome: str
    preco_unitario: float
    condicao_pagamento: str = "30 dias"
    prazo_entrega_dias: int = 7
    observacao: Optional[str] = None


@dataclass
class Cotacao:
    id: str
    solicitacao_id: str
    itens: List[ItemCotacao] = field(default_factory=list)
    status: StatusCotacao = StatusCotacao.ABERTA
    fornecedor_vencedor_id: Optional[str] = None
    data_criacao: datetime = field(default_factory=datetime.utcnow)

    def melhor_preco(self) -> Optional[ItemCotacao]:
        if not self.itens:
            return None
        return min(self.itens, key=lambda i: i.preco_unitario)

    def aprovar(self, fornecedor_id: str) -> None:
        vencedor = next((i for i in self.itens if i.fornecedor_id == fornecedor_id), None)
        if not vencedor:
            raise ValueError("Fornecedor não está na cotação")
        self.fornecedor_vencedor_id = fornecedor_id
        self.status = StatusCotacao.APROVADA


@dataclass
class ConferenciaFisica:
    id: str
    pedido_id: str
    produto_id: str
    quantidade_pedida: float
    quantidade_recebida: float
    data_conferencia: datetime = field(default_factory=datetime.utcnow)
    responsavel: Optional[str] = None
    observacao: Optional[str] = None

    @property
    def divergencia(self) -> float:
        return self.quantidade_recebida - self.quantidade_pedida

    @property
    def aprovado(self) -> bool:
        return self.divergencia >= 0


@dataclass
class NotaFiscalEntrada:
    id: str
    numero: str
    serie: str
    emitente_cnpj: str
    emitente_nome: str
    pedido_id: Optional[str]
    valor_total: float
    data_emissao: datetime
    data_entrada: datetime = field(default_factory=datetime.utcnow)
    chave_acesso: Optional[str] = None
    observacao: Optional[str] = None
