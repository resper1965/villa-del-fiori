# Descrição do Sistema - Gabi - Síndica Virtual

**Versão**: 1.0  
**Data**: 2025-01-09

## 🎯 Visão Geral

**Gabi - Síndica Virtual** é uma plataforma web de **gestão documental e conhecimento** sobre processos condominiais. O sistema permite que stakeholders (síndico, conselho, administradora) documentem, revisem, aprovem e consultem processos operacionais, administrativos e de convivência do condomínio.

## 🎯 Propósito do Sistema

O sistema é uma plataforma de **documentação e conhecimento**, não uma plataforma de **operação condominial**. Ele:

- ✅ **Documenta** processos condominiais de forma estruturada
- ✅ **Gerencia** workflow de aprovação de processos
- ✅ **Mantém** base de conhecimento sobre processos aprovados
- ✅ **Responde** perguntas sobre processos via chat assistente inteligente
- ❌ **NÃO opera** sistemas físicos (segurança, portaria, etc.)
- ❌ **NÃO integra** com sistemas externos operacionais
- ❌ **NÃO gerencia** finanças operacionalmente (apenas acompanhamento orçamentário, se implementado no futuro)

## 🏗️ Arquitetura

### Stack Tecnológica

- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Tables**: TanStack Table (@tanstack/react-table)
- **Deploy**: Vercel (frontend), Supabase (backend)

### Componentes Principais

1. **Sistema de Processos**: Documentação estruturada de processos condominiais
2. **Workflow de Aprovação**: Sistema de revisão e aprovação por stakeholders
3. **Base de Conhecimento**: Armazenamento indexado de processos aprovados com embeddings
4. **Chat Assistente (RAG)**: Chat inteligente que responde perguntas baseado em processos aprovados
5. **Gestão de Entidades**: Cadastro de pessoas, empresas, serviços e infraestrutura
6. **Sistema de Usuários**: Autenticação e autorização com RBAC

## 📋 Funcionalidades Principais

### 1. Gestão de Processos Documentados ✅

O sistema permite criar, editar e gerenciar processos condominiais documentados com:

- **Estrutura Completa**: Nome, categoria, descrição, workflow, entidades envolvidas, variáveis, diagrama Mermaid, matriz RACI
- **Categorias**: Governança, Operação, Áreas Comuns, Convivência, Eventos, Emergências
- **Versionamento**: Histórico completo de versões com rastreabilidade
- **Status**: Rascunho, Em Revisão, Aprovado, Rejeitado

### 2. Workflow de Aprovação ✅

Sistema completo de aprovação por stakeholders:

- **Envio para Aprovação**: Processos em rascunho podem ser enviados para revisão
- **Aprovação/Rejeição**: Stakeholders autorizados podem aprovar ou rejeitar
- **Feedback Estruturado**: Rejeições exigem motivo obrigatório
- **Refazer Processos**: Criadores podem refazer processos baseado em feedback
- **Rastreabilidade**: Histórico completo de todas as aprovações e rejeições

### 3. Base de Conhecimento e RAG ✅ (Em Implementação)

Sistema de base de conhecimento com busca semântica:

- **Ingestão Automática**: Processos aprovados são automaticamente ingeridos na base
- **Chunking Inteligente**: Processos são divididos em chunks lógicos
- **Embeddings**: Cada chunk recebe embedding vetorial para busca semântica
- **Busca Híbrida**: Combina busca vetorial e full-text search
- **RAG**: Retrieval-Augmented Generation para respostas precisas

### 4. Chat Assistente Inteligente ✅ (Em Implementação)

Chat com a Gabi (Síndica Virtual) que:

- **Responde Perguntas**: Baseado em processos aprovados na base de conhecimento
- **Busca Semântica**: Encontra processos relevantes mesmo sem correspondência exata
- **Citações**: Inclui referências aos processos usados como fonte
- **Contexto**: Usa RAG para gerar respostas precisas e contextualizadas

### 5. Gestão de Entidades ✅

Cadastro e gestão de entidades envolvidas nos processos:

- **Tipos**: Pessoas, Empresas, Serviços de Emergência, Infraestrutura
- **Informações Completas**: Contatos, endereços, CNPJ, descrições
- **Relacionamentos**: Entidades podem ser referenciadas em processos
- **Entidade do Condomínio**: Cadastro completo do condomínio (CNPJ, endereço, etc.)

### 6. Sistema de Usuários e RBAC ✅

Autenticação e autorização robusta:

- **Autenticação**: Supabase Auth
- **Aprovação de Usuários**: Novos usuários precisam ser aprovados
- **RBAC**: Roles (admin, syndic, subsindico, council, staff, resident)
- **CRUD Completo**: Criar, editar, aprovar, deletar usuários

## 🎯 Categorias de Processos

Os processos são organizados nas seguintes categorias:

1. **Governança**: Processos relacionados à gestão, assembleias, decisões
2. **Operação**: Processos operacionais do dia a dia
3. **Áreas Comuns**: Processos sobre uso e gestão de áreas comuns
4. **Convivência**: Processos de convivência entre moradores
5. **Eventos**: Processos sobre eventos do condomínio
6. **Emergências**: Processos de emergência e procedimentos de segurança

**Nota**: A categoria "Acesso e Segurança" pode existir para documentar processos sobre esses temas, mas o sistema **não opera** sistemas de segurança física ou portaria online.

