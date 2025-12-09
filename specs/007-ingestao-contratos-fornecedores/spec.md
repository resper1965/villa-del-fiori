# Feature Specification: Ingestão de Contratos de Fornecedores com Geração Automática de Processos

**Feature Branch**: `007-ingestao-contratos-fornecedores`  
**Created**: 2024-12-09  
**Status**: Draft  
**Input**: User description: "Ingestão de contrato de fornecedores. Após a Ingestão uma IA irá ler e inferir quais processos o fornecedor de serviços fará, mapeará o processo, definirá as responsabilidades e gerará o processo obedecendo o template de processos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload e Ingestão de Contrato de Fornecedor (Priority: P1)

Administrador ou Síndico precisa fazer upload de contratos de fornecedores (PDF, DOC, DOCX) para o sistema. O sistema deve processar o documento, extrair texto e armazená-lo para análise pela IA.

**Why this priority**: Sem a capacidade de ingerir contratos, não há como a IA analisar e gerar processos. É o ponto de entrada obrigatório do fluxo.

**Independent Test**: Pode ser testado fazendo upload de diferentes tipos de arquivos (PDF, DOC, DOCX) e verificando se o texto é extraído corretamente. O valor entregue é digitalização de contratos físicos/digitais no sistema.

**Acceptance Scenarios**:

1. **Given** que usuário acessa página de contratos, **When** faz upload de PDF de contrato, **Then** sistema deve processar e extrair texto do documento em menos de 30 segundos
2. **Given** que contrato está em formato DOC/DOCX, **When** usuário faz upload, **Then** sistema deve converter e extrair texto corretamente
3. **Given** que contrato foi processado, **When** usuário visualiza, **Then** deve ver metadados extraídos (nome do fornecedor, data, tipo de serviço)
4. **Given** que documento não é suportado (ex: imagem sem OCR), **When** usuário tenta upload, **Then** sistema deve informar formatos suportados
5. **Given** que contrato é muito grande (>50MB), **When** usuário tenta upload, **Then** sistema deve informar limite de tamanho

---

### User Story 2 - Análise de Contrato por IA e Inferência de Processos (Priority: P1)

Após ingestão, IA deve analisar o contrato e inferir automaticamente quais processos o fornecedor executará baseado no escopo de serviços descritos no contrato.

**Why this priority**: A análise automática por IA é o diferencial da funcionalidade. Sem ela, o sistema seria apenas um repositório de documentos.

**Independent Test**: Pode ser testado enviando contratos de diferentes tipos de fornecedores (limpeza, manutenção, segurança) e verificando se processos corretos são sugeridos. O valor entregue é economia de tempo e padronização.

**Acceptance Scenarios**:

1. **Given** que contrato de empresa de limpeza foi ingerido, **When** IA analisa, **Then** deve sugerir processos da categoria "Operação" relacionados a limpeza (Limpeza de Áreas Comuns, Gestão de Materiais de Limpeza)
2. **Given** que contrato de empresa de manutenção de elevador foi ingerido, **When** IA analisa, **Then** deve sugerir processos de "Operação" e "Emergências" relacionados a elevadores
3. **Given** que contrato de portaria online foi ingerido, **When** IA analisa, **Then** deve sugerir processos de "Acesso e Segurança" e "Operação"
4. **Given** que IA identificou processos, **When** usuário visualiza sugestões, **Then** deve ver lista de processos com score de confiança e justificativa
5. **Given** que IA não consegue inferir processos, **When** usuário visualiza, **Then** deve ver mensagem indicando necessidade de revisão manual

---

### User Story 3 - Mapeamento de Processo com Workflow e Diagrama (Priority: P1)

Para cada processo inferido, IA deve mapear as etapas do workflow baseado nas cláusulas do contrato e gerar diagrama Mermaid com responsáveis.

**Why this priority**: O mapeamento do workflow é essencial para ter processos utilizáveis. Define "como" o trabalho será executado.

**Independent Test**: Pode ser testado verificando se workflows gerados têm etapas lógicas, sequenciais e alinhadas com o contrato. O valor entregue é processos documentados automaticamente.

**Acceptance Scenarios**:

1. **Given** que processo foi inferido do contrato, **When** IA mapeia workflow, **Then** deve gerar lista de etapas numeradas baseadas no escopo do contrato
2. **Given** que contrato especifica procedimentos, **When** IA mapeia, **Then** etapas devem refletir procedimentos descritos no contrato
3. **Given** que workflow foi gerado, **When** usuário visualiza, **Then** deve ver diagrama Mermaid com responsáveis em cada nó
4. **Given** que contrato não especifica procedimentos claros, **When** IA mapeia, **Then** deve usar template padrão da categoria e indicar "Baseado em template padrão"
5. **Given** que workflow foi gerado, **When** usuário edita, **Then** pode adicionar/remover/reordenar etapas antes de salvar

