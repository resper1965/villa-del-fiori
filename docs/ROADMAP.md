# Roadmap - Gabi - Síndica Virtual

**Última Atualização**: 2025-01-09  
**Status Atual**: MVP Implementado ✅

## 📊 Visão Geral

Este roadmap apresenta as próximas features e melhorias planejadas para o sistema Gabi - Síndica Virtual, priorizadas por impacto e dependências.

## ✅ Concluído (MVP)

- [x] Sistema de gestão de processos documentados
- [x] Workflow de aprovação por stakeholders
- [x] Versionamento e histórico de processos
- [x] CRUD completo de usuários
- [x] Sistema de autenticação e RBAC
- [x] Gestão de entidades
- [x] Interface de chat básica
- [x] Dashboard com métricas
- [x] 35 processos pré-cadastrados

## 🚀 Próximas Features (Prioridade Alta)

### 1. Base de Conhecimento e RAG (Spec 005) 🔴 CRÍTICO

**Status**: ⚠️ Pendente  
**Prioridade**: P0 - Crítico  
**Estimativa**: 2-3 semanas

**Descrição**: Implementar base de conhecimento para ingestão automática de processos aprovados e sistema RAG (Retrieval-Augmented Generation) para busca semântica.

**Funcionalidades**:
- Ingestão automática de processos aprovados
- Vector database para embeddings
- Busca semântica na base de conhecimento
- Pipeline de indexação e atualização

**Dependências**: 
- Sistema de processos (✅ já existe)
- Vector database (Pinecone, Weaviate, ou pgvector)
- Embeddings model (OpenAI, ou modelo open-source)

**Impacto**: **Crítico** - Necessário para o chat funcionar completamente

**Tarefas**:
- [ ] Escolher e configurar vector database
- [ ] Implementar pipeline de ingestão de processos
- [ ] Criar sistema de embeddings
- [ ] Implementar busca semântica
- [ ] Testes e validação

---

### 2. Chatbot Inteligente Completo (Spec 006) 🔴 CRÍTICO

**Status**: ⚠️ Parcialmente Implementado (interface pronta)  
**Prioridade**: P0 - Crítico  
**Estimativa**: 1-2 semanas (após Spec 005)

**Descrição**: Completar integração do chat com RAG e LLM para respostas baseadas em processos aprovados.

**Funcionalidades**:
- Integração com RAG da Spec 005
- Integração com LLM (OpenAI GPT-4, Claude, ou modelo local)
- Respostas baseadas em processos aprovados
- Referências aos processos usados como fonte
- Perguntas frequentes e sugestões

**Dependências**: 
- Spec 005 (Base de Conhecimento) ⚠️
- LLM API (OpenAI, Anthropic, ou modelo local)

**Impacto**: **Crítico** - Completa a funcionalidade principal do chat

**Tarefas**:
- [ ] Integrar chat com RAG system
- [ ] Integrar com LLM API
- [ ] Implementar geração de respostas com contexto
- [ ] Adicionar citações de processos
- [ ] Implementar perguntas frequentes
- [ ] Testes e validação

---

### 3. Validação de Entidades em Processos (Spec 004) 🟡 IMPORTANTE

**Status**: ⚠️ Pendente  
**Prioridade**: P1 - Importante  
**Estimativa**: 1 semana

**Descrição**: Validar que todas as entidades mencionadas em processos existem e estão completas antes de permitir salvamento.

**Funcionalidades**:
- Validação automática de entidades ao criar/editar processo
- Validação em lote de processos existentes
- Sugestão e criação rápida de entidades faltantes
- Dashboard de integridade de entidades

**Dependências**: 
- Sistema de processos (✅ já existe)
- Sistema de entidades (✅ já existe)

**Impacto**: **Importante** - Melhora qualidade dos dados e garante integridade

**Tarefas**:
- [ ] Implementar validação de entidades no backend
- [ ] Adicionar validação em tempo real no frontend
- [ ] Criar modal de criação rápida de entidades
- [ ] Implementar validação em lote
- [ ] Criar dashboard de integridade
- [ ] Testes e validação

---

## 📋 Features Futuras (Prioridade Média)

### 4. Ingestão de Contratos de Fornecedores (Spec 007) 🟢 FUTURO

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Futuro  
**Estimativa**: 3-4 semanas

**Descrição**: Sistema para ingerir contratos de fornecedores e gerar automaticamente processos baseados na análise por IA.

**Funcionalidades**:
- Upload e processamento de contratos (PDF, DOC, DOCX)
- Análise de contratos por IA (LLM)
- Inferência automática de processos
- Geração automática de workflow e RACI
- Vinculação de contratos a fornecedores e processos

**Dependências**: 
- Spec 004 (Validação de Entidades) ⚠️
- Spec 005 (Base de Conhecimento) ⚠️
- LLM API
- Serviço de extração de texto

