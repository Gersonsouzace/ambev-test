# ambev-cypress-e2e

Suíte de testes automatizados com **Cypress** para o projeto ServeRest, cobrindo testes E2E de frontend e testes de API REST.

---

## Aplicações sob teste

| Camada | URL |
|--------|-----|
| Frontend (E2E) | https://front.serverest.dev |
| API REST | https://serverest.dev |

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|------------|--------------|---------|
| Node.js | 20.x, 22.x ou 24.x | https://nodejs.org |
| npm | 10.1.0+ | incluído com Node.js |

---

## Instalação

```bash
# 1. Clone o repositório (ou extraia o zip)
git clone <url-do-repositorio>
cd ambev-cypress-e2e

# 2. Instale as dependências
npm install

# 3. (Apenas na primeira execução) Baixe o binário do Cypress
npx cypress install
```

---

## Estrutura do projeto

```
ambev-cypress-e2e/
├── cypress/
│   ├── e2e/                          # Testes E2E (frontend)
│   │   ├── auth/
│   │   │   └── login.cy.js           # Cenário 1 — Autenticação
│   │   ├── shopping-list/
│   │   │   └── shopping-list.cy.js   # Cenário 2 — Lista de Compras
│   │   └── products/
│   │       └── admin-products.cy.js  # Cenário 3 — Administração de Produtos
│   ├── api_test/                     # Testes de API (cy.request)
│   │   ├── usuarios/
│   │   │   └── usuarios.cy.js        # Cenário 1 — /login e /usuarios
│   │   ├── produtos/
│   │   │   └── produtos.cy.js        # Cenário 2 — /produtos
│   │   └── carrinhos/
│   │       └── carrinhos.cy.js       # Cenário 3 — /carrinhos
│   ├── fixtures/                     # Dados estáticos de teste
│   ├── support/
│   │   ├── commands.js               # Custom commands globais
│   │   ├── e2e.js                    # Entry point do suporte
│   │   ├── pages/                    # Page Objects (E2E)
│   │   │   ├── LoginPage.js
│   │   │   ├── HomePage.js
│   │   │   ├── ShoppingListPage.js
│   │   │   └── AdminProductsPage.js
│   │   └── api/                      # API Client layer
│   │       ├── requests.js           # Wrappers de cy.request por endpoint
│   │       └── factory.js            # Gerador de dados únicos por timestamp
├── cypress.config.js
├── package.json
└── README.md
```

---

## Scripts disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run cy:run` | Executa **todos** os testes em modo headless |
| `npm run cy:run:e2e` | Executa apenas os testes **E2E** (frontend) |
| `npm run cy:run:api` | Executa apenas os testes de **API** |
| `npm run cy:run:chrome` | Executa todos os testes no browser **Chrome** |
| `npm run cy:open` | Abre a interface interativa do Cypress |

---

## Executando os testes

### Todos os testes (headless)

```bash
npm run cy:run
```

### Apenas E2E

```bash
npm run cy:run:e2e
```

### Apenas API

```bash
npm run cy:run:api
```

### Interface interativa

```bash
npm run cy:open
```

### Resultado esperado

```
  Spec                                       Tests  Passing  Failing
  ──────────────────────────────────────────────────────────────────
  ✓  e2e/auth/login.cy.js                       3        3        0
  ✓  e2e/shopping-list/shopping-list.cy.js      3        3        0
  ✓  e2e/products/admin-products.cy.js          3        3        0
  ✓  api_test/carrinhos/carrinhos.cy.js         8        8        0
  ✓  api_test/produtos/produtos.cy.js           8        8        0
  ✓  api_test/usuarios/usuarios.cy.js          10       10        0
  ──────────────────────────────────────────────────────────────────
  ✓  All specs passed!                         35       35        0
```

---

## Cobertura de testes

### E2E — Frontend (`cypress/e2e/`)

| Spec | Cenários |
|------|----------|
| `auth/login.cy.js` | Login com credenciais inválidas; login com sucesso e redirecionamento; logout |
| `shopping-list/shopping-list.cy.js` | Adicionar produto à lista; verificar produto correto com quantidade 1; limpar lista |
| `products/admin-products.cy.js` | Cadastrar produto via formulário; exibir produto na listagem; excluir produto |

### API — ServeRest (`cypress/api_test/`)

| Spec | Cenários |
|------|----------|
| `usuarios/usuarios.cy.js` | Autenticação JWT; CRUD completo de usuários; filtros e validações |
| `produtos/produtos.cy.js` | Controle de acesso (401/403); CRUD de produtos; filtro por nome |
| `carrinhos/carrinhos.cy.js` | Listagem; criação com regras de negócio; concluir e cancelar compra |

---

## Padrões e boas práticas adotados

- **Page Object Pattern** com interface fluente para os testes E2E
- **API Client layer** (`requests.js`) com wrappers por endpoint para os testes de API
- **Data Factory** com dados únicos por timestamp — sem conflito entre execuções

---

## Configuração de ambiente

As variáveis de ambiente são definidas em `cypress.config.js`:

```js
env: {
  apiUrl: 'https://serverest.dev',
}
```

Para sobrescrever via linha de comando:

```bash
npx cypress run --env apiUrl=http://localhost:3001
```


---

## Dependências

| Pacote | Versão | Papel |
|--------|--------|-------|
| [cypress](https://www.npmjs.com/package/cypress) | ^14.5.4 | Framework de testes (única dependência) |

> Todos os testes utilizam apenas as APIs nativas do Cypress (`cy.request`, `cy.intercept`, `cy.session`, Page Objects em JS puro). Não há dependências de bibliotecas externas além do próprio Cypress.
