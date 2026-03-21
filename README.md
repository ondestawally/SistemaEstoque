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
| Auth | JWT (python-jose) | 3.3.0 |
| Password | Bcrypt (passlib) | 1.7.4 |
| Deploy API | Render.com (Docker) | - |
| Deploy Web | Vercel | - |

---

## Estrutura de Pastas (Clean Architecture)

```
SistemaEstoque/
├── src/
│   ├── domain/                    # Entidades, Value Objects, Regras de Negócio
│   │   ├── value_objects.py       # CNPJ, Money, CPF
│   │   ├── compras/               # Workflow de compras
│   │   ├── contabilidade/         # Plano de contas, lançamentos
│   │   ├── controlling/           # Centros de custo, orçamentos
│   │   ├── contratos/             # Gestão de contratos
│   │   ├── erp/                   # Produtos, Fornecedores
│   │   ├── estoque/               # Controle de estoque, custos
│   │   ├── faturamento/           # Propostas comerciais, notas fiscais
│   │   ├── fiscal/                # Regras fiscais, tributos
│   │   ├── financeiro/            # Contas a pagar/receber
│   │   ├── rh/                    # Funcionários, cargos
│   │   ├── vendas/                # Clientes, pedidos de venda
│   │   └── wms/                    # Lotes, localizações, alocações
│   ├── application/               # Casos de uso
│   │   ├── ports/                 # Interfaces de repositório
│   │   └── use_cases/
│   │       ├── erp/               # CRUD produtos, pedidos de compra
│   │       ├── vendas/            # Processar venda
│   │       └── wms/                # Receber/alocar mercadorias
│   ├── infrastructure/            # Implementação técnica
│   │   ├── database.py            # SQLAlchemy config
│   │   ├── auth.py                # JWT authentication
│   │   ├── audit.py               # Audit logging
│   │   ├── logging_config.py      # Configuração de logs
│   │   ├── orm_models/            # Modelos ORM (10 arquivos)
│   │   └── repositories/          # Implementações de repositório
│   └── presentation/              # API REST
│       └── api/
│           ├── middlewares/       # Error handling
│           └── routers/           # 17 routers FastAPI
├── frontend/
│   └── src/
│       ├── components/            # 26 componentes React
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Produtos.jsx
│       │   ├── Estoque.jsx
│       │   ├── ComprasWorkflow.jsx
│       │   ├── CRM.jsx
│       │   ├── Vendas.jsx
│       │   ├── Comissoes.jsx
│       │   ├── Financeiro.jsx
│       │   ├── Fiscal.jsx
│       │   ├── Faturamento.jsx
│       │   ├── Contratos.jsx
│       │   ├── Contabilidade.jsx
│       │   ├── Controlling.jsx
│       │   ├── RH.jsx
│       │   ├── Expedicao.jsx
│       │   ├── Auditoria.jsx
│       │   ├── Analytics.jsx
│       │   ├── WMSModal.jsx
│       │   ├── ComprasModal.jsx
│       │   ├── Parceiros.jsx
│       │   └── App.jsx
│       ├── services/              # api.js (camada de serviço)
│       └── assets/
├── tests/                         # Testes pytest
├── skills/                        # Skills para IA
├── supabase/                      # Configuração Supabase
├── static/                        # Frontend buildado
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
- Analytics com relatórios avançados

### Módulo ERP
- Cadastro de produtos (nome, código de barras, status)
- Gestão de fornecedores (razão social, CNPJ)
- Gestão de clientes
- Ordens de compra com workflow completo
- Parametrização de estoque (mínimos/máximos)
- Robust routers para operações de alto volume

### Módulo WMS (Warehouse Management)
- Gestão de armazéns e posições (corredores/prateleiras)
- Recebimento de mercadorias com geração de lotes
- Alocação de produtos em localizações
- Controle de validade e lotes
- Modal interativo para operações WMS

### Módulo de Compras Workflow
- Solicitação de compra → Cotação → Aprovação → Conferência física → NF entrada
- Fluxo completo com múltiplas aprovações
- Conferencia física de mercadorias
- Modal para registro de compras

### CRM & Vendas
- Gestão de clientes
- Leads e oportunidades
- Funil de vendas
- Vendedores e comissões
- Pedidos de venda com workflow
- Gestão de parceiros comerciais

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
|--------|------------|
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
2. Configure o `Root Directory` como `SistemaEstoque`
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
| `test_hash.py` | Teste de hashing de senhas |

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
| Estoque | `/api/v1/estoque` | Controle de estoque |
| Robust | `/api/v1/robust` | Operações de alto volume |

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  Dashboard | ERP | WMS | CRM | Vendas | RH | Analytics...  │
│  + 26 componentes React com TailwindCSS                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION (FastAPI)                    │
│   Routers: auth | erp | wms | crm | vendas | rh...         │
│   Middlewares: error handling, JWT validation, CORS         │
│   Schemas: Pydantic validation                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION (Use Cases)                   │
│   ReceberMercadoria | AlocarProduto | ProcessarVenda...     │
│   Ports (Interfaces) para inversão de dependência           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN (Entities)                       │
│   Lote | Localizacao | Produto | Fornecedor | Cliente...    │
│   Value Objects: CNPJ, Money, CPF                           │
│   Domain Services: Regras de negócio puras                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE (Impl)                      │
│   Repositories (SQLAlchemy) | ORM Models (10 arquivos)     │
│   Auth (JWT) | Audit Logging | Database Config              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL/Supabase)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Versionamento por Fases

| Fase | Módulo | Descrição |
|------|--------|-----------|
| 1-5 | Core | ERP, Logística, CRM, Contratos, Dashboard, Vendas, Financeiro |
| 6 | ERP Completo | Estoque, Compras, Fiscal, Faturamento, Contabilidade |
| 7 | Enterprise | RH, Controlling |
| 8 | Segurança | Auth, JWT, Auditoria |
| 9 | Analytics & BI | Dashboards avançados, relatórios |
| 10 | Logística Avançada | Expedição, rastreamento |

---

*Desenvolvido com foco em excelência técnica e agilidade logística.*