---

### User Story 4 - Definição de Responsabilidades (Matriz RACI) (Priority: P1)

IA deve definir automaticamente a matriz RACI (Responsible, Accountable, Consulted, Informed) para cada etapa do workflow, considerando entidades do sistema e cláusulas do contrato.

**Why this priority**: A matriz RACI define quem faz o quê. Sem ela, processos não têm responsabilidades claras e ficam inutilizáveis.

**Independent Test**: Pode ser testado verificando se cada etapa do workflow tem pelo menos Responsible e Accountable definidos. O valor entregue é clareza de responsabilidades.

**Acceptance Scenarios**:

1. **Given** que workflow foi mapeado, **When** IA define RACI, **Then** cada etapa deve ter pelo menos um Responsible definido
2. **Given** que contrato especifica fornecedor como executor, **When** IA define RACI, **Then** fornecedor deve ser Responsible nas etapas de execução
3. **Given** que processo é de Governança, **When** IA define RACI, **Then** Síndico deve ser Accountable
4. **Given** que matriz RACI foi gerada, **When** usuário visualiza, **Then** deve ver tabela com todas as responsabilidades por etapa
5. **Given** que entidade referenciada não existe no sistema, **When** IA define RACI, **Then** deve sugerir criação da entidade

---

### User Story 5 - Geração de Processo Seguindo Template (Priority: P1)

Sistema deve gerar o processo completo seguindo a estrutura do template de processos existente, incluindo todos os campos obrigatórios e formatação padrão.

**Why this priority**: Garante consistência com processos existentes e permite aproveitamento de toda a infraestrutura de aprovação/versionamento.

**Independent Test**: Pode ser testado verificando se processo gerado tem todos os campos do template preenchidos corretamente. O valor entregue é processos prontos para uso e aprovação.

**Acceptance Scenarios**:

1. **Given** que workflow e RACI foram definidos, **When** sistema gera processo, **Then** deve seguir estrutura do `process-template.ts`
2. **Given** que processo é gerado, **When** usuário visualiza, **Then** deve ver: id, name, category, icon, status, description, workflow, entities, variables, documentType, mermaid_diagram, raci
3. **Given** que processo é gerado, **When** sistema valida, **Then** deve garantir que todas as entidades existem no sistema (FR da spec 004)
4. **Given** que processo é gerado com status "rascunho", **When** usuário revisa, **Then** pode editar qualquer campo antes de enviar para aprovação
5. **Given** que usuário aprova sugestões da IA, **When** confirma geração, **Then** processo deve ser criado no sistema e visível na lista de processos

---

### User Story 6 - Vinculação de Contrato ao Fornecedor e Processos (Priority: P2)

Sistema deve vincular o contrato ao fornecedor (Entity do tipo empresa) e aos processos gerados, permitindo rastreabilidade completa.

**Why this priority**: Permite auditoria e rastreabilidade, sabendo exatamente de onde cada processo se originou.

**Independent Test**: Pode ser testado verificando se contrato, fornecedor e processos estão devidamente vinculados e navegáveis. O valor entregue é rastreabilidade e governança.

**Acceptance Scenarios**:

1. **Given** que contrato foi ingerido, **When** sistema identifica fornecedor, **Then** deve vincular a Entity existente ou sugerir criação
2. **Given** que processos foram gerados do contrato, **When** usuário visualiza contrato, **Then** deve ver lista de processos vinculados
3. **Given** que usuário visualiza processo gerado, **When** acessa detalhes, **Then** deve ver link para contrato de origem
4. **Given** que usuário visualiza fornecedor, **When** acessa processos, **Then** deve ver todos os processos onde fornecedor é responsável

---

### User Story 7 - Revisão e Aprovação de Processos Gerados (Priority: P2)

Processos gerados automaticamente devem passar pelo workflow de aprovação existente, permitindo que stakeholders revisem e ajustem antes da aprovação final.

**Why this priority**: Garante qualidade e validação humana dos processos gerados por IA antes de serem oficializados.

**Independent Test**: Pode ser testado gerando processo e verificando se segue fluxo normal de aprovação. O valor entregue é controle de qualidade.

**Acceptance Scenarios**:

1. **Given** que processo foi gerado, **When** usuário confirma, **Then** processo deve ser criado com status "rascunho"
2. **Given** que processo está em rascunho, **When** usuário envia para aprovação, **Then** deve seguir workflow de aprovação existente (spec 003)
3. **Given** que stakeholder revisa processo gerado, **When** encontra erros, **Then** pode rejeitar com motivo e processo retorna para correção
4. **Given** que processo é aprovado, **When** aprovação é concluída, **Then** processo fica disponível para uso

