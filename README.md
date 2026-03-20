# SistemaEstoque - ERP & WMS Enterprise

Sistema integrado de gestão corporativa (ERP) e gerenciamento de armazém (WMS) de alta performance, construído com **Arquitetura Limpa (Clean Architecture)**, backend assíncrono em **Python** e frontend reativo em **React**.

---

## Tecnologias e Infraestrutura

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Python + FastAPI | 3.11+ / 0.135.1 |
| ORM | SQLAlchemy + Pydantic | 2.0.48 / 2.12.5 |
| Database | PostgreSQL (Supabase) | - |
| Frontend | React + Vite + TailwindCSS | 19.2.4 / 8.0.0 / 4.2.1 |
| Charts/BI | Recharts | 3.8.0 |
| Deploy API | Render.com (Docker) | - |
| Deploy Web | Vercel | - |

---

## Estrutura de Pastas (Clean Architecture)

```
SistemaEstoque/
├── src/
│   ├── domain/              # Entidades, Value Objects, Regras de Negócio
│   │   ├── value_objects.py # CNPJ, Money
│   │   ├── compras/        # Workflow de compras
│   │   ├── contabilidade/  # Plano de contas
│   │   ├── controlling/    # Centros de custo, orçamentos
│   │   ├── contratos/      # Gestão de contratos
│   │   ├── erp/            # Produtos, Fornecedores
│   │   ├── estoque/        # Controle de estoque
│   │   ├── faturamento/    # Faturamento
│   │   ├── fiscal/         # Regras fiscais
│   │   ├── financeiro/     # Contas a pagar/receber
│   │   ├── rh/             # Funcionários, folha de pagamento
│   │   ├── vendas/         # Clientes, pedidos de venda
│   │   └── wms/            # Lotes, localizações, alocações
│   ├── application/        # Casos de uso
│   │   └── use_cases/
│   │       ├── erp/        # CRUD produtos, fornecedores
│   │       ├── vendas/      # Processar venda
│   │       └── wms/         # Receber/alocar mercadorias
│   ├── infrastructure/     # Implementação técnica
│   │   ├── database.py     # SQLAlchemy config
│   │   ├── auth.py         # JWT authentication
│   │   ├── audit.py        # Audit logging
│   │   ├── orm_models/     # Modelos ORM (9 arquivos)
│   │   └── repositories/   # Implementações de repositório
│   └── presentation/       # API REST
│       └── api/
│           ├── middlewares/
│           └── routers/     # 16 routers FastAPI
├── frontend/
│   └── src/
│       ├── components/     # 21 componentes React
│       ├── services/        # api.js (camada de serviço)
│       └── assets/
├── tests/                  # Testes pytest
├── skills/                 # Skills para IA
├── supabase/              # Configuração Supabase
├── static/                 # Frontend buildado
├── Dockerfile
├── requirements.txt
└── .env
```

---

## Principais Funcionalidades

### Dashboard & BI
- Gráficos dinâmicos (vendas vs compras, distribuição financeira)
- KPIs em tempo real
- Indicadores de saúde do sistema

### Módulo ERP
- Cadastro de produtos (nome, código de barras, status)
- Gestão de fornecedores (razão social, CNPJ)
- Ordens de compra com workflow completo
- Parametrização de estoque (mínimos/máximos)

### Módulo WMS (Warehouse Management)
- Gestão de armazéns e posições (corredores/prateleiras)
- Recebimento de mercadorias com geração de lotes
- Alocação de produtos em localizações
- Controle de validade e lotes

### Módulo de Compras Workflow
- Solicitação de compra → Cotação → Aprovação → Conferência física → NF entrada
- Fluxo completo com múltiplas aprovações
- Conferencia física de mercadorias

### CRM & Vendas
- Gestão de clientes
- Leads e oportunidades
- Funil de vendas
- Vendedores e comissões
- Pedidos de venda com workflow

### Módulo Financeiro
- Contas a receber
- Fluxo de caixa
- Lançamentos financeiros

### Módulo Fiscal
- Regras fiscais por estado/produto
- Livro fiscal
- Cálculos de impostos

