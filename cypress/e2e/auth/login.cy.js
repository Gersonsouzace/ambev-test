import LoginPage from '../../support/pages/LoginPage'
import HomePage from '../../support/pages/HomePage'

/**
 * Cenário 1 — Autenticação
 *
 * Cobre o fluxo completo de autenticação:
 * login inválido, login bem-sucedido e logout.
 *
 * Setup: usuário criado via API (sem dependência de UI).
 */
describe('Autenticação', () => {
  let user

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser
    })
  })

  beforeEach(() => {
    LoginPage.visit()
  })

  it('deve exibir mensagem de erro ao tentar login com credenciais inválidas', () => {
    LoginPage.fillEmail('usuario.invalido@qa.com.br')
      .fillPassword('senha_errada')
      .submit()
      .shouldShowInvalidCredentialsError()
  })

  it('deve realizar login com sucesso e redirecionar para a página inicial', () => {
    LoginPage.fillEmail(user.email).fillPassword(user.password).submit()

    cy.url().should('include', '/home')
    cy.getBySel('logout').should('be.visible')
  })

  it('deve realizar logout com sucesso e redirecionar para a tela de login', () => {
    cy.login(user.email, user.password)
    HomePage.visit()

    HomePage.logout()

    cy.url().should('include', '/login')
    cy.getBySel('entrar').should('be.visible')
  })
})