---

### User Story 8 - Dashboard de Contratos e Processos Gerados (Priority: P3)

Sistema deve exibir dashboard com visão geral de contratos ingeridos, processos gerados, status de aprovação e métricas de uso da IA.

**Why this priority**: Oferece visibilidade sobre eficiência da funcionalidade e status dos contratos/processos.

**Independent Test**: Pode ser testado verificando se dashboard exibe métricas corretas após ingestão de contratos. O valor entregue é visibilidade e governança.

**Acceptance Scenarios**:

1. **Given** que usuário acessa dashboard de contratos, **When** visualiza, **Then** deve ver: total de contratos, contratos processados, processos gerados, taxa de sucesso da IA
2. **Given** que contratos foram processados, **When** usuário filtra, **Then** deve poder filtrar por fornecedor, data, categoria de processo
3. **Given** que processos foram gerados, **When** usuário visualiza, **Then** deve ver status de aprovação de cada processo gerado
4. **Given** que IA sugeriu processos, **When** usuário analisa, **Then** deve ver taxa de aceitação das sugestões da IA

---

### Edge Cases

- O que acontece quando contrato tem múltiplos fornecedores mencionados?
- Como sistema lida com contratos em idiomas diferentes do português?
- O que acontece quando contrato menciona serviços que não se encaixam em nenhuma categoria existente?
- Como sistema lida com contratos que atualizam contratos anteriores (aditivos)?
- O que acontece quando IA infere processo que já existe no sistema?
- Como sistema lida com contratos que especificam responsabilidades diferentes do padrão do condomínio?
- O que acontece quando contrato é confidencial e não pode ser compartilhado com todos os stakeholders?
- Como sistema lida com contratos muito longos (>100 páginas)?
- O que acontece quando fornecedor no contrato não corresponde a nenhuma entidade cadastrada?
- Como sistema lida com processos inferidos que têm dependências de outros processos não gerados?

## Requirements *(mandatory)*

### Functional Requirements

#### Ingestão de Contratos
- **FR-001**: Sistema MUST aceitar upload de contratos nos formatos PDF, DOC, DOCX
- **FR-002**: Sistema MUST extrair texto de documentos PDF usando OCR quando necessário
- **FR-003**: Sistema MUST armazenar documento original e texto extraído
- **FR-004**: Sistema MUST extrair metadados básicos (nome do arquivo, tamanho, data de upload)
- **FR-005**: Sistema MUST validar tamanho máximo de arquivo (50MB)
- **FR-006**: Sistema MUST permitir adicionar metadados manuais (nome do fornecedor, vigência, tipo de contrato)
- **FR-007**: Sistema MUST manter histórico de versões de contratos (quando aditivos são adicionados)

#### Análise por IA
- **FR-008**: Sistema MUST analisar texto do contrato usando LLM (OpenAI GPT-4 ou similar)
- **FR-009**: Sistema MUST identificar fornecedor e tipo de serviço no contrato
- **FR-010**: Sistema MUST identificar escopo de serviços e responsabilidades no contrato
- **FR-011**: Sistema MUST mapear serviços identificados para categorias de processos existentes
- **FR-012**: Sistema MUST gerar score de confiança para cada processo inferido
- **FR-013**: Sistema MUST gerar justificativa textual para cada inferência
- **FR-014**: Sistema MUST permitir configuração de prompts de análise por categoria

#### Mapeamento de Workflow
- **FR-015**: Sistema MUST gerar etapas de workflow baseadas no escopo do contrato
- **FR-016**: Sistema MUST usar templates de workflow padrão quando contrato não especifica procedimentos
- **FR-017**: Sistema MUST gerar diagrama Mermaid com responsáveis indicados
- **FR-018**: Sistema MUST permitir edição manual do workflow antes de salvar
- **FR-019**: Sistema MUST validar sequência lógica de etapas

#### Definição de Responsabilidades
- **FR-020**: Sistema MUST gerar matriz RACI para cada etapa do workflow
- **FR-021**: Sistema MUST identificar fornecedor como Responsible nas etapas de execução
- **FR-022**: Sistema MUST definir Síndico como Accountable por padrão (exceto quando contrato especifica outro)
- **FR-023**: Sistema MUST validar que entidades da matriz RACI existem no sistema
- **FR-024**: Sistema MUST sugerir criação de entidades faltantes
- **FR-025**: Sistema MUST permitir edição manual da matriz RACI

