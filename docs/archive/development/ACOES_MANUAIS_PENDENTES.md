# Ações Manuais Pendentes - Supabase Dashboard

**Data**: 2025-01-15  
**Status**: ⚠️ **NÃO APLICÁVEIS - Requerem Plano Pago**

---

## 📋 Resumo

Existem **2 ações manuais** identificadas pelos advisors, porém **não são aplicáveis no plano gratuito** do Supabase. Essas funcionalidades requerem upgrade para um plano pago.

**Nota**: O projeto está usando o plano **Free** do Supabase, que não inclui essas funcionalidades.

---

## ⚠️ Ação 1: Habilitar Leaked Password Protection

**Status**: 🔒 **REQUER PLANO PAGO** - Não disponível no plano Free

### O que é?
Proteção contra senhas vazadas. O Supabase verifica se a senha escolhida pelo usuário está na base de dados do HaveIBeenPwned.org (senhas comprometidas em vazamentos).

### Por que fazer?
- 🔒 Previne uso de senhas conhecidamente comprometidas
- 🛡️ Melhora a segurança geral do sistema
- ✅ Boa prática de segurança

### ⚠️ Limitação do Plano Free
Esta funcionalidade **não está disponível** no plano gratuito do Supabase. É necessário fazer upgrade para um plano pago (Pro ou superior).

### Como fazer:

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Navegue até o projeto**
   - Selecione o projeto: **Sindico Virtual** (obyrjbhomqtepebykavb)

3. **Vá para Authentication Settings**
   - Menu lateral: **Authentication** → **Settings**
   - Ou acesse diretamente: `Authentication` → `Settings`

4. **Encontre a seção "Password Security"**
   - Role a página até encontrar "Password Security"

5. **Habilite "Leaked password protection"**
   - Ative o toggle/switch para habilitar
   - Salve as alterações

### Link de Referência
📖 https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## ⚠️ Ação 2: Habilitar MFA Adicional

**Status**: 🔒 **REQUER PLANO PAGO** - Não disponível no plano Free

### O que é?
Multi-Factor Authentication (MFA) - Autenticação de múltiplos fatores. Adiciona uma camada extra de segurança além da senha.

### Por que fazer?
- 🔐 Adiciona camada extra de segurança
- 🛡️ Protege contra acesso não autorizado mesmo com senha comprometida
- ✅ Atende a boas práticas de segurança

### ⚠️ Limitação do Plano Free
Esta funcionalidade **não está disponível** no plano gratuito do Supabase. É necessário fazer upgrade para um plano pago (Pro ou superior).

### Como fazer:

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Navegue até o projeto**
   - Selecione o projeto: **Sindico Virtual** (obyrjbhomqtepebykavb)

3. **Vá para Authentication Settings**
   - Menu lateral: **Authentication** → **Settings**
   - Ou acesse diretamente: `Authentication` → `Settings`

4. **Encontre a seção "Multi-Factor Authentication"**
   - Role a página até encontrar "Multi-Factor Authentication" ou "MFA"

5. **Habilite métodos MFA adicionais**
   - **TOTP (Time-based One-Time Password)**: Recomendado
     - Usuários podem usar apps como Google Authenticator, Authy, etc.
   - **SMS**: Opcional (pode ter custos)
   - **Email**: Opcional
   - Ative os métodos desejados
   - Salve as alterações

### Link de Referência
📖 https://supabase.com/docs/guides/auth/auth-mfa

---

## 📊 Status das Ações

| Ação | Status | Plano Necessário | Observação |
|------|--------|------------------|------------|
| Leaked Password Protection | 🔒 Requer Plano Pago | Pro ou superior | Não disponível no Free |
| MFA Adicional | 🔒 Requer Plano Pago | Pro ou superior | Não disponível no Free |

**Plano Atual**: Free  
**Ações Aplicáveis**: Nenhuma (todas requerem upgrade)

---

## 🔍 Como Verificar se Foi Aplicado

### Verificar Leaked Password Protection:
1. No Dashboard, vá em **Authentication** → **Settings**
2. Verifique se "Leaked password protection" está **habilitado** (toggle ON)

### Verificar MFA:
1. No Dashboard, vá em **Authentication** → **Settings**
2. Verifique se métodos MFA estão **habilitados** (TOTP, SMS, etc.)

---

## ⚠️ Observações Importantes

1. **Leaked Password Protection**:
   - Não afeta usuários existentes
   - Apenas valida senhas em novos cadastros/alterações
   - Pode rejeitar senhas comuns que foram vazadas

2. **MFA**:
   - Usuários precisarão configurar MFA no primeiro login após habilitação
   - Recomenda-se comunicar aos usuários sobre a mudança
   - TOTP é o método mais seguro e recomendado

---

## 📝 Checklist

- [x] ~~Ação 1: Habilitar Leaked Password Protection~~ ⚠️ **Não aplicável - Requer plano pago**
- [x] ~~Ação 2: Habilitar MFA Adicional~~ ⚠️ **Não aplicável - Requer plano pago**

### Quando Fazer Upgrade (Futuro)

Se no futuro decidir fazer upgrade para um plano pago:
- [ ] Fazer upgrade do plano Supabase (Pro ou superior)
- [ ] Habilitar Leaked Password Protection
- [ ] Habilitar MFA Adicional (TOTP recomendado)
- [ ] Verificar se ambas as configurações foram salvas
- [ ] (Opcional) Testar criação de novo usuário para validar Leaked Password Protection
- [ ] (Opcional) Testar configuração de MFA em uma conta de teste

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas ou problemas ao realizar essas ações:

1. Consulte a documentação oficial do Supabase nos links fornecidos
2. Verifique se você tem permissões de administrador no projeto
3. Entre em contato com o suporte do Supabase se necessário

