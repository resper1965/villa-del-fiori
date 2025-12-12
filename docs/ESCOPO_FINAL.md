# Escopo Final do Sistema - Gabi - Síndica Virtual

**Data**: 2025-01-09  
**Status**: Definitivo

## 🎯 Escopo Atual (MVP Implementado)

O sistema **Gabi - Síndica Virtual** é uma plataforma de **gestão documental e conhecimento** sobre processos condominiais.

### Funcionalidades Implementadas ✅

- ✅ Gestão de processos documentados
- ✅ Workflow de aprovação por stakeholders
- ✅ Versionamento e histórico
- ✅ CRUD de usuários e entidades
- ✅ Chat assistente (com RAG - em implementação)
- ✅ Base de conhecimento (em implementação)

## ❌ Nunca Fará Parte do Sistema

### 1. Controle de Acesso Físico
- ❌ Biometria (facial, digital)
- ❌ Sistemas de câmeras (CFTV)
- ❌ Controle remoto de portões/garagens
- ❌ Registro de acessos físicos
- ❌ Integração com sistemas de segurança física

### 2. Portaria Online Integrada
- ❌ Integração operacional com sistemas de portaria
- ❌ Autorização de visitantes via sistema
- ❌ Controle de entregas operacional
- ❌ Comunicação direta com portaria

**Justificativa**: O sistema foca em **documentação de processos**, não em operação de sistemas físicos ou integração com sistemas externos operacionais.

## 🔮 Possíveis Features Futuras

### 1. Acompanhamento Orçamentário (Módulo Financeiro)

**O que o sistema fará**:
- ✅ Previsão orçamentária anual
- ✅ Acompanhamento de execução orçamentária
- ✅ Comparativo orçado vs realizado
- ✅ Prestação de contas (relatórios)

**O que o sistema NÃO fará**:
- ❌ Gestão de contas a pagar (responsabilidade da administradora)
- ❌ Gestão de contas a receber (responsabilidade da administradora)
- ❌ Geração de boletos (responsabilidade da administradora)
- ❌ Controle de inadimplência (responsabilidade da administradora)

**Fluxo**: O sistema receberia informações da administradora e apenas **acompanharia** a execução orçamentária, não operaria financeiramente.

**Ver documento completo**: `docs/ESCOPO_FINANCEIRO.md`

### 2. Outras Features Futuras
- 🔮 Gestão operacional de manutenção predial
- 🔮 Sistema de reservas operacional de áreas comuns
- 🔮 Gestão operacional de pets e eventos
- 🔮 Sistema operacional de emergências

## 📝 Sobre a Categoria "Acesso e Segurança"

A categoria **"Acesso e Segurança"** pode existir no sistema para:
- ✅ **Documentar processos** sobre segurança, acesso, portaria
- ✅ **Registrar procedimentos** relacionados a segurança
- ✅ **Manter conhecimento** sobre políticas de segurança

Mas o sistema **NÃO**:
- ❌ Opera sistemas de segurança física
- ❌ Integra com câmeras ou biometria
- ❌ Controla acesso físico ao condomínio
- ❌ Integra com portaria online

**Resumo**: A categoria existe para **documentação**, não para **operação**.

## 🎯 Foco do Sistema

O sistema **Gabi - Síndica Virtual** é uma plataforma de **gestão documental e conhecimento** sobre processos condominiais, não uma plataforma de **operação condominial**.

### O Que o Sistema Faz
- ✅ Documenta processos
- ✅ Gerencia aprovação de processos
- ✅ Mantém base de conhecimento
- ✅ Responde perguntas sobre processos documentados
- 🔮 (Futuro) Acompanha execução orçamentária

### O Que o Sistema NÃO Faz
- ❌ Opera sistemas físicos
- ❌ Integra com sistemas externos operacionais
- ❌ Controla acesso físico
- ❌ Gerencia contas a pagar/receber
- ❌ Gera boletos
- ❌ Reserva áreas fisicamente

## 📚 Referências

- **Spec 001**: `specs/001-condominio-gestao-inteligente/spec.md`
- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
- **Roadmap**: `docs/ROADMAP.md`
- **Escopo Financeiro**: `docs/ESCOPO_FINANCEIRO.md`

