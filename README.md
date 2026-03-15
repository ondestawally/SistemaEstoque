# Sistema ERP & WMS

Um sistema ERP (Enterprise Resource Planning) integrado com um WMS (Warehouse Management System) construído com base nas melhores práticas de Programação Orientada a Objetos (POO), Clean Architecture (Arquitetura Limpa) e princípios SOLID.

## 🎯 Objetivo
Oferecer um sistema robusto para gestão corporativa (ERP) focado fortemente no gerenciamento eficiente de armazenagem, controle de estoque e logística (WMS).

## 🏛️ Arquitetura
O projeto segue uma arquitetura em camadas para garantir separação de responsabilidades (Separation of Concerns):

1. **Domain Layer (Camada de Domínio)**
   - Entidades de Negócio (ex: Produto, Lote, Armazém, Usuário).
   - Value Objects (ex: Dinheiro, CNPJ, Dimensões).
   - Exceções de Domínio.
2. **Application Layer (Camada de Aplicação)**
   - Casos de Uso (Use Cases) do ERP e WMS (ex: `ReceberMercadoria`, `AlocarProduto`, `FaturarPedido`).
   - Interfaces (Portas) para repositórios e serviços externos.
3. **Infrastructure Layer (Camada de Infraestrutura)**
   - Implementação de Repositórios (Banco de Dados, ORMs).
   - Integrações de Serviços Externos (APIs de emissão de NF, Correios/Transportadoras).
4. **Presentation/Interface Layer (Camada de Apresentação)**
   - Controladores (API REST, CLI, ou Interface Gráfica).

## 📦 Módulos Principais

### 1. WMS (Warehouse Management System)
* Gestão de Locais de Armazenagem (Ruas, Prateleiras, Posições).
* Controle de Lotes e Validade.
* Recebimento, Conferência e Armazenagem (Putaway).
* Separação (Picking), Embalagem (Packing) e Expedição.
* Rastreabilidade total das movimentações de estoque.

### 2. ERP (Enterprise Resource Planning)
* **Gestão de Compras:** Fornecedores, Gestão de Demandas, e Controle de Requisições.
  * **Ordem de Compra (OC):** Compras pontuais ou sem disputa formal.
  * **Ordem de Fornecimento (OF):** Compras atreladas a contratos de fornecimento pré-estabelecidos.
  * NFs de Entrada e conciliação físico-financeira.
* **Gestão de Vendas:** Clientes, Pedidos de Venda, Faturamento, NFs de Saída.
* **Gestão Financeira:** Contas a Pagar/Receber, Fluxo de Caixa.

## 🛠️ Tecnologias
- **Linguagem:** Python
- **Abordagem:** Orientação a Objetos (POO)
- **Design Patterns:** Repository, Factory, Strategy, Observer.

## 🚀 Como Iniciar

1. Clone o repositório ou acesse a pasta do projeto.
2. Ative o ambiente virtual (já configurado em `.venv`):
   ```bash
   # Windows
   .venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```
3. Instale as dependências (em breve será adicionado o `requirements.txt`).
4. Execute o projeto.

## 🤝 Práticas de Desenvolvimento (Diretrizes para nossa construção)
- **SOLID:** Todo o código implementado seguirá princípios SOLID.
- **Test-Driven Development (TDD):** Aconselha-se criar os testes de unidade junto com os casos de uso.
- **Type Hinting:** Uso intensivo de tipagem estática no Python (`typing`) para facilitar a documentação e prevenir erros.
- **Docstrings:** Todas as classes principais devem ter documentação clara de suas responsabilidades.

---
*Em desenvolvimento...*
