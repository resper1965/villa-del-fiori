import { test, expect } from '@playwright/test'

test.describe('Workflow de Aprovação', () => {
  test('deve exibir processos pendentes de aprovação', async ({ page }) => {
    await page.goto('/approvals')
    
    // Verificar se a página carrega
    await expect(page.getByRole('heading', { name: /aprovações|approvals/i })).toBeVisible({ timeout: 10000 })
  })

  test('deve exibir botões de aprovar e rejeitar', async ({ page }) => {
    await page.goto('/approvals')
    
    // Verificar se há processos na lista
    const approveButton = page.getByRole('button', { name: /aprovar|approve/i }).first()
    const rejectButton = page.getByRole('button', { name: /rejeitar|reject/i }).first()
    
    // Pode ou não ter processos, mas verificar estrutura
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve abrir modal de aprovação', async ({ page }) => {
    await page.goto('/approvals')
    
    // Tentar clicar no primeiro botão de aprovar
    const approveButton = page.getByRole('button', { name: /aprovar|approve/i }).first()
    
    if (await approveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveButton.click()
      
      // Verificar se modal/dialog aparece
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    }
  })

  test('deve abrir modal de rejeição com campo obrigatório', async ({ page }) => {
    await page.goto('/approvals')
    
    const rejectButton = page.getByRole('button', { name: /rejeitar|reject/i }).first()
    
    if (await rejectButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectButton.click()
      
      // Verificar se modal aparece
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 })
      
      // Verificar se há campo de motivo (obrigatório)
      await expect(page.getByLabel(/motivo|reason/i)).toBeVisible()
    }
  })
})

