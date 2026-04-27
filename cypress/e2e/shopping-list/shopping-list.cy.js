import HomePage from '../../support/pages/HomePage'
import ShoppingListPage from '../../support/pages/ShoppingListPage'

/**
 * Cenário 2 — Lista de Compras
 *
 * Cobre o fluxo de gerenciamento da lista de compras:
 * adicionar produto, verificar exibição e limpar lista.
 *
 * Setup:
 *  - Produto criado via API (admin) para garantir que há itens disponíveis.
 *  - Usuário comum criado via API para executar as ações de compra.
 *  - Lista limpa antes de cada teste para garantir independência.
 */
describe('Lista de Compras', () => {
  let adminToken
  let testProduct
  let regularUser

  before(() => {
    cy.createUser({ administrador: 'true' }).then((admin) => {
      cy.loginApi(admin.email, admin.password).then((token) => {
        adminToken = token
        cy.createProduct(token).then((product) => {
          testProduct = product
        })
      })
    })

    cy.createUser().then((user) => {
      regularUser = user
    })
  })

  beforeEach(() => {
    cy.login(regularUser.email, regularUser.password)
    cy.clearShoppingList()
    HomePage.visit()
  })

  after(() => {
    cy.deleteProduct(adminToken, testProduct._id)
  })

  it('deve adicionar um produto à lista de compras', () => {
    HomePage.addFirstProductToShoppingList()

    // clicar em "Adicionar a lista" navega automaticamente para /minhaListaDeProdutos
    cy.url().should('include', '/minhaListaDeProdutos')
    cy.getBySel('shopping-cart-empty-message').should('not.exist')
    cy.getBySel('shopping-cart-product-name').should('have.length.gte', 1)
  })

  it('deve exibir o produto correto com quantidade inicial 1 na lista', () => {
    HomePage.addProductToShoppingListByName(testProduct.nome)

    ShoppingListPage.shouldHaveProduct(testProduct.nome)
    ShoppingListPage.getFirstProductQuantity().should('contain', '1')
  })

  it('deve limpar toda a lista de compras', () => {
    HomePage.addFirstProductToShoppingList()

    // Confirma que há ao menos um item antes de limpar
    cy.getBySel('shopping-cart-product-name').should('have.length.gte', 1)

    ShoppingListPage.clearList()

    ShoppingListPage.shouldBeEmpty()
  })
})
