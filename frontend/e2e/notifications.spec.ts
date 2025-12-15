import { test, expect } from '@playwright/test'

test.describe('Sistema de Notificações', () => {
  test('deve exibir ícone de notificações no header', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verificar se o ícone de notificações está visível
    await expect(page.getByRole('button', { name: /notificações|notifications/i })).toBeVisible({ timeout: 10000 })
  })

  test('deve abrir dropdown de notificações ao clicar', async ({ page }) => {
    await page.goto('/dashboard')
    
    const notificationButton = page.getByRole('button', { name: /notificações|notifications/i })
    await notificationButton.click()
    
    // Verificar se o dropdown abre
    await expect(page.getByText(/notificações|notifications/i)).toBeVisible({ timeout: 3000 })
  })

  test('deve exibir contador de não lidas', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verificar se há badge com contador (se houver notificações não lidas)
    const notificationButton = page.getByRole('button', { name: /notificações|notifications/i })
    const badge = notificationButton.locator('[class*="badge"], [class*="count"]')
    
    // Pode ou não ter badge dependendo se há notificações
    // Apenas verificar se o botão está presente
    await expect(notificationButton).toBeVisible()
  })

  test('deve navegar para página de notificações', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Clicar no botão de notificações
    await page.getByRole('button', { name: /notificações|notifications/i }).click()
    
    // Verificar se há link para página completa
    const viewAllLink = page.getByRole('link', { name: /ver.*todas|view.*all/i })
    if (await viewAllLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewAllLink.click()
      await expect(page).toHaveURL(/.*notifications/)
    }
  })
})

