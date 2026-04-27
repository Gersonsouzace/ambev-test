import { auth, usuarios, produtos, carrinhos } from '../../support/api/requests'
import { factory } from '../../support/api/factory'

/**
 * Cenário 3 — Carrinho de Compras
 *
 * Cobre o ciclo de vida completo do carrinho:
 * criação, regras de negócio (duplicidade, estoque, produto inexistente)
 * e finalização (concluir ou cancelar a compra).
 *
 * Estratégia de dados:
 *  - Admin e produto de estoque fixo criados uma única vez em before().
 *  - afterEach() cancela o carrinho para garantir isolamento entre testes.
 *  - Produto com estoque limitado criado inline nos testes de estoque.
 */
describe('API — Carrinho de Compras', () => {
  let admin
  let adminToken
  let stockProduct

  before(() => {
    const adminData = factory.adminUsuario()

    usuarios.criar(adminData).then(({ body }) => {
      admin = { ...adminData, _id: body._id }

      auth.login(adminData.email, adminData.password).then(({ body }) => {
        adminToken = body.authorization

        const prodData = factory.produto({ quantidade: 10 })
        produtos.criar(prodData, adminToken).then(({ body }) => {
          stockProduct = { ...prodData, _id: body._id }
        })
      })
    })
  })

  afterEach(() => {
    if (adminToken) {
      carrinhos.cancelarCompra(adminToken)
    }
  })

  after(() => {
    if (stockProduct?._id) produtos.excluir(stockProduct._id, adminToken)
    if (admin?._id) usuarios.excluir(admin._id)
  })

  // ─── Contexto 1: GET /carrinhos ─────────────────────────────────────────────

  context('GET /carrinhos — Listagem', () => {
    it('deve retornar lista de carrinhos com estrutura de resposta correta', () => {
      carrinhos.listar().then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body).to.have.property('quantidade').and.be.a('number')
        expect(body).to.have.property('carrinhos').and.be.an('array')

        if (body.carrinhos.length > 0) {
          const cart = body.carrinhos[0]
          expect(cart).to.have.all.keys('_id', 'idUsuario', 'produtos', 'precoTotal', 'quantidadeTotal')
          expect(cart.produtos).to.be.an('array')
          expect(cart.produtos[0]).to.have.all.keys('idProduto', 'quantidade', 'precoUnitario')
        }
      })
    })

    it('deve retornar lista vazia ao filtrar por idUsuario inexistente', () => {
      carrinhos.listar({ idUsuario: 'id_inexistente_000' }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.quantidade).to.eq(0)
        expect(body.carrinhos).to.be.an('array').and.be.empty
      })
    })
  })

  // ─── Contexto 2: POST /carrinhos — Criação e Validações ─────────────────────

  context('POST /carrinhos — Criação e Regras de Negócio', () => {
    it('deve criar carrinho com produto válido e retornar _id', () => {
      const payload = { produtos: [{ idProduto: stockProduct._id, quantidade: 2 }] }

      carrinhos.criar(payload, adminToken).then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body).to.have.property('message', 'Cadastro realizado com sucesso')
        expect(body).to.have.property('_id').and.not.be.empty
      })
    })

    it('deve retornar 400 ao tentar criar segundo carrinho para o mesmo usuário', () => {
      const payload = { produtos: [{ idProduto: stockProduct._id, quantidade: 1 }] }

      carrinhos.criar(payload, adminToken).then(({ status: firstStatus }) => {
        expect(firstStatus).to.eq(201)

        carrinhos.criar(payload, adminToken).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('message', 'Não é permitido ter mais de 1 carrinho')
        })
      })
    })

    it('deve retornar 400 ao adicionar produto inexistente ao carrinho', () => {
      const payload = { produtos: [{ idProduto: 'produto_id_invalido_000', quantidade: 1 }] }

      carrinhos.criar(payload, adminToken).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.have.property('message', 'Produto não encontrado')
      })
    })

    it('deve retornar 400 ao solicitar quantidade maior que o estoque disponível', () => {
      // Cria produto com estoque mínimo para garantir controle do cenário
      const limitedProd = factory.produto({ quantidade: 1 })

      produtos.criar(limitedProd, adminToken).then(({ body: created }) => {
        const payload = { produtos: [{ idProduto: created._id, quantidade: 999 }] }

        carrinhos.criar(payload, adminToken).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('message', 'Produto não possui quantidade suficiente')
          expect(body).to.have.property('item').and.include({
            idProduto: created._id,
            quantidade: 999,
            quantidadeEstoque: 1,
          })

          produtos.excluir(created._id, adminToken)
        })
      })
    })
  })

  // ─── Contexto 3: DELETE /carrinhos — Fluxo de Compra ────────────────────────

  context('DELETE /carrinhos — Finalização de Compra', () => {
    it('deve concluir compra com sucesso e remover carrinho', () => {
      const payload = { produtos: [{ idProduto: stockProduct._id, quantidade: 1 }] }

      carrinhos.criar(payload, adminToken).then(({ status }) => {
        expect(status).to.eq(201)

        carrinhos.concluirCompra(adminToken).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body.message).to.contain('Registro excluído com sucesso')
        })
      })
    })

    it('deve cancelar compra, remover carrinho e reabastecer estoque do produto', () => {
      const payload = { produtos: [{ idProduto: stockProduct._id, quantidade: 3 }] }

      carrinhos.criar(payload, adminToken).then(({ status }) => {
        expect(status).to.eq(201)

        carrinhos.cancelarCompra(adminToken).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body).to.have.property(
            'message',
            'Registro excluído com sucesso. Estoque dos produtos reabastecido'
          )
        })
      })
    })
  })
})
