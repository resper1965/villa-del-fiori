# Feature Specification: Ingestão de Contratos de Fornecedores

**Feature Branch**: `007-ingestao-contratos-fornecedores`  
**Created**: 2024-12-09  
**Status**: Draft

## Resumo Executivo

Sistema que permite upload de contratos de fornecedores (PDF, DOC, DOCX) e utiliza Inteligência Artificial (GPT-4) para automaticamente:

1. **Identificar** o fornecedor e tipo de serviço
2. **Inferir** quais processos operacionais são necessários
3. **Mapear** o workflow de cada processo com etapas detalhadas
4. **Definir** responsabilidades através da matriz RACI
5. **Gerar** processos seguindo o template padrão do sistema

## User Stories

### US-1: Upload de Contrato (P1)

**Como** Síndico ou Administrador  
**Quero** fazer upload de um contrato de fornecedor  
**Para** que o sistema extraia e analise automaticamente o conteúdo

**Critérios de Aceite**:
- Upload de PDF, DOC, DOCX até 50MB
- Extração automática de texto em < 30 segundos
- Formulário para metadados opcionais (número, datas, tipo)
- Feedback visual de progresso

---

### US-2: Análise por IA (P1)

**Como** Síndico ou Administrador  
**Quero** que a IA analise o contrato automaticamente  
**Para** identificar quais processos devo criar

**Critérios de Aceite**:
- Identificação do fornecedor com score de confiança
- Lista de serviços identificados no contrato
- Sugestão de processos por categoria
- Justificativa para cada sugestão

---

### US-3: Mapeamento de Workflow (P1)

**Como** Síndico ou Administrador  
**Quero** ver o workflow sugerido para cada processo  
**Para** entender as etapas antes de aprovar

**Critérios de Aceite**:
- Etapas numeradas e descritivas
- Diagrama visual (Mermaid) com responsáveis
- Possibilidade de editar antes de aceitar
- Templates de fallback por categoria

---

### US-4: Matriz RACI (P1)

**Como** Síndico ou Administrador  
**Quero** ver as responsabilidades definidas pela IA  
**Para** garantir que estão corretas antes de gerar

**Critérios de Aceite**:
- RACI definido para cada etapa do workflow
- Validação de entidades existentes no sistema
- Indicação de entidades faltantes
- Possibilidade de criar entidades inline

---

### US-5: Geração de Processo (P1)

**Como** Síndico ou Administrador  
**Quero** gerar processos a partir das sugestões aceitas  
**Para** tê-los prontos para aprovação no sistema

**Critérios de Aceite**:
- Processo criado seguindo template existente
- Todos os campos obrigatórios preenchidos
- Status inicial "rascunho"
- Vínculo com contrato de origem

---

### US-6: Rastreabilidade (P2)

**Como** Síndico ou Administrador  
**Quero** navegar entre contrato e processos gerados  
**Para** ter rastreabilidade completa

**Critérios de Aceite**:
- Link do processo para contrato de origem
- Link do contrato para processos gerados
- Timeline de eventos do contrato
- Badge "Gerado por IA" nos processos

---

### US-7: Dashboard de Contratos (P3)

**Como** Síndico ou Administrador  
**Quero** ver métricas de contratos e IA  
**Para** acompanhar a eficiência do sistema

**Critérios de Aceite**:
- Total de contratos por status
- Taxa de aceitação de sugestões
- Processos gerados por categoria
- Tempo médio de processamento

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| FR-001 | Aceitar upload de PDF, DOC, DOCX | P1 |
| FR-002 | Extrair texto de documentos automaticamente | P1 |
| FR-003 | Analisar contrato com GPT-4 | P1 |
| FR-004 | Identificar fornecedor e serviços | P1 |
| FR-005 | Sugerir processos com score de confiança | P1 |
| FR-006 | Gerar workflow com etapas | P1 |
| FR-007 | Gerar diagrama Mermaid | P1 |
| FR-008 | Gerar matriz RACI | P1 |
| FR-009 | Validar entidades existentes | P1 |
| FR-010 | Gerar processo seguindo template | P1 |
| FR-011 | Vincular processo ao contrato | P2 |
| FR-012 | Registrar histórico de eventos | P2 |
| FR-013 | Exibir dashboard de métricas | P3 |

## Requisitos Não-Funcionais

| ID | Requisito | Meta |
|----|-----------|------|
| NFR-001 | Tempo de extração de texto | < 30 segundos |
| NFR-002 | Tempo de análise por IA | < 2 minutos |
| NFR-003 | Taxa de sucesso de extração | > 95% |
| NFR-004 | Score médio de confiança | > 75% |
| NFR-005 | Taxa de aceitação de sugestões | > 60% |

## Critérios de Sucesso

1. **80%** dos contratos geram pelo menos uma sugestão válida
2. **60%** das sugestões são aceitas pelos usuários
3. **95%** de redução no tempo de criação de processos
4. **100%** dos processos gerados passam na validação de entidades

## Dependências

- Spec 003: Sistema de Processos e Aprovação
- Spec 004: Validação de Entidades
- API OpenAI (GPT-4)
- Storage de arquivos (S3/MinIO)

## Fora do Escopo

- Tradução de contratos em outros idiomas
- OCR avançado para documentos escaneados
- Análise de múltiplos contratos em lote
- Alertas de vencimento de contratos
- Gestão financeira de contratos
