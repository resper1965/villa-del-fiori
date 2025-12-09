# Feature Specification: Ingestão de Contratos de Fornecedores com IA

**Feature Branch**: `007-ingestao-contratos-fornecedores`  
**Created**: 2024-12-08  
**Status**: Draft  
**Input**: User description: "Sistema de ingestão de contratos de fornecedores. Após a ingestão, uma IA irá ler e inferir quais processos o fornecedor de serviços fará, mapeará o processo, definirá as responsabilidades e gerará o processo obedecendo o template de processos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload de Contrato de Fornecedor (Priority: P1)

Administradores e síndicos precisam fazer upload de contratos de fornecedores (PDF, DOCX, TXT) para que o sistema possa processar e gerar processos automaticamente.

**Why this priority**: Upload é o ponto de entrada do sistema. Sem capacidade de receber contratos, não há como processar e gerar processos. É fundamental para o funcionamento básico.

**Independent Test**: Pode ser testado fazendo upload de diferentes formatos de arquivo, verificando se são aceitos, armazenados corretamente e se status é atualizado. O valor entregue é capacidade de ingerir contratos no sistema.

**Acceptance Scenarios**:

1. **Given** que administrador acessa página de ingestão de contratos, **When** seleciona arquivo PDF/DOCX/TXT, **Then** sistema deve permitir upload e exibir progresso
2. **Given** que arquivo é muito grande (>10MB), **When** usuário tenta fazer upload, **Then** sistema deve rejeitar e informar limite de tamanho
3. **Given** que arquivo é de formato não suportado, **When** usuário tenta fazer upload, **Then** sistema deve rejeitar e informar formatos aceitos
4. **Given** que upload é bem-sucedido, **When** arquivo é processado, **Then** sistema deve exibir status "uploaded" e permitir iniciar processamento
5. **Given** que múltiplos contratos são enviados, **When** administrador visualiza lista, **Then** deve ver todos os contratos com status, data de upload e fornecedor

---

### User Story 2 - Processamento Automático com IA (Priority: P1)

Sistema deve processar contratos automaticamente usando IA para extrair informações, identificar serviços e mapear processos relacionados.

**Why this priority**: Processamento automático é o coração da funcionalidade. Sem IA analisando contratos, não há geração automática de processos. É o diferencial principal do sistema.

**Independent Test**: Pode ser testado enviando contrato para processamento e verificando se IA identifica serviços corretamente, extrai informações e mapeia processos. O valor entregue é automação inteligente.

**Acceptance Scenarios**:

1. **Given** que contrato foi enviado, **When** administrador inicia processamento, **Then** sistema deve iniciar análise com IA e exibir status "processing"
2. **Given** que IA está analisando contrato, **When** processamento ocorre, **Then** sistema deve extrair texto, identificar fornecedor e serviços prestados
3. **Given** que serviços são identificados, **When** IA analisa, **Then** deve mapear cada serviço para processos condominiais relacionados
4. **Given** que processamento completa, **When** resultado é gerado, **Then** sistema deve exibir análise completa com serviços identificados e processos sugeridos
5. **Given** que processamento falha, **When** erro ocorre, **Then** sistema deve registrar erro, atualizar status para "error" e permitir reprocessamento

---

### User Story 3 - Geração Automática de Processos (Priority: P1)

Sistema deve gerar processos completos automaticamente baseado na análise do contrato, seguindo o template de processos do sistema.

**Why this priority**: Geração automática é o objetivo principal. Processos gerados devem seguir template existente para integração perfeita com sistema de aprovação. Sem isso, funcionalidade não entrega valor.

**Independent Test**: Pode ser testado processando contrato e verificando se processos gerados têm workflow completo, RACI definido, diagrama Mermaid e seguem template. O valor entregue é criação automática de processos estruturados.

**Acceptance Scenarios**:

