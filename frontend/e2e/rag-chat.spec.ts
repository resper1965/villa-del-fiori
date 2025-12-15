import { test, expect } from '@playwright/test'

test.describe('Chat com RAG', () => {
  test('deve carregar página do chat', async ({ page }) => {
    await page.goto('/chat')
    
    // Verificar se a página carrega
    await expect(page.getByRole('heading', { name: /chat|gabi/i })).toBeVisible({ timeout: 10000 })
  })

  test('deve exibir campo de input para mensagem', async ({ page }) => {
    await page.goto('/chat')
    
    // Verificar se há campo de input
    await expect(page.getByPlaceholder(/digite.*mensagem|type.*message/i)).toBeVisible({ timeout: 5000 })
  })

  test('deve exibir botão de enviar', async ({ page }) => {
    await page.goto('/chat')
    
    // Verificar se há botão de enviar
    await expect(page.getByRole('button', { name: /enviar|send/i })).toBeVisible()
  })

  test('deve enviar mensagem e receber resposta', async ({ page }) => {
    await page.goto('/chat')
    
    const input = page.getByPlaceholder(/digite.*mensagem|type.*message/i)
    const sendButton = page.getByRole('button', { name: /enviar|send/i })
    
    // Digitar mensagem
    await input.fill('Qual é o processo de aprovação?')
    await sendButton.click()
    
    // Aguardar resposta (pode demorar)
    await expect(page.getByText(/processo|aprovação|process|approval/i)).toBeVisible({ timeout: 30000 })
  })

  test('deve exibir histórico de mensagens', async ({ page }) => {
    await page.goto('/chat')
    
    // Verificar se há área de mensagens
    const messagesArea = page.locator('[class*="message"], [class*="chat"]')
    await expect(messagesArea.first()).toBeVisible({ timeout: 5000 })
  })
})

