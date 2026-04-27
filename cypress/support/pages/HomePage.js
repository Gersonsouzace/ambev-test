class HomePage {
  visit() {
    cy.intercept('GET', 'https://serverest.dev/produtos*').as('loadProducts')
    cy.visit('/home')
    cy.wait('@loadProducts')
    return this
  }

  getFirstProductName() {
    return cy.get('h5.card-title').first()
  }

  addFirstProductToShoppingList() {
    cy.getBySel('adicionarNaLista').first().click()
    return this
  }

  addProductToShoppingListByName(nome) {
    cy.contains('h5.card-title', nome)
      .parents('.card-body')
      .find('[data-testid="adicionarNaLista"]')
      .click()
    return this
  }

  logout() {
    cy.getBySel('logout').click()
    return this
  }
}

export default new HomePage()