### Faturamento
- Propostas comerciais
- Notas fiscais de saída
- Contratos de serviço

### Recursos Humanos (RH)
- Cargos e funcionários
- Folha de pagamento
- Registro de ponto
- Resumo de colaboradores

### Controlling
- Centros de custo
- Plano orçamentário
- Realizado vs orçado

### Contabilidade
- Plano de contas contábeis
- Lançamentos contábeis (partidas dobradas)
- Integração com módulo financeiro

### Logística
- Gestão de expedição
- Rastreamento de envio

### Auditoria
- Log de todas as ações (ADMIN)
- Rastreabilidade completa

---

## Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| ADMIN | Acesso total ao sistema |
| RH_USER | Módulo de Recursos Humanos |
| FINANCE_USER | Módulo Financeiro |
| LOGISTICS_USER | Warehouse e Logística |
| SALES_USER | Vendas e CRM |
| USER | Acesso básico |

---

## Instalação Local

### 1. Backend (FastAPI)

```bash
# Ativar ambiente virtual
.venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env com DATABASE_URL do Supabase
# Exemplo: DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Iniciar servidor
uvicorn src.main:app --port 8000 --reload
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Acesse: http://localhost:5173
```

### 3. Variáveis de Ambiente (.env)

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=sua_chave_secreta_jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Deploy

### Backend (Render.com)
1. Conecte o repositório GitHub
2. Configure o `Root Directory` como raiz do projeto
3. Apontar para o Dockerfile
4. Injete a `DATABASE_URL` nas variáveis de ambiente

### Frontend (Vercel)
1. Conecte o repositório GitHub
2. Configure o `Root Directory` como `frontend`
3. Injete a `VITE_API_URL` (URL da API no Render)

---

## Scripts Úteis

| Script | Descrição |
|--------|-----------|
| `seed_sellers.py` | Popula tabela de vendedores |
| `update_db.py` | Atualiza schema do banco |
| `test_hash.py` | Teste de hashing |

---

## Testes

```bash
# Executar todos os testes
pytest

# Com coverage
pytest --cov=src tests/

# Teste específico
pytest tests/domain/
```

---

## API Endpoints Principais

| Módulo | Prefixo | Descrição |
|--------|---------|-----------|
| Auth | `/api/v1/auth` | Login, perfil, auditoria |
| Dashboard | `/api/v1/dashboard` | Estatísticas, gráficos, KPIs |
| ERP | `/api/v1/erp` | Produtos, fornecedores, pedidos |
| WMS | `/api/v1/wms` | Receber, alocar mercadorias |
| Vendas | `/api/v1/vendas` | Clientes, pedidos de venda |
| CRM | `/api/v1/crm` | Leads, oportunidades, funil |
| Financeiro | `/api/v1/financeiro` | Fluxo de caixa |
| Compras | `/api/v1/compras` | Workflow completo de compras |
| RH | `/api/v1/rh` | Cargos, funcionários, ponto |
| Controlling | `/api/v1/controlling` | Centros de custo, orçamentos |
| Analytics | `/api/v1/analytics` | Relatórios BI |
| Fiscal | `/api/v1/fiscal` | Regras fiscais |
| Faturamento | `/api/v1/faturamento` | Propostas, notas fiscais |
| Contratos | `/api/v1/contratos` | Gestão de contratos |
| Contabilidade | `/api/v1/contabilidade` | Lançamentos contábeis |
| Logística | `/api/v1/logistica` | Expedição |

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  Dashboard | ERP | WMS | CRM | Vendas | RH | Analytics...  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION (FastAPI)                    │
│   Routers: auth | erp | wms | crm | vendas | rh...         │
│   Middlewares: error handling, JWT validation                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION (Use Cases)                   │
│   ReceberMercadoria | AlocarProduto | ProcessarVenda...    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN (Entities)                       │
│   Lote | Localizacao | Produto | Fornecedor | Cliente...    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE (Impl)                      │
│   Repositories (SQLAlchemy) | ORM Models | Auth | Audit    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL/Supabase)               │
└─────────────────────────────────────────────────────────────┘
```

---

*Desenvolvido com foco em excelência técnica e agilidade logística.*
