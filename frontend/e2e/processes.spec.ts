import { test, expect } from '@playwright/test'

test.describe('Gestão de Processos', () => {
  // Helper para fazer login
  async function login(page: any, email: string, password: string) {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/senha|password/i).fill(password)
    await page.getByRole('button', { name: /entrar|login/i }).click()
    await page.waitForURL(/.*dashboard/, { timeout: 10000 })
  }

  test('deve listar processos', async ({ page }) => {
    // Assumindo que há um usuário de teste configurado
    // TODO: Configurar usuário de teste ou usar fixtures
    await page.goto('/processes')
    
    // Verificar se a página carrega
    await expect(page.getByRole('heading', { name: /processos/i })).toBeVisible({ timeout: 10000 })
  })

  test('deve exibir botão de novo processo', async ({ page }) => {
    await page.goto('/processes')
    
    await expect(page.getByRole('button', { name: /novo.*processo|new.*process/i })).toBeVisible()
  })

  test('deve abrir formulário de novo processo', async ({ page }) => {
    await page.goto('/processes')
    await page.getByRole('button', { name: /novo.*processo|new.*process/i }).click()
    
    // Verificar se o formulário aparece
    await expect(page.getByLabel(/nome|name/i)).toBeVisible({ timeout: 5000 })
  })

  test('deve validar campos obrigatórios no formulário', async ({ page }) => {
    await page.goto('/processes')
    await page.getByRole('button', { name: /novo.*processo|new.*process/i }).click()
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /salvar|save/i }).click()
    
    // Deve mostrar erros de validação
    await expect(page.getByText(/obrigatório|required/i).first()).toBeVisible({ timeout: 3000 })
  })
})