#### Geração de Processo
- **FR-026**: Sistema MUST gerar processo seguindo estrutura do template de processos
- **FR-027**: Sistema MUST preencher todos os campos obrigatórios do template
- **FR-028**: Sistema MUST definir categoria correta baseada no tipo de serviço
- **FR-029**: Sistema MUST selecionar ícone apropriado para a categoria
- **FR-030**: Sistema MUST gerar descrição baseada no escopo do contrato
- **FR-031**: Sistema MUST identificar variáveis do sistema aplicáveis
- **FR-032**: Sistema MUST definir tipo de documento adequado (POP, Manual, etc.)
- **FR-033**: Sistema MUST criar processo com status "rascunho" inicialmente

#### Vinculação e Rastreabilidade
- **FR-034**: Sistema MUST vincular contrato à entidade fornecedor
- **FR-035**: Sistema MUST vincular processos gerados ao contrato de origem
- **FR-036**: Sistema MUST manter rastreabilidade bidirecional (contrato ↔ processos)
- **FR-037**: Sistema MUST registrar histórico de ações (upload, análise, geração)

#### Integração com Workflow de Aprovação
- **FR-038**: Sistema MUST submeter processos gerados ao workflow de aprovação existente
- **FR-039**: Sistema MUST permitir rejeição e correção de processos gerados
- **FR-040**: Sistema MUST notificar stakeholders sobre novos processos para revisão

### Key Entities

- **Contract**: Representa um contrato de fornecedor. Atributos: id, file_name, file_path, file_size, file_type, extracted_text, supplier_name, contract_type, start_date, end_date, status, created_by, created_at, updated_at. Relacionamentos: supplier (Entity), generated_processes (Process[]), history (ContractHistory[]).

- **ContractAnalysis**: Representa análise de contrato pela IA. Atributos: id, contract_id, analysis_status, identified_services, suggested_processes, confidence_scores, justifications, raw_response, created_at, processing_time. Relacionamentos: contract, suggested_processes.

- **SuggestedProcess**: Representa processo sugerido pela IA antes de confirmação. Atributos: id, analysis_id, process_category, process_name, description, workflow_steps, mermaid_diagram, raci_matrix, confidence_score, justification, is_accepted, accepted_by, accepted_at. Relacionamentos: analysis, generated_process (se aceito).

- **ContractHistory**: Representa evento no histórico de um contrato. Atributos: id, contract_id, event_type (uploaded, analyzed, process_generated, process_approved), event_data, user_id, created_at. Relacionamentos: contract, user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 80% dos contratos processados geram pelo menos uma sugestão de processo válida

- **SC-002**: Taxa de aceitação de sugestões da IA deve ser > 60% (indicando qualidade das inferências)

- **SC-003**: Tempo médio de processamento de contrato (upload + análise + sugestões) < 2 minutos

- **SC-004**: 100% dos processos gerados seguem estrutura do template e passam na validação de entidades

- **SC-005**: Redução de 70% no tempo de criação manual de processos para novos fornecedores

- **SC-006**: 95% dos contratos processados com sucesso (sem erros de extração ou análise)

- **SC-007**: 100% dos processos gerados são submetidos ao workflow de aprovação corretamente

- **SC-008**: Score de confiança médio das sugestões aceitas > 75%

## Assumptions

- Contratos são majoritariamente em português brasileiro
- LLM (GPT-4 ou similar) está disponível via API com limite de tokens adequado
- Contratos seguem formato relativamente padronizado com cláusulas de escopo
- Entidades básicas do condomínio já estão cadastradas no sistema
- Categorias de processos existentes cobrem a maioria dos serviços de fornecedores
- Templates de processos por categoria já estão definidos
- Usuários têm permissão para fazer upload de contratos
- Armazenamento de arquivos está disponível (S3 ou similar)

## Dependencies

- Sistema de cadastro de entidades (já existe - spec 004)
- Sistema de processos com template (já existe - spec 003)
- Workflow de aprovação (já existe - spec 003)
- Validação de entidades em processos (spec 004)
- API de LLM (OpenAI GPT-4 ou equivalente)
- Serviço de extração de texto de documentos (PyPDF, python-docx)
- Armazenamento de arquivos (S3 ou sistema local)

## Out of Scope

- Tradução automática de contratos em outros idiomas
- Reconhecimento de assinaturas ou carimbos
- Validação jurídica de cláusulas contratuais
- Integração com sistemas de ERP de fornecedores
- Gestão financeira de contratos (valores, pagamentos)
- Alertas de vencimento de contratos (pode ser feature futura)
- OCR avançado para documentos escaneados de baixa qualidade
- Análise de múltiplos contratos em lote
- Geração automática de aditivos contratuais