1. **Given** que análise do contrato identificou serviços, **When** sistema gera processos, **Then** deve criar processos completos com workflow, entidades, variáveis e diagrama Mermaid
2. **Given** que processo é gerado, **When** criado, **Then** deve seguir template de processos: nome, categoria, descrição, workflow numerado, entidades, variáveis
3. **Given** que processo é gerado, **When** criado, **Then** deve incluir matriz RACI completa com responsáveis, aprovadores, consultados e informados para cada etapa
4. **Given** que processo é gerado, **When** criado, **Then** deve incluir diagrama Mermaid com responsáveis indicados em cada nó e cores apropriadas
5. **Given** que processos são gerados, **When** criados, **Then** devem ter status "rascunho" e estar prontos para revisão e aprovação
6. **Given** que fornecedor não existe como entidade, **When** processo é gerado, **Then** sistema deve criar entidade do fornecedor automaticamente

---

### User Story 4 - Revisão e Ajuste de Processos Gerados (Priority: P1)

Administradores precisam revisar processos gerados automaticamente, fazer ajustes quando necessário e aprovar para envio ao workflow de aprovação.

**Why this priority**: Processos gerados automaticamente podem precisar ajustes. Revisão manual é essencial para garantir qualidade antes de enviar para aprovação. Sem isso, processos incorretos podem entrar no workflow.

**Independent Test**: Pode ser testado revisando processo gerado, editando campos, verificando se mudanças são salvas e se processo pode ser enviado para aprovação. O valor entregue é controle de qualidade.

**Acceptance Scenarios**:

1. **Given** que processos foram gerados automaticamente, **When** administrador acessa lista, **Then** deve ver processos com indicador "auto-gerado" e opção de revisar
2. **Given** que administrador revisa processo gerado, **When** visualiza, **Then** deve ver análise do contrato que originou o processo e score de confiança
3. **Given** que processo precisa ajustes, **When** administrador edita, **Then** sistema deve permitir edição completa mantendo histórico de geração automática
4. **Given** que processo está correto, **When** administrador aprova revisão, **Then** processo deve ser enviado para workflow de aprovação padrão
5. **Given** que processo está incorreto, **When** administrador rejeita, **Then** processo deve ser marcado e administrador pode solicitar reprocessamento do contrato

---

### User Story 5 - Visualização de Análise do Contrato (Priority: P2)

Administradores precisam visualizar análise completa do contrato realizada pela IA para entender como processos foram gerados e validar mapeamentos.

**Why this priority**: Transparência na análise ajuda a validar qualidade da geração e entender decisões da IA. Importante para confiança no sistema.

**Independent Test**: Pode ser testado visualizando análise de contrato processado e verificando se informações extraídas estão corretas e completas. O valor entregue é transparência e validação.

**Acceptance Scenarios**:

1. **Given** que contrato foi processado, **When** administrador visualiza análise, **Then** deve ver informações do fornecedor, serviços identificados e processos mapeados
2. **Given** que análise é visualizada, **When** exibida, **Then** deve mostrar texto extraído do contrato, responsabilidades identificadas e prazos importantes
3. **Given** que processos foram mapeados, **When** análise é visualizada, **Then** deve mostrar score de confiança para cada mapeamento e explicação do motivo
4. **Given** que múltiplos serviços foram identificados, **When** análise é visualizada, **Then** deve permitir navegar entre serviços e ver processos relacionados a cada um

---

### User Story 6 - Histórico e Rastreabilidade (Priority: P2)

Sistema deve manter histórico completo de contratos processados, processos gerados e logs de geração para auditoria e rastreabilidade.

**Why this priority**: Histórico permite rastrear origem de processos, entender decisões da IA e auditar gerações. Importante para compliance e melhoria contínua.

**Independent Test**: Pode ser testado verificando se histórico de processamento é mantido, se logs de IA são registrados e se é possível rastrear processo até contrato original. O valor entregue é rastreabilidade e auditoria.

**Acceptance Scenarios**:

1. **Given** que contrato foi processado, **When** histórico é consultado, **Then** deve mostrar data de processamento, modelo de IA usado, tokens consumidos e tempo de execução
2. **Given** que processo foi gerado automaticamente, **When** histórico é consultado, **Then** deve mostrar contrato de origem, análise que gerou o processo e prompts usados
3. **Given** que processo foi editado após geração, **When** histórico é consultado, **Then** deve mostrar versão original gerada e mudanças feitas manualmente
4. **Given** que múltiplos contratos foram processados, **When** histórico é consultado, **Then** deve permitir filtrar por fornecedor, data, status e exportar relatório

