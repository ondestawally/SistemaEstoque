# Frontend - SistemaEstoque

Frontend reativo do sistema ERP & WMS, construído com **React 19**, **Vite 8** e **TailwindCSS 4**.

## Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19.2.4 | Framework UI |
| Vite | 8.0.0 | Bundler/dev server |
| TailwindCSS | 4.2.1 | Estilização |
| Recharts | 3.8.0 | Gráficos e BI |
| PostCSS | 8.5.8 | Processamento CSS |

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/           # 26 componentes React
│   │   ├── Dashboard.jsx     # Dashboard principal com KPIs
│   │   ├── Login.jsx         # Autenticação
│   │   ├── Produtos.jsx      # Cadastro de produtos
│   │   ├── Estoque.jsx       # Controle de estoque
│   │   ├── ComprasWorkflow.jsx # Workflow de compras
│   │   ├── ComprasModal.jsx  # Modal para compras
│   │   ├── CRM.jsx           # Gestão de clientes e leads
│   │   ├── Vendas.jsx        # Pedidos de venda
│   │   ├── Comissoes.jsx     # Comissões de vendedores
│   │   ├── Financeiro.jsx    # Fluxo de caixa
│   │   ├── Fiscal.jsx        # Regras fiscais
│   │   ├── Faturamento.jsx  # Notas fiscais, propostas
│   │   ├── Contratos.jsx    # Gestão de contratos
│   │   ├── Contabilidade.jsx # Lançamentos contábeis
│   │   ├── Controlling.jsx  # Centros de custo, orçamentos
│   │   ├── RH.jsx           # Recursos humanos
│   │   ├── Expedicao.jsx   # Logística de expedição
│   │   ├── Auditoria.jsx    # Log de auditoria
│   │   ├── Analytics.jsx    # Relatórios BI
│   │   ├── WMSModal.jsx    # Modal para operações WMS
│   │   ├── Parceiros.jsx   # Fornecedores e parceiros
│   │   └── App.jsx          # Componente principal
│   ├── services/
│   │   └── api.js           # Camada de comunicação com API
│   ├── assets/              # Arquivos estáticos
│   ├── App.css              # Estilos globais
│   ├── index.css            # Estilos TailwindCSS
│   └── main.jsx             # Entry point
├── public/                   # Arquivos públicos
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Scripts

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento (porta 5173)

# Build
npm run build        # Cria build de produção
npm run preview      # Visualiza build de produção

# Linting
npm run lint         # Executa ESLint
```

## Instalação

```bash
# Na pasta frontend
npm install

# Iniciar desenvolvimento
npm run dev
```

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:8000  # URL da API backend
```

## Arquitetura de Componentes

### Autenticação
- `Login.jsx`: Formulário de login com validação JWT

### Dashboard
- `Dashboard.jsx`: Visão geral com gráficos Recharts (vendas, compras, financeiro)
- `Analytics.jsx`: Relatórios BI avançados

### ERP
- `Produtos.jsx`: CRUD de produtos
- `Parceiros.jsx`: Gestão de fornecedores e parceiros
- `ComprasWorkflow.jsx` + `ComprasModal.jsx`: Workflow completo de compras

### WMS
- `Estoque.jsx`: Controle de estoque e lotes
- `WMSModal.jsx`: Modal para operações de warehouse

### CRM & Vendas
- `CRM.jsx`: Leads, oportunidades, funil de vendas
- `Vendas.jsx`: Pedidos de venda
- `Comissoes.jsx`: Comissões de vendedores

### Financeiro
- `Financeiro.jsx`: Contas a pagar/receber, fluxo de caixa

### Fiscal
- `Fiscal.jsx`: Regras fiscais, cálculos de impostos

### Faturamento
- `Faturamento.jsx`: Propostas comerciais, notas fiscais

### Enterprise
- `Contratos.jsx`: Gestão de contratos
- `Contabilidade.jsx`: Plano de contas, lançamentos
- `Controlling.jsx`: Centros de custo, orçamentos
- `RH.jsx`: Funcionários, cargos, ponto

### Logística
- `Expedicao.jsx`: Gestão de expedição

### Admin
- `Auditoria.jsx`: Log de auditoria (ADMIN)

## Camada de Serviços

O arquivo `services/api.js` centraliza toda comunicação com a API:

```javascript
// Exemplo de uso
import api from '../services/api';

// GET
const data = await api.get('/api/v1/dashboard/stats');

// POST
await api.post('/api/v1/auth/login', { email, senha });
```

## Integração com Backend

O frontend consome a API REST em `/api/v1/*` através de autenticação JWT.

### Endpoints Principais

| Módulo | Endpoint |
|--------|----------|
| Auth | `/api/v1/auth/login` |
| Dashboard | `/api/v1/dashboard/*` |
| Produtos | `/api/v1/erp/produtos/*` |
| Estoque | `/api/v1/estoque/*` |
| CRM | `/api/v1/crm/*` |
| Vendas | `/api/v1/vendas/*` |

---

*Parte do ecossistema SistemaEstoque ERP & WMS*
