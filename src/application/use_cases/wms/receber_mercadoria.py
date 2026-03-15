from dataclasses import dataclass
from typing import List, Optional
from datetime import date
from uuid import uuid4

from application.ports.repositories import PedidoRepository, LoteRepository
from domain.wms.lote import Lote

@dataclass
class ReceberMercadoriaDto:
    pedido_id: str
    data_recebimento: date
    # Poderiam existir dados da Nota Fiscal aqui, mas vamos focar no WMS
    
class ReceberMercadoriaUseCase:
    """
    Caso de Uso: Confirmar o recebimento físico de um Pedido e gerar os Lotes (WMS).
    Muda o domínio de 'Comprado' para 'Em Estoque (Lote)'.
    """
    def __init__(self, pedido_repo: PedidoRepository, lote_repo: LoteRepository):
        self.pedido_repo = pedido_repo
        self.lote_repo = lote_repo

    def executar(self, dto: ReceberMercadoriaDto) -> List[Lote]:
        pedido = self.pedido_repo.buscar_por_id(dto.pedido_id)
        if not pedido:
            raise ValueError(f"Pedido não encontrado: {dto.pedido_id}")
            
        if pedido.status != "APROVADO":
            raise ValueError(f"Somente pedidos APROVADOS podem ser recebidos. Status atual: {pedido.status}")

        lotes_gerados = []
        
        # Para cada item recebido, nós geraremos um Lote físico aguardando alocação
        for item in pedido.itens:
            # Em um cenário real de WMS, o operador apontaria a validade na doca.
            # Estamos abstraindo isso aqui por enquanto, criando lote sem validade.
            novo_lote = Lote(
                id=f"LOTE-{uuid4().hex[:8]}", 
                produto=item.produto, 
                quantidade_inicial=item.quantidade
            )
            self.lote_repo.salvar(novo_lote)
            lotes_gerados.append(novo_lote)

        # Atualizando o pedido para recebido
        # Seria ideal uma Entidade Pedido poder ser recebida, mas não adicionamos esse método antes.
        pedido.status = "RECEBIDO"
        self.pedido_repo.salvar(pedido)

        return lotes_gerados
