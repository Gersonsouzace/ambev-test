// Seletor por data-testid — padrão de seletor desacoplado de CSS/lógica
Cypress.Commands.add('getBySel', (selector, ...args) =>
  cy.get(`[data-testid="${selector}"]`, ...args)
)

// Login com cache de sessão via UI — compatível com qualquer mecanismo de auth do app
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.getBySel('email').type(email)
    cy.getBySel('senha').type(password, { log: false })
    cy.getBySel('entrar').click()
    cy.url().should('not.include', '/login')
  })
})

// Criação de usuário via API — evita dependência de fluxo UI para setup
Cypress.Commands.add('createUser', (overrides = {}) => {
  const ts = Date.now()
  const user = {
    nome: `QA Teste ${ts}`,
    email: `qa.${ts}@serverest.com.br`,
    password: 'Test@1234',
    administrador: 'false',
    ...overrides,
  }
  return cy
    .request({ method: 'POST', url: `${Cypress.env('apiUrl')}/usuarios`, body: user })
    .its('body')
    .then((body) => ({ ...user, _id: body._id }))
})

// Login via API retorna apenas o token de autorização
Cypress.Commands.add('loginApi', (email, password) =>
  cy
    .request({ method: 'POST', url: `${Cypress.env('apiUrl')}/login`, body: { email, password } })
    .its('body.authorization')
)

// Criação de produto via API — requer token de administrador
Cypress.Commands.add('createProduct', (token, overrides = {}) => {
  const ts = Date.now()
  const product = {
    nome: `Produto QA ${ts}`,
    preco: 99,
    descricao: `Produto para teste automatizado ${ts}`,
    quantidade: 100,
    ...overrides,
  }
  return cy
    .request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/produtos`,
      body: product,
      headers: { Authorization: token },
    })
    .its('body')
    .then((body) => ({ ...product, _id: body._id }))
})

// Exclusão de produto via API — usado para limpeza pós-teste
Cypress.Commands.add('deleteProduct', (token, productId) =>
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/produtos/${productId}`,
    headers: { Authorization: token },
    failOnStatusCode: false,
  })
)

// Limpa a lista de compras via UI — garante estado inicial limpo nos testes de carrinho
Cypress.Commands.add('clearShoppingList', () => {
  cy.visit('/minhaListaDeProdutos')
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="limparLista"]').length > 0) {
      cy.getBySel('limparLista').click()
    }
  })
})
