# Arquitetura do Sistema (Clean Architecture)

Este documento detalha o design de software utilizado no sistema de ERP & WMS. O principal objetivo é o desacoplamento: as regras de negócio não conhecem a interface do usuário, nem o banco de dados.

## 🏛️ As 4 Camadas

### 1. Domain (Entidades e Regras de Ouro)
Localizado em `src/domain/`. Esta é a parte mais estável do código.
- **Entities**: Objetos com identidade única (ex: `Lote`, `Pedido`). Contêm as regras de negócio fundamentais (ex: "um lote não pode ter quantidade negativa").
- **Value Objects**: Objetos sem identidade, definidos apenas por seus atributos (ex: `CNPJ`, `Money`). Possuem validações intrínsecas.
- **Domain Services**: Lógicas que envolvem múltiplas entidades.

### 2. Application (Casos de Uso)
Localizado em `src/application/`. Serve como o "orquestrador" do sistema.
- **Use Cases**: Implementam as intenções do usuário (ex: `AlocarProdutoUseCase`). Eles buscam dados nos repositórios, aplicam regras nas entidades e salvam o resultado.
- **Ports (Interfaces)**: Definem o contrato que os repositórios reais devem seguir (Inversão de Dependência).

### 3. Infrastructure (Implementação Técnica)
Localizado em `src/infrastructure/`. Esta camada cuida da "sujeira" técnica.
- **Repositories**: Implementações concretas usando SQLAlchemy para falar com o PostgreSQL/Supabase.
- **Database Modals**: Modelos ORM que mapeiam as tabelas do banco de dados.
- **Configurações**: Gerenciamento de variáveis de ambiente (`.env`).

### 4. Presentation (Interface com o Mundo)
Localizado em `src/presentation/`. Como os usuários interagem com o software.
- **FastAPI Routers**: Expõem endpoints RESTful que recebem JSON do Frontend e chamam os Casos de Uso.
- **Schemas**: Definições Pydantic para validação de entrada e saída de dados.

---

## 🔁 Fluxo de Dados

1. O **React (Frontend)** envia um POST para a `/api/v1/erp/pedidos/`.
2. O **FastAPI (Presentation)** valida o JSON via Pydantic e injeta o Repositório no Caso de Uso.
3. O **Caso de Uso (Application)** carrega a Entidade do banco.
4. A **Entidade (Domain)** valida a regra de negócio.
5. O **Repositório (Infrastructure)** persiste a mudança no **Supabase**.
6. A resposta volta como JSON para o usuário.

---

## 💎 Benefícios desta Abordagem
- **Testabilidade**: Podemos testar as regras de negócio (Usecases) sem precisar ligar o banco de dados (usando Mocks).
- **Independência de Framework**: Se amanhã decidirmos trocar o FastAPI pelo Django, ou o Supabase pelo DynamoDB, o núcleo do negócio (`domain` e `application`) permanece intocado.
- **Manutenibilidade**: Mudanças no DB não quebram a interface, e mudanças no CSS do React não afetam o cálculo de impostos do backend.
