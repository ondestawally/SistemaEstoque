import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from datetime import date, timedelta
import random
from sqlalchemy.orm import Session
from infrastructure.database import SessionLocal, engine
import uuid

import infrastructure.orm_models.erp_models
import infrastructure.orm_models.wms_models
import infrastructure.orm_models.crm_models
import infrastructure.orm_models.robust_models
import infrastructure.orm_models.rh_models
import infrastructure.orm_models.phase6_models
import infrastructure.orm_models.controlling_models

def seed_all():
    db = SessionLocal()
    
    print("Seedando banco de dados...")
    
    # ===== PRODUTOS =====
    print("1. Produtos...")
    produtos = [
        {"id": "PROD-001", "nome": "Notebook Dell XPS 15", "descricao": "Core i7, 16GB RAM, 512GB SSD", "codigo_barras": "7891234567890", "ativo": True},
        {"id": "PROD-002", "nome": "Mouse Logitech MX Master", "descricao": "Wireless, Bluetooth", "codigo_barras": "7891234567891", "ativo": True},
        {"id": "PROD-003", "nome": "Monitor Samsung 27pol", "descricao": "4K, IPS, HDMI", "codigo_barras": "7891234567892", "ativo": True},
        {"id": "PROD-004", "nome": "Teclado Mecanico Corsair", "descricao": "RGB, Switch Blue", "codigo_barras": "7891234567893", "ativo": True},
        {"id": "PROD-005", "nome": "Webcam Logitech C920", "descricao": "1080p, Autofocus", "codigo_barras": "7891234567894", "ativo": True},
        {"id": "PROD-006", "nome": "Fone de Ouvido Sony WH-1000XM4", "descricao": "Noise Cancelling", "codigo_barras": "7891234567895", "ativo": True},
        {"id": "PROD-007", "nome": "SSD Kingston 1TB", "descricao": "NVMe, 3500MB/s", "codigo_barras": "7891234567896", "ativo": True},
        {"id": "PROD-008", "nome": "HD Externo Seagate 2TB", "descricao": "USB 3.0", "codigo_barras": "7891234567897", "ativo": True},
        {"id": "PROD-009", "nome": "Pendrive SanDisk 64GB", "descricao": "USB 3.1", "codigo_barras": "7891234567898", "ativo": True},
        {"id": "PROD-010", "nome": "Cabo HDMI 2m", "descricao": "Gold plated", "codigo_barras": "7891234567899", "ativo": True},
    ]
    for p in produtos:
        existing = db.query(infrastructure.orm_models.erp_models.ProdutoORM).filter(infrastructure.orm_models.erp_models.ProdutoORM.id == p["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.erp_models.ProdutoORM(**p))
    print(f"   {len(produtos)} produtos adicionados")
    
    # ===== FORNECEDORES =====
    print("2. Fornecedores...")
    fornecedores = [
        {"id": "FORN-001", "razao_social": "Tech Distribuidora Ltda", "cnpj": "12345678000100", "ativo": True},
        {"id": "FORN-002", "razao_social": "Equipamentos Brasil SA", "cnpj": "12345678000101", "ativo": True},
        {"id": "FORN-003", "razao_social": "InfoWorld Importadora", "cnpj": "12345678000102", "ativo": True},
    ]
    for f in fornecedores:
        existing = db.query(infrastructure.orm_models.erp_models.FornecedorORM).filter(infrastructure.orm_models.erp_models.FornecedorORM.id == f["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.erp_models.FornecedorORM(**f))
    print(f"   {len(fornecedores)} fornecedores adicionados")
    
    # ===== ARMAZENS =====
    print("3. Armazens...")
    armazens = [
        {"id": "ARM-001", "nome": "Centro de Distribuição Principal", "ativo": True},
        {"id": "ARM-002", "nome": "Filial Rio de Janeiro", "ativo": True},
    ]
    for a in armazens:
        existing = db.query(infrastructure.orm_models.wms_models.ArmazemORM).filter(infrastructure.orm_models.wms_models.ArmazemORM.id == a["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.wms_models.ArmazemORM(**a))
    print(f"   {len(armazens)} armazens adicionados")
    
    # ===== POSICOES =====
    print("3b. Posicoes...")
    posicoes = [
        {"id": "POS-001", "codigo": "A-01-01", "armazem_id": "ARM-001", "bloqueada": False},
        {"id": "POS-002", "codigo": "A-01-02", "armazem_id": "ARM-001", "bloqueada": False},
        {"id": "POS-003", "codigo": "A-02-01", "armazem_id": "ARM-001", "bloqueada": True},
        {"id": "POS-004", "codigo": "B-01-01", "armazem_id": "ARM-002", "bloqueada": False},
    ]
    for p in posicoes:
        existing = db.query(infrastructure.orm_models.wms_models.PosicaoORM).filter(infrastructure.orm_models.wms_models.PosicaoORM.id == p["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.wms_models.PosicaoORM(**p))
    print(f"   {len(posicoes)} posicoes adicionadas")
    
    # ===== CLIENTES =====
    print("4. Clientes...")
    clientes = [
        {"id": "CLI-001", "razao_social": "Empresa Alpha Ltda", "cnpj_cpf": "11222333000144", "email": "contato@alpha.com.br", "telefone": "1133334444", "ativo": True},
        {"id": "CLI-002", "razao_social": "Beta Comercio SA", "cnpj_cpf": "11222333000145", "email": "vendas@beta.com.br", "telefone": "2134445555", "ativo": True},
        {"id": "CLI-003", "razao_social": "Gamma Industria", "cnpj_cpf": "11222333000146", "email": "compras@gamma.com.br", "telefone": "1135556666", "ativo": True},
    ]
    for c in clientes:
        existing = db.query(infrastructure.orm_models.robust_models.ClienteORM).filter(infrastructure.orm_models.robust_models.ClienteORM.id == c["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.robust_models.ClienteORM(**c))
    print(f"   {len(clientes)} clientes adicionados")
    
    # ===== VENDEDORES =====
    print("5. Vendedores...")
    vendedores = [
        {"id": "VEN-001", "nome": "Roberto Silva", "email": "roberto@erp.com", "telefone": "11999990001", "ativo": True, "comissao_percentual": 3.0},
        {"id": "VEN-002", "nome": "Ana Costa", "email": "ana@erp.com", "telefone": "11999990002", "ativo": True, "comissao_percentual": 2.5},
        {"id": "VEN-003", "nome": "Carlos Oliveira", "email": "carlos@erp.com", "telefone": "11999990003", "ativo": True, "comissao_percentual": 4.0},
    ]
    for v in vendedores:
        existing = db.query(infrastructure.orm_models.crm_models.VendedorORM).filter(infrastructure.orm_models.crm_models.VendedorORM.id == v["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.crm_models.VendedorORM(**v))
    print(f"   {len(vendedores)} vendedores adicionados")
    
    # ===== LEADS CRM =====
    print("6. Leads CRM...")
    leads = [
        {"id": "LEAD-001", "nome_contato": "João Pereira", "email": "joao@empresa.com", "telefone": "11988887777", "empresa": "Tech Solutions", "status": "NOVO", "data_criacao": date.today()},
        {"id": "LEAD-002", "nome_contato": "Maria Santos", "email": "maria@corp.com.br", "telefone": "21988887778", "empresa": "Corp Tech", "status": "EM_CONTATO", "data_criacao": date.today() - timedelta(days=5)},
        {"id": "LEAD-003", "nome_contato": "Pedro Alves", "email": "pedro@startup.io", "telefone": "31988887779", "empresa": "Startup IO", "status": "QUALIFICADO", "data_criacao": date.today() - timedelta(days=10)},
    ]
    for l in leads:
        existing = db.query(infrastructure.orm_models.crm_models.LeadORM).filter(infrastructure.orm_models.crm_models.LeadORM.id == l["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.crm_models.LeadORM(**l))
    print(f"   {len(leads)} leads adicionados")
    
    # ===== OPORTUNIDADES =====
    print("7. Oportunidades...")
    oportunidades = [
        {"id": "OP-001", "titulo": "Projeto ERP Full", "lead_id": "LEAD-001", "vendedor_id": "VEN-001", "valor_estimado": 50000.00, "etapa": "PROSPECCAO", "data_fechamento_estimada": date.today() + timedelta(days=30), "data_criacao": date.today()},
        {"id": "OP-002", "titulo": "Licenças Software", "lead_id": "LEAD-002", "vendedor_id": "VEN-002", "valor_estimado": 15000.00, "etapa": "PROPOSTA", "data_fechamento_estimada": date.today() + timedelta(days=15), "data_criacao": date.today() - timedelta(days=5)},
    ]
    for o in oportunidades:
        existing = db.query(infrastructure.orm_models.crm_models.OportunidadeORM).filter(infrastructure.orm_models.crm_models.OportunidadeORM.id == o["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.crm_models.OportunidadeORM(**o))
    print(f"   {len(oportunidades)} oportunidades adicionadas")
    
    # ===== LOTES (ESTOQUE) =====
    print("8. Lotes...")
    lotes = [
        {"id": "LOTE-001", "produto_id": "PROD-001", "quantidade_inicial": 10, "quantidade_disponivel": 8, "data_validade": date.today() + timedelta(days=365)},
        {"id": "LOTE-002", "produto_id": "PROD-002", "quantidade_inicial": 50, "quantidade_disponivel": 45, "data_validade": date.today() + timedelta(days=730)},
        {"id": "LOTE-003", "produto_id": "PROD-003", "quantidade_inicial": 20, "quantidade_disponivel": 18, "data_validade": date.today() + timedelta(days=500)},
    ]
    for l in lotes:
        existing = db.query(infrastructure.orm_models.wms_models.LoteORM).filter(infrastructure.orm_models.wms_models.LoteORM.id == l["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.wms_models.LoteORM(**l))
    print(f"   {len(lotes)} lotes adicionados")
    
    # ===== PEDIDOS COMPRA =====
    print("9. Pedidos Compra...")
    pedidos = [
        {"id": "PC-001", "fornecedor_id": "FORN-001", "data_emissao": date.today() - timedelta(days=10), "status": "APROVADO"},
        {"id": "PC-002", "fornecedor_id": "FORN-002", "data_emissao": date.today() - timedelta(days=5), "status": "RECEBIDO"},
    ]
    for p in pedidos:
        existing = db.query(infrastructure.orm_models.erp_models.PedidoORM).filter(infrastructure.orm_models.erp_models.PedidoORM.id == p["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.erp_models.PedidoORM(**p))
    print(f"   {len(pedidos)} pedidos compra adicionados")
    
    # ===== PEDIDOS VENDA =====
    print("10. Pedidos Venda...")
    pedidos_venda = [
        {"id": "PV-001", "cliente_id": "CLI-001", "data_pedido": date.today() - timedelta(days=3), "status": "ORCAMENTO", "status_logistica": "PENDENTE", "valor_total": 8500.00, "vendedor_id": "VEN-001"},
        {"id": "PV-002", "cliente_id": "CLI-002", "data_pedido": date.today() - timedelta(days=7), "status": "APROVADO", "status_logistica": "DESPACHADO", "valor_total": 12500.00, "vendedor_id": "VEN-002", "codigo_rastreio": "TRACK123456"},
    ]
    for p in pedidos_venda:
        existing = db.query(infrastructure.orm_models.robust_models.PedidoVendaORM).filter(infrastructure.orm_models.robust_models.PedidoVendaORM.id == p["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.robust_models.PedidoVendaORM(**p))
    print(f"   {len(pedidos_venda)} pedidos venda adicionados")
    
    # ===== FINANCEIRO =====
    print("11. Lancamentos Financeiros...")
    lancamentos = [
        {"id": "LANC-001", "tipo": "RECEBER", "origem_id": "PV-001", "valor": 8500.00, "data_lancamento": date.today() - timedelta(days=3), "vencimento": date.today() + timedelta(days=30), "status": "PENDENTE"},
        {"id": "LANC-002", "tipo": "RECEBER", "origem_id": "PV-002", "valor": 12500.00, "data_lancamento": date.today() - timedelta(days=7), "vencimento": date.today() + timedelta(days=15), "status": "PENDENTE"},
        {"id": "LANC-003", "tipo": "PAGAR", "origem_id": "PC-001", "valor": 5000.00, "data_lancamento": date.today() - timedelta(days=10), "vencimento": date.today() + timedelta(days=20), "status": "PENDENTE"},
    ]
    for l in lancamentos:
        existing = db.query(infrastructure.orm_models.robust_models.LancamentoFinanceiroORM).filter(infrastructure.orm_models.robust_models.LancamentoFinanceiroORM.id == l["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.robust_models.LancamentoFinanceiroORM(**l))
    print(f"   {len(lancamentos)} lancamentos financeiros adicionados")
    
    # ===== RH =====
    print("12. Cargos...")
    cargos = [
        {"id": "CARGO-001", "nome": "Desenvolvedor Full Stack", "nivel": "Pleno", "salario_base": 8000.00, "descricao": "Desenvolvedor full stack", "ativo": True},
        {"id": "CARGO-002", "nome": "Analista de Dados", "nivel": "Senior", "salario_base": 7000.00, "descricao": "Analista de dados", "ativo": True},
        {"id": "CARGO-003", "nome": "Gerente de Vendas", "nivel": "Gerencia", "salario_base": 12000.00, "descricao": "Gerente de vendas", "ativo": True},
    ]
    for c in cargos:
        existing = db.query(infrastructure.orm_models.rh_models.CargoORM).filter(infrastructure.orm_models.rh_models.CargoORM.id == c["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.rh_models.CargoORM(**c))
    print(f"   {len(cargos)} cargos adicionados")
    
    print("13. Funcionarios...")
    funcionarios = [
        {"id": "FUNC-001", "nome": "Carlos Souza", "cpf": "12345678901", "cargo_id": "CARGO-001", "data_admissao": date(2023, 1, 15), "status": "ATIVO", "email": "carlos@empresa.com", "telefone": "11988880001"},
        {"id": "FUNC-002", "nome": "Fernanda Lima", "cpf": "12345678902", "cargo_id": "CARGO-002", "data_admissao": date(2023, 3, 20), "status": "ATIVO", "email": "fernanda@empresa.com", "telefone": "11988880002"},
    ]
    for f in funcionarios:
        existing = db.query(infrastructure.orm_models.rh_models.FuncionarioORM).filter(infrastructure.orm_models.rh_models.FuncionarioORM.id == f["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.rh_models.FuncionarioORM(**f))
    print(f"   {len(funcionarios)} funcionarios adicionados")
    
    # ===== COMISSÕES =====
    # Removido temporariamente - FK issue
    print("14. Comissoes... (skipped)")
    # comissoes = [
    #     {"vendedor_id": "VEN-001", "pedido_id": "PV-002", "valor_venda": 12500.00, "valor_comissao": 375.00, "paga": False},
    # ]
    # for c in comissoes:
    #     existing = db.query(infrastructure.orm_models.crm_models.ComissaoORM).filter(
    #         infrastructure.orm_models.crm_models.ComissaoORM.vendedor_id == c["vendedor_id"],
    #         infrastructure.orm_models.crm_models.ComissaoORM.pedido_id == c["pedido_id"]
    #     ).first()
    #     if not existing:
    #         db.add(infrastructure.orm_models.crm_models.ComissaoORM(**c))
    # print(f"   {len(comissoes)} comissoes adicionadas")
    
    # ===== CONTRATOS =====
    print("15. Contratos...")
    contratos = [
        {"id": "CTR-001", "tipo": "SERVICO", "parceiro_id": "CLI-001", "parceiro_nome": "Empresa Alpha Ltda", "objeto": "Contrato de prestação de serviços de TI", "valor_mensal": 2500.00, "data_inicio": date(2024, 1, 1), "data_fim": date(2024, 12, 31), "status": "ATIVO"},
    ]
    for c in contratos:
        existing = db.query(infrastructure.orm_models.phase6_models.ContratoORM).filter(infrastructure.orm_models.phase6_models.ContratoORM.id == c["id"]).first()
        if not existing:
            db.add(infrastructure.orm_models.phase6_models.ContratoORM(**c))
    print(f"   {len(contratos)} contratos adicionados")
    
    db.commit()
    db.close()
    print("\n[OK] Seed concluido com sucesso!")

if __name__ == "__main__":
    seed_all()