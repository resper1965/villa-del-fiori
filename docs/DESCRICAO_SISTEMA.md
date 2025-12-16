# Descrição do Sistema - Gabi - Síndica Virtual

**Versão**: 1.0  
**Última Atualização**: 2025-01-15

---

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
- ❌ **NÃO gerencia** finanças operacionalmente

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
7. **Documentos Gerais**: Upload e indexação de regulamentos, convenções, atas, etc.

## 📋 Funcionalidades Principais

### 1. Gestão de Processos Documentados

O sistema permite criar, editar e gerenciar processos condominiais documentados com:

- **Estrutura Completa**: Nome, categoria, descrição, workflow, entidades envolvidas, variáveis, diagrama Mermaid, matriz RACI
- **Categorias**: Governança, Operação, Áreas Comuns, Convivência, Eventos, Emergências
- **Versionamento**: Histórico completo de versões com rastreabilidade
- **Status**: Rascunho, Em Revisão, Aprovado, Rejeitado
- **35 Processos Pré-cadastrados**: Processos comuns já documentados e prontos para uso

### 2. Workflow de Aprovação

Sistema completo de aprovação por stakeholders:

- **Envio para Aprovação**: Processos em rascunho podem ser enviados para revisão
- **Aprovação/Rejeição**: Stakeholders autorizados podem aprovar ou rejeitar
- **Feedback Estruturado**: Rejeições exigem motivo obrigatório
- **Refazer Processos**: Criadores podem refazer processos baseado em feedback
- **Rastreabilidade**: Histórico completo de todas as aprovações e rejeições

### 3. Base de Conhecimento e RAG

Sistema de base de conhecimento com busca semântica:

- **Ingestão Automática**: Processos aprovados são automaticamente ingeridos na base
- **Chunking Inteligente**: Processos são divididos em chunks lógicos
- **Embeddings**: Cada chunk recebe embedding vetorial para busca semântica
- **Busca Híbrida**: Combina busca vetorial e full-text search
- **RAG**: Retrieval-Augmented Generation para respostas precisas

### 4. Chat Assistente Inteligente

Chat com a Gabi (Síndica Virtual) que:

- **Responde Perguntas**: Baseado em processos aprovados na base de conhecimento
- **Busca Semântica**: Encontra processos relevantes mesmo sem correspondência exata
- **Citações**: Inclui referências aos processos usados como fonte
- **Contexto**: Usa RAG para gerar respostas precisas e contextualizadas

### 5. Gestão de Entidades

Cadastro e gestão de entidades envolvidas nos processos:

- **Tipos**: Pessoas, Empresas, Serviços de Emergência, Infraestrutura
- **Informações Completas**: Contatos, endereços, CNPJ, descrições
- **Relacionamentos**: Entidades podem ser referenciadas em processos

### 6. Sistema de Usuários e RBAC

Autenticação e autorização robusta:

- **Autenticação**: Supabase Auth
- **Aprovação de Usuários**: Novos usuários precisam ser aprovados
- **RBAC**: Roles (admin, syndic, subsindico, council, staff, resident)
- **CRUD Completo**: Criar, editar, aprovar, deletar usuários

### 7. Gestão de Condomínio (Mono-Tenant)

Sistema mono-tenant que gerencia um único condomínio:

- **Cadastro Obrigatório**: Setup inicial obrigatório do condomínio
- **Apenas Um Ativo**: Constraint de banco garante apenas um condomínio ativo
- **Exibição no Dashboard**: Nome e informações do condomínio sempre visíveis

### 8. Gestão de Unidades, Veículos e Pets

- **Unidades**: Cadastro de apartamentos/casas do condomínio
- **Veículos**: Cadastro de veículos dos moradores (marca, modelo, placa)
- **Pets**: Cadastro de animais de estimação

### 9. Documentos Gerais

Sistema de upload e indexação de documentos:

- **Tipos**: Regulamentos, Convenções, Atas, Assembleias, Editais, Comunicados
- **Upload de Arquivos**: Suporte a PDF, DOCX, TXT, MD
- **Extração Automática**: Conteúdo extraído automaticamente de arquivos
- **Indexação**: Documentos são indexados na base de conhecimento

## 🎯 Categorias de Processos

Os processos são organizados nas seguintes categorias:

1. **Governança**: Processos relacionados à gestão, assembleias, decisões
2. **Operação**: Processos operacionais do dia a dia
3. **Áreas Comuns**: Processos sobre uso e gestão de áreas comuns
4. **Convivência**: Processos de convivência entre moradores
5. **Eventos**: Processos sobre eventos do condomínio
6. **Emergências**: Processos de emergência e procedimentos de segurança

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
- **Documentos Gerais**: admin, syndic, subsindico

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

### 5. Upload de Documentos

**Ator**: Admin, Síndico, Subsíndico

**Fluxo**:
1. Acessar página de Documentos
2. Fazer upload de arquivo (PDF, DOCX, TXT, MD) ou colar conteúdo
3. Preencher informações (título, tipo, categoria)
4. Salvar documento
5. Documento é automaticamente indexado na base de conhecimento

## 🔧 Tecnologias e Integrações

### Backend (Supabase)

- **PostgreSQL**: Banco de dados relacional
- **Auth**: Autenticação e autorização
- **Storage**: Armazenamento de arquivos
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

---

**Última Atualização**: 2025-01-15
