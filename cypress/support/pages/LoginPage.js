class LoginPage {
  visit() {
    cy.visit('/login')
    return this
  }

  fillEmail(email) {
    cy.getBySel('email').clear().type(email)
    return this
  }

  fillPassword(password) {
    cy.getBySel('senha').clear().type(password, { log: false })
    return this
  }

  submit() {
    cy.getBySel('entrar').click()
    return this
  }

  shouldShowInvalidCredentialsError() {
    cy.contains('Email e/ou senha inválidos').should('be.visible')
    return this
  }

  shouldBeRedirectedToHome() {
    cy.url().should('include', '/home')
    return this
  }
}

export default new LoginPage()