**Impacto**: **Futuro** - Funcionalidade avançada que automatiza criação de processos

**Tarefas**:
- [ ] Implementar upload de contratos
- [ ] Criar pipeline de extração de texto
- [ ] Implementar análise por IA
- [ ] Gerar processos automaticamente
- [ ] Vincular contratos a fornecedores
- [ ] Testes e validação

---

### 5. Notificações e Alertas 🟢 MELHORIA

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Melhoria  
**Estimativa**: 1 semana

**Descrição**: Sistema de notificações para alertar stakeholders sobre processos pendentes de aprovação, aprovações/rejeições, etc.

**Funcionalidades**:
- Notificações quando processo é enviado para aprovação
- Notificações quando processo é aprovado/rejeitado
- Notificações de processos pendentes
- Preferências de notificação por usuário

**Dependências**: 
- Sistema de processos (✅ já existe)
- Sistema de autenticação (✅ já existe)

**Impacto**: **Melhoria** - Melhora experiência do usuário e agiliza workflow

**Tarefas**:
- [ ] Implementar sistema de notificações
- [ ] Criar templates de notificações
- [ ] Adicionar preferências de usuário
- [ ] Integrar com email (opcional)
- [ ] Testes e validação

---

### 6. Comentários e Discussões em Processos 🟢 MELHORIA

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Melhoria  
**Estimativa**: 1 semana

**Descrição**: Permitir comentários e discussões em processos para facilitar colaboração durante revisão.

**Funcionalidades**:
- Comentários em processos
- Discussões por seção/etapa
- Menções de usuários
- Histórico de comentários

**Dependências**: 
- Sistema de processos (✅ já existe)
- Sistema de autenticação (✅ já existe)

**Impacto**: **Melhoria** - Facilita colaboração e comunicação

**Tarefas**:
- [ ] Criar schema de comentários
- [ ] Implementar API de comentários
- [ ] Criar interface de comentários
- [ ] Adicionar menções de usuários
- [ ] Testes e validação

---

## 🔧 Melhorias Técnicas

### 7. Performance e Otimização

**Status**: ⚠️ Contínuo  
**Prioridade**: P2 - Melhoria

**Tarefas**:
- [ ] Otimizar queries do banco de dados
- [ ] Implementar cache de processos
- [ ] Otimizar carregamento de páginas
- [ ] Implementar paginação eficiente
- [ ] Otimizar busca de processos

### 8. Testes e Qualidade

**Status**: ⚠️ Pendente  
**Prioridade**: P2 - Melhoria

**Tarefas**:
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Adicionar testes E2E
- [ ] Implementar CI/CD
- [ ] Adicionar monitoramento e logging

### 9. Documentação

**Status**: ⚠️ Em Progresso  
**Prioridade**: P2 - Melhoria

**Tarefas**:
- [x] Documentar estado atual do projeto
- [x] Atualizar especificações
- [ ] Criar guia de contribuição
- [ ] Documentar APIs
- [ ] Criar tutoriais em vídeo

---

## 📅 Timeline Estimado

### Q1 2025 (Janeiro - Março)

**Semana 1-3**: Base de Conhecimento e RAG (Spec 005)  
**Semana 4-5**: Chatbot Inteligente Completo (Spec 006)  
**Semana 6**: Validação de Entidades (Spec 004)  
**Semana 7-8**: Notificações e Melhorias

### Q2 2025 (Abril - Junho)

**Mês 1-2**: Ingestão de Contratos (Spec 007)  
**Mês 3**: Melhorias Técnicas e Performance

---

## 🎯 Métricas de Sucesso

### Para Spec 005 (Base de Conhecimento)
- ✅ 100% dos processos aprovados são ingeridos automaticamente
- ✅ Busca semântica retorna resultados relevantes em < 1s
- ✅ Recall > 80% para queries relevantes

### Para Spec 006 (Chatbot)
- ✅ Respostas baseadas em processos em > 90% dos casos
- ✅ Tempo de resposta < 3s
- ✅ Taxa de satisfação > 80%

### Para Spec 004 (Validação)
- ✅ 100% dos processos validados antes de salvamento
- ✅ 0 processos com entidades faltantes após validação

---

## 🔄 Revisão do Roadmap

Este roadmap será revisado mensalmente e atualizado conforme:
- Progresso das features
- Feedback dos usuários
- Mudanças de prioridades
- Novas necessidades identificadas

**Próxima Revisão**: 2025-02-09

---

## 📝 Notas

- Prioridades podem mudar baseado em feedback e necessidades
- Estimativas são aproximadas e podem variar
- Features podem ser adicionadas ou removidas conforme necessário
- Dependências entre features devem ser respeitadas

---

## 🔗 Referências

- **Estado Atual**: `docs/ESTADO_ATUAL_PROJETO.md`
- **Specs**: `specs/`
- **README**: `README.md`





