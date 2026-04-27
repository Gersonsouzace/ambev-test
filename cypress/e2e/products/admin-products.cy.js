import AdminProductsPage from '../../support/pages/AdminProductsPage'

/**
 * Cenário 3 — Administração de Produtos
 *
 * Cobre o CRUD de produtos na área administrativa:
 * cadastro via formulário, exibição na listagem e exclusão.
 *
 * Setup:
 *  - Administrador criado via API.
 *  - Produtos criados via API quando o objetivo do teste não é o formulário,
 *    garantindo isolamento entre os testes.
 *  - Produtos criados em teste são removidos no afterEach.
 */
describe('Administração de Produtos', () => {
  let admin
  let adminToken
  let productToCleanup = null

  before(() => {
    cy.createUser({ administrador: 'true' }).then((createdAdmin) => {
      admin = createdAdmin
      cy.loginApi(admin.email, admin.password).then((token) => {
        adminToken = token
      })
    })
  })

  beforeEach(() => {
    productToCleanup = null
    cy.login(admin.email, admin.password)
    AdminProductsPage.visitList()
  })

  afterEach(() => {
    if (productToCleanup) {
      cy.deleteProduct(adminToken, productToCleanup)
    }
  })

  it('deve cadastrar novo produto com sucesso através do formulário', () => {
    const productName = `Produto QA UI ${Date.now()}`

    cy.intercept('POST', 'https://serverest.dev/produtos').as('createProduct')

    AdminProductsPage.visitForm().fillProductForm({
      nome: productName,
      preco: 150,
      descricao: 'Produto criado via formulário de teste automatizado',
      quantidade: 30,
    }).submitForm()

    cy.wait('@createProduct').then(({ response }) => {
      expect(response.statusCode).to.eq(201)
      expect(response.body).to.have.property('_id')
      productToCleanup = response.body._id
    })

    cy.url().should('include', '/admin/listarprodutos')
  })

  it('deve exibir produto recém-cadastrado na listagem de produtos', () => {
    cy.createProduct(adminToken).then((product) => {
      productToCleanup = product._id

      AdminProductsPage.visitList().shouldContainProduct(product.nome)
    })
  })

  it('deve excluir produto da listagem com sucesso', () => {
    cy.createProduct(adminToken).then((product) => {
      cy.intercept('DELETE', `https://serverest.dev/produtos/${product._id}`).as('deleteProduct')

      AdminProductsPage.visitList().deleteProductByName(product.nome)

      cy.wait('@deleteProduct').its('response.statusCode').should('eq', 200)

      AdminProductsPage.shouldNotContainProduct(product.nome)
    })
  })
})
