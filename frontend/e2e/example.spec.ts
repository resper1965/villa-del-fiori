import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  
  // Verificar se a página carrega
  await expect(page).toHaveTitle(/Gabi|Síndica Virtual/i)
})

test('redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Deve redirecionar para login
  await expect(page).toHaveURL(/.*login/)
})

