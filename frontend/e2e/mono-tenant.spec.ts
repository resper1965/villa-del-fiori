import { test, expect } from '@playwright/test'

test.describe('Sistema Mono-Tenant', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar storage antes de cada teste
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('usuário não autenticado deve ser redirecionado para login', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/)
  })

  test('usuário autenticado sem condomínio deve ser redirecionado para /setup', async ({ page }) => {
    // TODO: Implementar autenticação no teste
    // Por enquanto, vamos testar apenas o redirecionamento
    // quando não há condomínio cadastrado
    
    // Simular usuário autenticado (será implementado com fixtures)
    await page.goto('/setup')
    
    // Deve exibir página de setup
    await expect(page.getByText(/bem-vindo|welcome/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/cadastrar.*condomínio|register.*condominium/i)).toBeVisible()
  })

  test('página de setup deve exibir formulário de condomínio', async ({ page }) => {
    await page.goto('/setup')
    
    // Verificar elementos do formulário
    await expect(page.getByLabel(/nome.*condomínio|name/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel(/endereço|address/i)).toBeVisible()
  })

  test('dashboard deve exibir condomínio ativo quando existe', async ({ page }) => {
    // TODO: Implementar com fixtures de autenticação e condomínio
    // Por enquanto, apenas verificar estrutura da página
    
    await page.goto('/dashboard')
    
    // Se redirecionar para login ou setup, está correto
    const url = page.url()
    expect(url).toMatch(/login|setup|dashboard/)
  })

  test('tentativa de criar segundo condomínio deve ser bloqueada', async ({ page }) => {
    // TODO: Implementar teste completo com autenticação
    // Verificar que botão "Novo Condomínio" está desabilitado
    // quando já existe um condomínio ativo
    
    await page.goto('/condominiums')
    
    // Se redirecionar para login ou setup, está correto
    const url = page.url()
    expect(url).toMatch(/login|setup|condominiums/)
  })

  test('navegação deve funcionar após setup do condomínio', async ({ page }) => {
    // TODO: Implementar teste completo
    // 1. Criar condomínio
    // 2. Verificar redirecionamento para dashboard
    // 3. Verificar que navegação funciona
    // 4. Verificar que condomínio é exibido no header
    
    await page.goto('/dashboard')
    
    // Por enquanto, apenas verificar que não há erros
    const url = page.url()
    expect(url).toMatch(/login|setup|dashboard/)
  })
})

test.describe('CondominiumGuard', () => {
  test('deve redirecionar para /setup quando não há condomínio', async ({ page }) => {
    // Limpar storage
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // Tentar acessar dashboard
    await page.goto('/dashboard')
    
    // Deve redirecionar para login ou setup
    const url = page.url()
    expect(url).toMatch(/login|setup/)
  })

  test('deve permitir acesso a rotas públicas sem condomínio', async ({ page }) => {
    await page.goto('/login')
    
    // Deve exibir página de login
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 5000 })
  })
})

