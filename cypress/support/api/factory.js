// Fábrica de dados de teste — gera payloads únicos por timestamp para evitar conflitos.
// Usar sobrescrita (overrides) para customizar campos específicos por teste.

export const factory = {
  usuario(overrides = {}) {
    const ts = Date.now()
    return {
      nome: `QA User ${ts}`,
      email: `qa${ts}@test.com`,
      password: 'Test@1234',
      administrador: 'false',
      ...overrides,
    }
  },

  adminUsuario(overrides = {}) {
    return factory.usuario({ administrador: 'true', ...overrides })
  },

  produto(overrides = {}) {
    const ts = Date.now()
    return {
      nome: `Produto API ${ts}`,
      preco: 99,
      descricao: `Produto criado por teste automatizado ${ts}`,
      quantidade: 50,
      ...overrides,
    }
  },
}
