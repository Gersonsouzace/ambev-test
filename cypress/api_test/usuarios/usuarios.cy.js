import { auth, usuarios } from '../../support/api/requests'
import { factory } from '../../support/api/factory'

/**
 * Cenário 1 — Autenticação e Gerenciamento de Usuários
 *
 * Cobre o contrato HTTP completo dos endpoints /login e /usuarios:
 * autenticação, criação, consulta com filtro, atualização e exclusão.
 *
 * Estratégia de dados:
 *  - Usuários criados via POST /usuarios na própria asserção ou no before().
 *  - Limpeza garantida em after() e no final de cada test inline.
 */
describe('API — Autenticação e Usuários', () => {
  // ─── Contexto 1: POST /login ────────────────────────────────────────────────

  context('POST /login', () => {
    let user

    before(() => {
      const userData = factory.usuario()
      usuarios.criar(userData).then(({ body }) => {
        user = { ...userData, _id: body._id }
      })
    })

    after(() => {
      if (user?._id) usuarios.excluir(user._id)
    })

    it('deve autenticar com credenciais válidas e retornar token JWT', () => {
      auth.login(user.email, user.password).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body).to.have.property('message', 'Login realizado com sucesso')
        expect(body).to.have.property('authorization')
        expect(body.authorization).to.match(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/)
      })
    })

    it('deve retornar 401 para email ou senha inválidos', () => {
      auth.login('usuario.invalido@qa.com', 'senha_errada').then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body).to.have.property('message', 'Email e/ou senha inválidos')
      })
    })

    it('deve retornar 400 para campos obrigatórios ausentes no login', () => {
      auth.loginPayload({}).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.have.property('email', 'email é obrigatório')
        expect(body).to.have.property('password', 'password é obrigatório')
      })
    })
  })

  // ─── Contexto 2: POST /usuarios ─────────────────────────────────────────────

  context('POST /usuarios — Criação', () => {
    it('deve criar usuário com dados válidos e retornar _id', () => {
      const userData = factory.usuario()

      usuarios.criar(userData).then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body).to.have.property('message', 'Cadastro realizado com sucesso')
        expect(body).to.have.property('_id').and.not.be.empty

        usuarios.excluir(body._id)
      })
    })

    it('deve retornar 400 para todos os campos obrigatórios ausentes', () => {
      usuarios.criar({}).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.have.property('nome', 'nome é obrigatório')
        expect(body).to.have.property('email', 'email é obrigatório')
        expect(body).to.have.property('password', 'password é obrigatório')
        expect(body).to.have.property('administrador', 'administrador é obrigatório')
      })
    })

    it('deve retornar 400 ao tentar cadastrar email já existente', () => {
      const userData = factory.usuario()

      usuarios.criar(userData).then(({ body: first }) => {
        usuarios.criar({ ...userData, nome: 'Outro Nome' }).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.have.property('message', 'Este email já está sendo usado')

          usuarios.excluir(first._id)
        })
      })
    })
  })

  // ─── Contexto 3: GET + PUT + DELETE /usuarios ───────────────────────────────

  context('GET /usuarios — Consulta e Filtros', () => {
    let testUser

    before(() => {
      const userData = factory.usuario()
      usuarios.criar(userData).then(({ body }) => {
        testUser = { ...userData, _id: body._id }
      })
    })

    after(() => {
      if (testUser?._id) usuarios.excluir(testUser._id)
    })

    it('deve listar usuários com estrutura de resposta correta', () => {
      usuarios.listar().then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body).to.have.property('quantidade').and.be.a('number').and.be.gte(1)
        expect(body).to.have.property('usuarios').and.be.an('array').and.not.be.empty
        expect(body.usuarios[0]).to.have.all.keys('_id', 'nome', 'email', 'password', 'administrador')
      })
    })

    it('deve filtrar e retornar apenas o usuário com o email informado', () => {
      usuarios.listar({ email: testUser.email }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.quantidade).to.eq(1)
        expect(body.usuarios[0]).to.include({ email: testUser.email, nome: testUser.nome })
      })
    })
  })

  context('PUT e DELETE /usuarios — Edição e Exclusão', () => {
    it('deve atualizar nome do usuário com sucesso', () => {
      const userData = factory.usuario()
      const updatedNome = `Atualizado ${Date.now()}`

      usuarios.criar(userData).then(({ body: created }) => {
        usuarios
          .atualizar(created._id, { ...userData, nome: updatedNome })
          .then(({ status, body }) => {
            expect(status).to.eq(200)
            expect(body).to.have.property('message', 'Registro alterado com sucesso')

            usuarios.excluir(created._id)
          })
      })
    })

    it('deve excluir usuário existente com sucesso', () => {
      const userData = factory.usuario()

      usuarios.criar(userData).then(({ body: created }) => {
        usuarios.excluir(created._id).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body).to.have.property('message', 'Registro excluído com sucesso')
        })
      })
    })
  })
})
