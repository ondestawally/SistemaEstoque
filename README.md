# Admin ERP & WMS Enterprise

Sistema integrado de gestão corporativa (ERP) e logística (WMS) de alta performance, construído com **Arquitetura Limpa (Clean Architecture)**, backend asincrônico em **Python** e frontend reativo em **React**.

---

## 🚀 Tecnologias e Infraestrutura

O sistema utiliza as tecnologias mais modernas do mercado para garantir escalabilidade e separação de responsabilidades:

- **Backend**: Python 3.11 + FastAPI (Rápido, tipado e asincrônico).
- **ORM / Banco de Dados**: SQLAlchemy + PostgreSQL hospedado no **Supabase**.
- **Frontend**: React 19 + Vite + TailwindCSS v4 + Recharts (BI & Dashboards).
- **Infraestrutura Cloud**: 
  - API: Hospedada no **Render.com** (via Docker).
  - Web: Hospedada na **Vercel** (Edge Computing).
  - DB: Gerenciado no **Supabase**.

---

## 🏛️ Estrutura de Pastas (Clean Architecture)

Nosso projeto segue rigorosamente a separação em camadas para facilitar a manutenção e testes:

```text
SistemaEstoque/
├── src/
│   ├── domain/         # Núcleo: Entidades, Value Objects e Regras de Negócio Puras.
│   ├── application/    # Casos de Uso: Orquestração da lógica e Interfaces (Ports).
│   ├── infrastructure/ # Detalhes: Banco de Dados, Repositórios SQLAlchemy, .env.
│   └── presentation/   # Interface: Rotas FastAPI (ERP, WMS, Dashboard).
├── frontend/           # Aplicação React (Dashboard, Modais, Services API).
├── tests/              # Testes unitários e de integração (Pytest).
├── Dockerfile          # Empacotamento para Deploy Cloud.
└── requirements.txt    # Dependências do Backend.
```

---

## 🛠️ Como Iniciar Localmente

### 1. Requisitos
- Python 3.11+
- Node.js & npm

### 2. Backend (FastAPI)
1. Navegue até a raiz e ative o ambiente virtual:
   ```bash
   .venv\Scripts\activate
   ```
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure o arquivo `.env` com sua `DATABASE_URL` do Supabase.
4. Inicie o servidor:
   ```bash
   uvicorn src.main:app --port 8000 --reload
   ```

### 3. Frontend (React)
1. Navegue até a pasta `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Acesse: `http://localhost:5173`

---

## 📊 Principais Funcionalidades

- **Dashboard BI**: Gráficos dinâmicos de distribuição de estoque e saúde do sistema.
- **Módulo ERP**: Cadastro de produtos, fornecedores e geração de ordens de compra.
- **Módulo WMS**: Controle de locais de armazenagem, lotes, validade e alocação.
- **Segurança**: Validação rigorosa de dados (CNPJ, Quantidades) via Pydantic.
- **Cloud Ready**: Configurações prontas para deploy em escala.

---

## 🌍 Deploy

- **Instruções para Render (Backend)**: Conecte seu GitHub, aponte para o Dockerfile e injete a `DATABASE_URL`.
- **Instruções para Vercel (Frontend)**: Conecte seu GitHub, defina o `Root Directory` como `frontend` e injete a `VITE_API_URL`.

---
*Desenvolvido com foco em excelência técnica e agilidade logística.*
