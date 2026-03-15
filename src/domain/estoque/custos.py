"""
Módulo de Estoque e Custos — Domínio
Custo Médio Móvel, Parâmetros de Estoque, Ajuste de Estoque, Curva ABC
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum


class TipoAjuste(str, Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    INVENTARIO = "INVENTARIO"


class ClassificacaoABC(str, Enum):
    A = "A"  # Alto valor/volume — 20% produtos, 80% valor
    B = "B"  # Médio
    C = "C"  # Baixo valor/volume — 50% produtos, 5% valor


@dataclass
class ParametroEstoque:
    produto_id: str
    estoque_minimo: float = 0.0
    estoque_maximo: float = 0.0
    ponto_pedido: float = 0.0   # Quantidade para disparar nova OC
    lead_time_dias: int = 0      # Dias para chegada do fornecedor


@dataclass
class CustoMedio:
    produto_id: str
    custo_medio_atual: float = 0.0
    quantidade_em_estoque: float = 0.0
    ultima_atualizacao: datetime = field(default_factory=datetime.utcnow)

    def atualizar(self, qtde_entrada: float, custo_unitario: float) -> None:
        """Recalcula custo médio móvel ponderado na entrada de mercadoria."""
        valor_atual = self.custo_medio_atual * self.quantidade_em_estoque
        valor_entrada = qtde_entrada * custo_unitario
        nova_qtde = self.quantidade_em_estoque + qtde_entrada
        if nova_qtde > 0:
            self.custo_medio_atual = (valor_atual + valor_entrada) / nova_qtde
        self.quantidade_em_estoque = nova_qtde
        self.ultima_atualizacao = datetime.utcnow()

    def registrar_saida(self, quantidade: float) -> None:
        """Baixa a quantidade sem alterar o custo médio."""
        self.quantidade_em_estoque = max(0, self.quantidade_em_estoque - quantidade)
        self.ultima_atualizacao = datetime.utcnow()


@dataclass
class AjusteEstoque:
    id: str
    produto_id: str
    tipo: TipoAjuste
    quantidade: float
    custo_unitario: float
    motivo: str
    data_ajuste: datetime = field(default_factory=datetime.utcnow)
    usuario: Optional[str] = None

    def valor_total(self) -> float:
        return self.quantidade * self.custo_unitario


@dataclass
class PosicaoEstoque:
    """View aggregada da posição do produto."""
    produto_id: str
    produto_nome: str
    quantidade: float
    custo_medio: float
    valor_total: float
    estoque_minimo: float
    alerta: bool  # True se abaixo do mínimo
    classificacao_abc: Optional[ClassificacaoABC] = None
