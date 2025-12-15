import { test as base } from '@playwright/test'

// Fixture para autenticação
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // TODO: Implementar login automático
    // Por enquanto, apenas retorna a página
    // Em produção, você criaria um usuário de teste e faria login
    await use(page)
  },
})

export { expect } from '@playwright/test'

