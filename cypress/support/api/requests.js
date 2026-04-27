// Camada de acesso à API — equivalente ao Page Object para testes de contrato HTTP.
// Cada namespace agrupa as operações de um recurso, retornando cy.request() pronto para encadeamento.

const url = (path) => `${Cypress.env('apiUrl')}${path}`

export const auth = {
  login: (email, password) =>
    cy.request({
      method: 'POST',
      url: url('/login'),
      body: { email, password },
      failOnStatusCode: false,
    }),

  loginPayload: (body) =>
    cy.request({ method: 'POST', url: url('/login'), body, failOnStatusCode: false }),
}

export const usuarios = {
  criar: (body) =>
    cy.request({ method: 'POST', url: url('/usuarios'), body, failOnStatusCode: false }),

  listar: (qs = {}) =>
    cy.request({ method: 'GET', url: url('/usuarios'), qs }),

  atualizar: (id, body) =>
    cy.request({ method: 'PUT', url: url(`/usuarios/${id}`), body, failOnStatusCode: false }),

  excluir: (id) =>
    cy.request({ method: 'DELETE', url: url(`/usuarios/${id}`), failOnStatusCode: false }),
}

export const produtos = {
  criar: (body, token) =>
    cy.request({
      method: 'POST',
      url: url('/produtos'),
      body,
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),

  listar: (qs = {}) =>
    cy.request({ method: 'GET', url: url('/produtos'), qs }),

  atualizar: (id, body, token) =>
    cy.request({
      method: 'PUT',
      url: url(`/produtos/${id}`),
      body,
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),

  excluir: (id, token) =>
    cy.request({
      method: 'DELETE',
      url: url(`/produtos/${id}`),
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),
}

export const carrinhos = {
  criar: (body, token) =>
    cy.request({
      method: 'POST',
      url: url('/carrinhos'),
      body,
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),

  listar: (qs = {}) =>
    cy.request({ method: 'GET', url: url('/carrinhos'), qs }),

  concluirCompra: (token) =>
    cy.request({
      method: 'DELETE',
      url: url('/carrinhos/concluir-compra'),
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),

  cancelarCompra: (token) =>
    cy.request({
      method: 'DELETE',
      url: url('/carrinhos/cancelar-compra'),
      headers: { Authorization: token },
      failOnStatusCode: false,
    }),
}
