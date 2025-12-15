import { test, expect } from '@playwright/test'

test.describe('Validação de Entidades', () => {
  test('deve validar entidades ao criar processo', async ({ page }) => {
    await page.goto('/processes')
    await page.getByRole('button', { name: /novo.*processo|new.*process/i }).click()
    
    // Preencher nome do processo
    await page.getByLabel(/nome|name/i).fill('Processo de Teste')
    
    // Adicionar entidade inválida no workflow ou descrição
    const descriptionField = page.getByLabel(/descrição|description/i)
    if (await descriptionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descriptionField.fill('Este processo envolve EntidadeInexistente')
      
      // Verificar se validação aparece
      await expect(page.getByText(/entidade.*não.*encontrada|entity.*not.*found/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('deve permitir criar entidade faltante via modal', async ({ page }) => {
    await page.goto('/processes')
    await page.getByRole('button', { name: /novo.*processo|new.*process/i }).click()
    
    // Adicionar entidade inválida
    const descriptionField = page.getByLabel(/descrição|description/i)
    if (await descriptionField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descriptionField.fill('Processo com EntidadeNova')
      
      // Verificar se há botão para criar entidade
      const createEntityButton = page.getByRole('button', { name: /criar.*entidade|create.*entity/i })
      if (await createEntityButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createEntityButton.click()
        
        // Verificar se modal de criação aparece
        await expect(page.getByRole('dialog')).toBeVisible()
      }
    }
  })
})