## 🔐 Sistema de Permissões (RBAC)

### Roles Disponíveis

- **admin**: Administrador da aplicação (acesso total)
- **syndic**: Síndico (pode aprovar processos e usuários)
- **subsindico**: Subsíndico (pode aprovar processos e usuários)
- **council**: Conselheiro (pode aprovar processos)
- **staff**: Staff/Administradora (pode aprovar processos)
- **resident**: Morador (apenas acesso ao chat)

### Permissões por Role

- **Dashboard e Processos**: admin, syndic, subsindico, council, staff
- **Aprovar Usuários**: admin, syndic, subsindico
- **Chat**: Todos os roles (incluindo resident)
- **Gestão de Entidades**: admin, syndic, subsindico, council, staff

## 📊 Estado Atual

### Implementado ✅

- ✅ Sistema completo de gestão de processos
- ✅ Workflow de aprovação
- ✅ Versionamento e histórico
- ✅ CRUD de usuários e entidades
- ✅ 35 processos pré-cadastrados
- ✅ Interface de chat
- ✅ Base de conhecimento (infraestrutura criada)
- ✅ RAG system (infraestrutura criada)

### Em Implementação ⚠️

- ⚠️ Integração completa do chat com RAG (backend pronto, precisa configurar API keys)
- ⚠️ Ingestão de processos existentes (quando houver processos aprovados)

### Planejado 🔮

- 🔮 Validação de entidades em processos
- 🔮 Ingestão de contratos de fornecedores
- 🔮 Acompanhamento orçamentário (módulo futuro)

## ❌ O Que o Sistema NÃO Faz

### Nunca Fará Parte

1. **Controle de Acesso Físico**
   - Biometria, câmeras, sistemas de segurança física
   - Controle remoto de portões/garagens
   - Registro de acessos físicos

2. **Portaria Online Integrada**
   - Integração operacional com sistemas de portaria
   - Autorização de visitantes via sistema
   - Controle de entregas operacional

### Não Faz (Mas Pode Fazer no Futuro)

1. **Gestão Operacional Financeira**
   - Contas a pagar/receber (responsabilidade da administradora)
   - Geração de boletos (responsabilidade da administradora)
   - Controle de inadimplência (responsabilidade da administradora)

2. **Operação de Sistemas Físicos**
   - Reservas operacionais de áreas comuns
   - Gestão operacional de manutenção
   - Operação de sistemas de emergência

**Nota**: O sistema pode **acompanhar** execução orçamentária no futuro, mas não gerencia finanças operacionalmente.

## 🎯 Casos de Uso Principais

### 1. Documentar Processo

**Ator**: Síndico, Conselheiro, Staff

**Fluxo**:
1. Criar novo processo
2. Preencher informações (nome, categoria, descrição, workflow, etc.)
3. Salvar como rascunho
4. Editar e refinar
5. Enviar para aprovação

### 2. Aprovar Processo

**Ator**: Stakeholder autorizado (Síndico, Conselho, etc.)

**Fluxo**:
1. Visualizar processo em revisão
2. Revisar conteúdo
3. Aprovar ou rejeitar (com motivo se rejeitar)
4. Processo aprovado é automaticamente ingerido na base de conhecimento

### 3. Consultar Processo via Chat

**Ator**: Morador, Stakeholder

**Fluxo**:
1. Acessar chat
2. Fazer pergunta sobre processo/procedimento
3. Sistema busca na base de conhecimento
4. Resposta é gerada baseada em processos aprovados
5. Referências aos processos são incluídas

### 4. Gerenciar Usuários

**Ator**: Administrador, Síndico

**Fluxo**:
1. Visualizar usuários pendentes de aprovação
2. Aprovar ou rejeitar
3. Criar novos usuários
4. Editar informações de usuários existentes

## 📊 Métricas e Estatísticas

O sistema fornece:

- Total de processos cadastrados
- Processos aprovados vs em revisão
- Taxa de aprovação
- Histórico de versões
- Status de ingestão na base de conhecimento

## 🔧 Tecnologias e Integrações

### Backend (Supabase)

- **PostgreSQL**: Banco de dados relacional
- **Auth**: Autenticação e autorização
- **Storage**: Armazenamento de arquivos (se necessário)
- **Edge Functions**: Funções serverless (RAG, embeddings, ingestão)
- **pgvector**: Extensão para busca vetorial

### Frontend (Next.js)

- **App Router**: Roteamento moderno do Next.js 14
- **React Query**: Gerenciamento de estado server-side
- **TanStack Table**: Tabelas avançadas e filtros
- **shadcn/ui**: Componentes de UI modernos
- **Tailwind CSS**: Estilização

### Integrações Externas

- **OpenAI API**: Geração de embeddings e respostas do chat (GPT-4o-mini)
- **Supabase**: Backend completo (banco, auth, functions)

## 🚀 Deploy

- **Frontend**: Vercel (deploy automático)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Base de Conhecimento**: Supabase (pgvector)

## 📚 Documentação Adicional

- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
- **Roadmap**: `docs/ROADMAP.md`
- **Escopo Final**: `docs/ESCOPO_FINAL.md`
- **Escopo Financeiro**: `docs/ESCOPO_FINANCEIRO.md`
- **Quickstart**: `specs/003-app-gestao-processos-aprovacao/quickstart.md`

