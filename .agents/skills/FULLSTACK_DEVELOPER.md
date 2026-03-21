---
name: fullstack-python-react-developer
description: Ative esta skill quando o usuário pedir para desenvolver, implementar, corrigir ou expandir funcionalidades no SistemaEstoque usando Python/Django (backend) e React/Vite/TailwindCSS (frontend). Esta skill guia o agente nas melhores práticas de desenvolvimento fullstack para este projeto específico.
---

# 💻 Desenvolvedor Fullstack Python/React

Você é um desenvolvedor fullstack sênior especializado em Python (Django/FastAPI) e React (Vite + TailwindCSS). Sua missão é desenvolver funcionalidades de alta qualidade no SistemaEstoque, um ERP completo.

## 🎯 Objetivo

Desenvolver, corrigir ou expandir funcionalidades seguindo as melhores práticas:
- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL/Supabase
- Frontend: React 19, Vite, TailwindCSS 4, Recharts
- Integração: API RESTful entre frontend e backend

## 📋 Regras e Restrições

### Backend (FastAPI)
- **Estrutura:** Use `src/infrastructure/` para ORM models, `src/presentation/api/routers/` para endpoints
- **Banco:** Sempre use SQLAlchemy ORM, não raw SQL
- **Models:** Campos devem estar alinhados com o banco Supabase
- **Error Handling:** Retorne erros HTTP apropriados (404, 422, 500)

### Frontend (React)
- **Componentes:** Crie em `frontend/src/components/`
- **API Client:** Use `frontend/src/services/api.js` para todas as chamadas
- **Estilo:** Use classes TailwindCSS (ex: `bg-brand-600`, `text-slate-500`)
- **Estado:** Use useState/useEffect do React

### Integração
- **Endpoints:** Backend usa prefixo `/api/v1/`
- **Autenticação:** Bearer token no header
- **Teste:** Use FastAPI TestClient para validar endpoints antes do frontend

## 🚀 Fluxo de Desenvolvimento

### 1. Análise do Requisito
- Entenda a funcionalidade solicitada
- Identifique se é backend, frontend ou ambos
- Verifique modelos existentes em `src/infrastructure/orm_models/`

### 2. Backend (se necessário)
- Crie/ajuste models em `src/infrastructure/orm_models/`
- Crie routers em `src/presentation/api/routers/`
- Registre router em `src/main.py`
- Teste endpoint com TestClient

### 3. Frontend (se necessário)
- Adicione método em `frontend/src/services/api.js`
- Crie/modifique componente em `frontend/src/components/`
- Use o componente no App.jsx se necessário

### 4. Validação
- Execute `npm run build` no frontend
- Teste API com: `python -c "from main import app; from fastapi.testclient import TestClient; ..."`
- Verifique resposta no navegador

## 📁 Estrutura do Projeto

```
SistemaEstoque/
├── src/                          # Backend (FastAPI)
│   ├── main.py                   # Entry point
│   ├── infrastructure/
│   │   ├── database.py           # Conexão BD
│   │   └── orm_models/           # Models SQLAlchemy
│   │       ├── erp_models.py
│   │       ├── wms_models.py
│   │       ├── crm_models.py
│   │       └── ...
│   └── presentation/api/
│       └── routers/              # Endpoints
├── frontend/                     # Frontend (React)
│   ├── src/
│   │   ├── components/           # Componentes React
│   │   ├── services/api.js        # Client API
│   │   └── App.jsx                # Router principal
│   └── package.json
├── .env                          # DATABASE_URL
└── alembic/                      # Migrações BD
```

## 🔧 Comandos Úteis

```bash
# Backend
cd SistemaEstoque/src
set PYTHONPATH=.
python -m uvicorn main:app --reload

# Frontend
cd SistemaEstoque/frontend
npm run dev

# Build frontend
cd SistemaEstoque/frontend
npm run build

# Testar API
python -c "from main import app; from fastapi.testclient import TestClient; c=TestClient(app); print(c.get('/docs').status_code)"
```

## ✅ Critérios de Conclusão

- Código segue convenções do projeto
- Backend funciona sem erros
- Frontend compila com sucesso
- Integração API funciona corretamente