---

## Requirements *(mandatory)*

### Functional Requirements

#### Upload e Armazenamento
- **FR-001**: Sistema MUST aceitar upload de arquivos PDF, DOCX e TXT
- **FR-002**: Sistema MUST validar tamanho máximo de arquivo (10MB recomendado)
- **FR-003**: Sistema MUST validar formato de arquivo antes de aceitar upload
- **FR-004**: Sistema MUST armazenar arquivo original de forma segura
- **FR-005**: Sistema MUST registrar metadados do arquivo (nome, tamanho, tipo, data de upload)
- **FR-006**: Sistema MUST associar contrato a fornecedor (nome pode ser extraído ou informado)
- **FR-007**: Sistema MUST permitir upload de múltiplos contratos
- **FR-008**: Sistema MUST exibir lista de contratos com status e informações básicas

#### Extração de Texto
- **FR-009**: Sistema MUST extrair texto de arquivos PDF
- **FR-010**: Sistema MUST extrair texto de arquivos DOCX
- **FR-011**: Sistema MUST extrair texto de arquivos TXT
- **FR-012**: Sistema MUST lidar com PDFs escaneados usando OCR (opcional)
- **FR-013**: Sistema MUST limpar e normalizar texto extraído
- **FR-014**: Sistema MUST armazenar texto extraído para referência futura

#### Análise com IA
- **FR-015**: Sistema MUST usar LLM para analisar conteúdo do contrato
- **FR-016**: Sistema MUST identificar nome do fornecedor e informações de contato
- **FR-017**: Sistema MUST identificar todos os serviços que serão prestados
- **FR-018**: Sistema MUST extrair responsabilidades do fornecedor para cada serviço
- **FR-019**: Sistema MUST extrair responsabilidades do condomínio para cada serviço
- **FR-020**: Sistema MUST identificar frequência de cada serviço (diária, semanal, mensal, etc.)
- **FR-021**: Sistema MUST identificar prazos e datas importantes (início, fim, renovação)
- **FR-022**: Sistema MUST mapear cada serviço para processos condominiais relacionados
- **FR-023**: Sistema MUST calcular score de confiança para cada mapeamento
- **FR-024**: Sistema MUST armazenar análise completa em formato estruturado (JSON)

#### Geração de Processos
- **FR-025**: Sistema MUST gerar workflow completo baseado no serviço identificado
- **FR-026**: Sistema MUST gerar workflow seguindo formato numerado do template (ex: "1. Primeira etapa")
- **FR-027**: Sistema MUST identificar entidades envolvidas no processo
- **FR-028**: Sistema MUST identificar variáveis do sistema usadas no processo
- **FR-029**: Sistema MUST definir matriz RACI completa para cada etapa do workflow
- **FR-030**: Sistema MUST gerar diagrama Mermaid com responsáveis indicados em cada nó
- **FR-031**: Sistema MUST aplicar cores corretas no diagrama Mermaid (azul/verde/vermelho)
- **FR-032**: Sistema MUST criar processo seguindo template completo (nome, categoria, descrição, workflow, entidades, variáveis, mermaid, raci)
- **FR-033**: Sistema MUST criar ou atualizar entidade do fornecedor automaticamente
- **FR-034**: Sistema MUST definir categoria apropriada do processo baseado no serviço
- **FR-035**: Sistema MUST definir tipo de documento apropriado (Manual, POP, Regulamento, etc.)
- **FR-036**: Sistema MUST criar processos com status "rascunho" inicialmente
- **FR-037**: Sistema MUST vincular processo gerado ao contrato de origem

#### Revisão e Validação
- **FR-038**: Sistema MUST permitir visualizar análise completa do contrato
- **FR-039**: Sistema MUST permitir revisar processos gerados antes de aprovar
- **FR-040**: Sistema MUST permitir editar processos gerados mantendo histórico
- **FR-041**: Sistema MUST indicar claramente quais processos foram gerados automaticamente
- **FR-042**: Sistema MUST exibir score de confiança para processos gerados
- **FR-043**: Sistema MUST permitir aprovar processos gerados para envio ao workflow
- **FR-044**: Sistema MUST permitir rejeitar processos gerados com motivo
- **FR-045**: Sistema MUST validar processos gerados usando sistema de validação existente
- **FR-046**: Sistema MUST garantir que entidades mencionadas existam antes de criar processo

