class AdminProductsPage {
  visitList() {
    cy.intercept('GET', 'https://serverest.dev/produtos*').as('loadProducts')
    cy.visit('/admin/listarprodutos')
    cy.wait('@loadProducts')
    return this
  }

  visitForm() {
    cy.visit('/admin/cadastrarprodutos')
    return this
  }

  fillProductForm({ nome, preco, descricao, imagem, quantidade }) {
    cy.getBySel('nome').clear().type(nome)
    cy.getBySel('preco').clear().type(preco.toString())
    cy.getBySel('descricao').clear().type(descricao)
    if (imagem) cy.getBySel('imagem').clear().type(imagem)
    cy.getBySel('quantity').clear().type(quantidade.toString())
    return this
  }

  submitForm() {
    // Atenção: "cadastarProdutos" é o testid original do app (typo — falta o "r")
    cy.getBySel('cadastarProdutos').click()
    return this
  }

  findRowByProductName(nome) {
    return cy.contains('td', nome).parent('tr')
  }

  deleteProductByName(nome) {
    this.findRowByProductName(nome).within(() => {
      cy.contains('button', 'Excluir').click()
    })
    return this
  }

  shouldContainProduct(nome) {
    cy.contains('td', nome).should('be.visible')
    return this
  }

  shouldNotContainProduct(nome) {
    cy.contains('td', nome).should('not.exist')
    return this
  }
}

export default new AdminProductsPage()
