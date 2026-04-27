class ShoppingListPage {
  visit() {
    cy.visit('/minhaListaDeProdutos')
    return this
  }

  shouldBeEmpty() {
    cy.getBySel('shopping-cart-empty-message').should('be.visible')
    return this
  }

  shouldHaveProduct(partialName) {
    cy.getBySel('shopping-cart-product-name').should('contain', partialName)
    return this
  }

  shouldShowProductCount(count) {
    cy.getBySel('shopping-cart-product-name').should('have.length', count)
    return this
  }

  getFirstProductQuantity() {
    return cy.getBySel('shopping-cart-product-quantity').first()
  }

  clearList() {
    cy.getBySel('limparLista').click()
    return this
  }

  proceedToCart() {
    cy.getBySel('adicionar carrinho').click()
    return this
  }
}

export default new ShoppingListPage()