#### Histórico e Logs
- **FR-047**: Sistema MUST registrar todos os contratos processados
- **FR-048**: Sistema MUST registrar logs de processamento com IA (prompts, respostas, tokens, tempo)
- **FR-049**: Sistema MUST manter histórico de processos gerados a partir de cada contrato
- **FR-050**: Sistema MUST permitir rastrear processo até contrato de origem
- **FR-051**: Sistema MUST permitir visualizar versão original gerada mesmo após edições
- **FR-052**: Sistema MUST registrar métricas de processamento (tempo, tokens, custo)

#### Processamento Assíncrono
- **FR-053**: Sistema MUST processar contratos de forma assíncrona
- **FR-054**: Sistema MUST exibir status de processamento em tempo real
- **FR-055**: Sistema MUST permitir cancelar processamento em andamento
- **FR-056**: Sistema MUST lidar com falhas de processamento graciosamente
- **FR-057**: Sistema MUST permitir reprocessar contratos quando necessário

### Key Entities

- **Contract**: Representa contrato de fornecedor ingerido. Atributos: id, supplier_name, supplier_id, file_path, file_name, file_type, file_size, status, extracted_text, ai_analysis, created_by, created_at, updated_at. Relacionamentos: supplier (Entity), process_mappings, generation_logs.

- **ContractProcessMapping**: Representa mapeamento entre serviço do contrato e processo gerado. Atributos: id, contract_id, process_id, service_description, confidence_score, auto_generated, mapping_reason, created_at. Relacionamentos: contract, process.

- **AIGenerationLog**: Representa log de geração usando IA. Atributos: id, contract_id, process_id, generation_type, prompt_used, ai_response, tokens_used, model_used, execution_time_ms, created_at. Relacionamentos: contract, process.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sistema consegue extrair texto de 95% dos contratos PDF/DOCX/TXT sem erros
- **SC-002**: IA identifica corretamente serviços em 85% dos contratos processados
- **SC-003**: IA mapeia corretamente serviços para processos em 80% dos casos
- **SC-004**: Processos gerados automaticamente seguem 100% do template de processos
- **SC-005**: Redução de 70% no tempo de criação de processos através de geração automática
- **SC-006**: 60% dos processos gerados automaticamente são aprovados sem edição manual
- **SC-007**: Processamento de contrato médio (5 páginas) completa em menos de 2 minutos
- **SC-008**: Sistema gera matriz RACI completa e correta em 90% dos processos
- **SC-009**: Sistema gera diagrama Mermaid válido em 95% dos processos
- **SC-010**: 100% dos processos gerados têm entidades válidas e existentes no sistema

## Assumptions

- Contratos estão em português brasileiro
- Contratos seguem formato padrão (não são completamente não-estruturados)
- LLM está disponível e configurado (OpenAI, Claude ou Ollama)
- Sistema de processos existente está funcionando (003)
- Sistema de entidades está funcionando
- Sistema de aprovação está funcionando (003)
- Administradores têm conhecimento básico para revisar processos gerados
- Contratos contêm informações suficientes para gerar processos (não são muito vagos)
- Processamento pode ser assíncrono (usuário não precisa esperar)

## Dependencies

- Sistema de processos existente (003-app-gestao-processos-aprovacao)
- Sistema de entidades existente
- Sistema de aprovação existente (003)
- Sistema de validação (004) - recomendado
- LLM disponível (OpenAI API, Claude API, ou Ollama local)
- Biblioteca de extração de texto (PyPDF2, pdfplumber, python-docx)
- Sistema de armazenamento de arquivos (S3 ou filesystem)

## Out of Scope

- Assinatura digital de contratos
- Renegociação automática de contratos
- Análise financeira de contratos (valores, pagamentos)
- Comparação de contratos de diferentes fornecedores
- Geração automática de documentos legais
- OCR avançado para contratos muito antigos ou de baixa qualidade
- Tradução automática de contratos em outros idiomas
- Análise de compliance legal dos contratos
