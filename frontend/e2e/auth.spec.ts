import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('deve exibir formulário de login', async ({ page }) => {
    // Verificar elementos do formulário
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha|password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible()
  })

  test('deve validar campos obrigatórios', async ({ page }) => {
    // Tentar submeter sem preencher
    await page.getByRole('button', { name: /entrar|login/i }).click()
    
    // Deve mostrar mensagens de erro
    await expect(page.getByText(/email.*obrigatório|required/i)).toBeVisible()
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.getByLabel(/email/i).fill('teste@exemplo.com')
    await page.getByLabel(/senha|password/i).fill('senha_incorreta')
    await page.getByRole('button', { name: /entrar|login/i }).click()
    
    // Deve mostrar mensagem de erro
    await expect(page.getByText(/credenciais.*inválidas|invalid.*credentials/i)).toBeVisible({ timeout: 5000 })
  })

  test('deve redirecionar para registro', async ({ page }) => {
    await page.getByRole('link', { name: /criar.*conta|register|cadastrar/i }).click()
    
    await expect(page).toHaveURL(/.*register|.*cadastro/)
  })
})

