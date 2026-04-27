import { auth, usuarios, produtos } from '../../support/api/requests'
import { factory } from '../../support/api/factory'

/**
 * Cenário 2 — Gerenciamento de Produtos
 *
 * Cobre controle de acesso (auth/authz), CRUD completo e regras de negócio
 * do endpoint /produtos. Todos os testes de escrita exigem token de admin.
 *
 * Estratégia de dados:
 *  - Admin criado em before() e reutilizado em toda a suite.
 *  - Produtos criados dentro de cada teste e removidos ao final.
 *  - Produtos de long-lived setup removidos em after().
 */
describe('API — Gerenciamento de Produtos', () => {
  let admin
  let adminToken
  let regularUser
  let regularToken

  before(() => {
    const adminData = factory.adminUsuario()
    usuarios.criar(adminData).then(({ body }) => {
      admin = { ...adminData, _id: body._id }
      auth.login(adminData.email, adminData.password).then(({ body }) => {
        adminToken = body.authorization
      })
    })

    const userData = factory.usuario()
    usuarios.criar(userData).then(({ body }) => {
      regularUser = { ...userData, _id: body._id }
      auth.login(userData.email, userData.password).then(({ body }) => {
        regularToken = body.authorization
      })
    })
  })

  after(() => {
    if (admin?._id) usuarios.excluir(admin._id)
    if (regularUser?._id) usuarios.excluir(regularUser._id)
  })

  // ─── Contexto 1: Controle de Acesso ─────────────────────────────────────────

  context('POST /produtos — Controle de Acesso', () => {
    it('deve retornar 401 ao tentar criar produto sem token de autenticação', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/produtos`,
        body: factory.produto(),
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body.message).to.contain('Token de acesso ausente')
      })
    })

    it('deve retornar 403 ao tentar criar produto com token de usuário comum', () => {
      produtos.criar(factory.produto(), regularToken).then(({ status, body }) => {
        expect(status).to.eq(403)
        expect(body).to.have.property('message', 'Rota exclusiva para administradores')
      })
    })
  })

  // ─── Contexto 2: CRUD de Produtos ───────────────────────────────────────────

  context('POST /produtos — Criação', () => {
    it('deve criar produto como administrador e retornar _id', () => {
      const prodData = factory.produto()

      produtos.criar(prodData, adminToken).then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body).to.have.property('message', 'Cadastro realizado com sucesso')
        expect(body).to.have.property('_id').and.not.be.empty

        produtos.excluir(body._id, adminToken)
      })
    })

    it('deve retornar 400 ao cadastrar produto com nome já existente', () => {
      const prodData = factory.produto()

      produtos.criar(prodData, adminToken).then(({ body: first }) => {
        produtos.criar(prodData, adminToken).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('message', 'Já existe produto com esse nome')

          produtos.excluir(first._id, adminToken)
        })
      })
    })
  })

  context('GET /produtos — Consulta e Filtros', () => {
    let testProduct

    before(() => {
      const prodData = factory.produto()
      produtos.criar(prodData, adminToken).then(({ body }) => {
        testProduct = { ...prodData, _id: body._id }
      })
    })

    after(() => {
      if (testProduct?._id) produtos.excluir(testProduct._id, adminToken)
    })

    it('deve listar produtos com estrutura de resposta correta', () => {
      produtos.listar().then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body).to.have.property('quantidade').and.be.a('number').and.be.gte(1)
        expect(body).to.have.property('produtos').and.be.an('array').and.not.be.empty

        const item = body.produtos[0]
        expect(item).to.have.all.keys('_id', 'nome', 'preco', 'descricao', 'quantidade')
      })
    })

    it('deve filtrar e retornar apenas o produto com o nome informado', () => {
      produtos.listar({ nome: testProduct.nome }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.quantidade).to.eq(1)
        expect(body.produtos[0]).to.include({
          _id: testProduct._id,
          nome: testProduct.nome,
          preco: testProduct.preco,
        })
      })
    })
  })

  context('PUT e DELETE /produtos — Atualização e Exclusão', () => {
    it('deve atualizar nome e preço do produto com sucesso', () => {
      const prodData = factory.produto()
      const updatedData = { ...prodData, nome: `Atualizado ${Date.now()}`, preco: 200 }

      produtos.criar(prodData, adminToken).then(({ body: created }) => {
        produtos.atualizar(created._id, updatedData, adminToken).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body).to.have.property('message', 'Registro alterado com sucesso')

          produtos.excluir(created._id, adminToken)
        })
      })
    })

    it('deve excluir produto existente com sucesso', () => {
      const prodData = factory.produto()

      produtos.criar(prodData, adminToken).then(({ body: created }) => {
        produtos.excluir(created._id, adminToken).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body).to.have.property('message', 'Registro excluído com sucesso')
        })
      })
    })
  })
})
