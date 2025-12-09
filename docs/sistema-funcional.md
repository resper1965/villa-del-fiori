# Sistema de Gestão de Processos Condominiais

## O que é

Sistema web para criar, organizar, aprovar e publicar processos operacionais de condomínios. Permite que síndico, conselho e administradora revisem e aprovem cada processo antes de ser disponibilizado aos moradores.

---

## Funcionalidades

### 1. Catálogo de Processos

Todos os processos do condomínio organizados por categoria:

| Categoria | O que contém |
|-----------|--------------|
| **Governança** | Definição de processos, aprovações, emissão de documentos |
| **Acesso e Segurança** | Biometria, controle remoto, câmeras, visitantes, incidentes |
| **Operação** | Portaria online, limpeza, fornecedores, manutenções |
| **Áreas Comuns** | Escritório, academia, SPA, recreação, jardins, estacionamento |
| **Convivência** | Pets, silêncio, obras internas, uso de áreas |
| **Eventos** | Assembleias, manutenções programadas, festas, reservas |
| **Emergências** | Incêndio, gás, energia, elevador, segurança, médica, alagamentos |

Cada processo possui:
- Nome e descrição
- Etapas do workflow (passo a passo)
- Diagrama visual do fluxo
- Matriz RACI (quem é Responsável, Aprovador, Consultado, Informado)
- Entidades envolvidas (síndico, portaria, moradores, etc.)

---

### 2. Workflow de Aprovação

```
┌──────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
│ Rascunho │ ──▶ │ Em Revisão │ ──▶ │ Aprovado │ ──▶ │ Publicado │
└──────────┘     └────────────┘     └──────────┘     └───────────┘
                       │
                       ▼
                ┌───────────┐
                │ Rejeitado │ ──▶ (refazer e reenviar)
                └───────────┘
```

**Como funciona:**

1. **Criar** - Processo é criado como rascunho
2. **Enviar para revisão** - Stakeholders são notificados
3. **Revisar** - Cada stakeholder analisa o processo
4. **Aprovar ou Rejeitar**:
   - Se aprovado por todos: processo fica disponível
   - Se rejeitado: criador recebe motivo e pode corrigir

---

### 3. Aprovação

Stakeholders podem:
- ✅ **Aprovar** - com comentários opcionais
- ✅ **Aprovar com ressalvas** - aprovar mas solicitar ajustes menores
- ❌ **Rejeitar** - obrigatório informar o motivo

Ao rejeitar, o stakeholder explica:
- O que está errado
- O que precisa ser corrigido

---

### 4. Refazer Processo

Quando processo é rejeitado:

1. Criador vê os motivos de cada rejeição
2. Edita o processo para corrigir os problemas
3. Sistema cria nova versão (mantém histórico)
4. Reenvia para aprovação dos mesmos stakeholders

---

### 5. Gestão de Entidades

Cadastro de todas as pessoas e organizações envolvidas:

- **Pessoas**: Síndico, conselheiros, zelador, porteiros
- **Empresas**: Administradora, fornecedores, prestadores de serviço
- **Serviços de Emergência**: Bombeiros, polícia, SAMU
- **Infraestrutura**: Áreas comuns, equipamentos

---

### 6. Validação de Integridade

Sistema verifica automaticamente:
- Se todas as entidades mencionadas nos processos existem no cadastro
- Se entidades têm informações completas (contato, responsável)
- Quais processos têm problemas de referência

---

## Usuários do Sistema

| Perfil | O que faz |
|--------|-----------|
| **Síndico** | Cria processos, aprova, gerencia entidades |
| **Conselho** | Revisa e aprova processos de governança |
| **Administradora** | Revisa processos operacionais |
| **Editor** | Cria e edita processos (não aprova) |
| **Visualizador** | Apenas consulta processos aprovados |

---

## Telas Principais

1. **Lista de Processos** - Todos os processos com filtros por categoria e status
2. **Detalhes do Processo** - Conteúdo completo, diagrama, RACI, histórico
3. **Aprovações Pendentes** - Processos aguardando revisão do usuário
4. **Entidades** - Cadastro de pessoas e organizações
5. **Dashboard** - Visão geral com estatísticas

---

## Fluxo Típico de Uso

```
1. Síndico acessa o sistema
2. Abre processo de "Manutenção Preventiva de Elevadores"
3. Revisa conteúdo, diagrama e responsabilidades
4. Aprova o processo
5. Sistema notifica próximo aprovador (Conselho)
6. Conselho revisa e aprova
7. Processo fica disponível para consulta
```

---

## Status dos Processos

| Status | Significado |
|--------|-------------|
| 📝 **Rascunho** | Em elaboração, não enviado para aprovação |
| 🔄 **Em Revisão** | Aguardando aprovação dos stakeholders |
| ✅ **Aprovado** | Aprovado por todos, disponível para uso |
| ❌ **Rejeitado** | Rejeitado, aguardando correções |

---

*Sistema desenvolvido para padronizar e controlar os processos operacionais de condomínios através de workflow colaborativo de aprovação.*
