# Feature Specification: Ingestão de Contratos de Fornecedores com Geração Automática de Processos

**Feature Branch**: `007-ingestao-contratos-fornecedores`  
**Created**: 2024-12-08  
**Status**: Draft  
**Input**: User description: "Fazer o planejamento para Ingestão de contrato de fornecedores. Após a Ingestão uma IA irá ler e inferir quais processos o fornecedor de serviços fará, mapeará o processo, definirá as responsabilidades e gerará o processo obedecendo o template de processos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload e Ingestão de Contrato (Priority: P1)

Síndico ou administradora precisa fazer upload de um contrato de fornecedor (PDF, DOCX, etc.) e o sistema deve processar o arquivo, extrair o texto e armazenar o contrato para análise.

**Why this priority**: Upload e ingestão são o primeiro passo do fluxo. Sem capacidade de receber e processar contratos, não há como prosseguir com análise e geração de processos. É a base funcional da feature.

**Independent Test**: Pode ser testado fazendo upload de diferentes formatos de contrato (PDF, DOCX), verificando se arquivo é salvo, texto é extraído corretamente e status de processamento é atualizado. O valor entregue é capacidade de receber e processar contratos.

**Acceptance Scenarios**:

1. **Given** que síndico acessa página de ingestão de contratos, **When** faz upload de arquivo PDF de contrato, **Then** sistema deve aceitar arquivo, exibir progresso de upload e iniciar processamento
2. **Given** que arquivo é enviado, **When** sistema processa, **Then** deve extrair texto do contrato, armazenar arquivo original e criar registro de contrato com status "processando"
3. **Given** que arquivo está em formato DOCX, **When** sistema processa, **Then** deve extrair texto corretamente independente do formato
4. **Given** que upload falha, **When** erro ocorre, **Then** sistema deve exibir mensagem clara de erro e permitir novo upload
5. **Given** que contrato é processado, **When** extração é concluída, **Then** sistema deve atualizar status para "texto_extraido" e permitir visualização do texto extraído

---

### User Story 2 - Análise de Contrato por IA e Identificação de Processos (Priority: P1)

Após ingestão, sistema deve usar IA para analisar o contrato, identificar serviços que o fornecedor prestará e inferir quais processos condominiais serão necessários para gerenciar esses serviços.

**Why this priority**: Análise por IA é o coração da funcionalidade. Sem capacidade de entender o contrato e identificar processos necessários, não há automação. É o diferencial que transforma contrato em processos estruturados.

**Independent Test**: Pode ser testado enviando contrato de manutenção de elevadores, verificando se IA identifica serviços de manutenção preventiva/corretiva e sugere processos relacionados. O valor entregue é automação inteligente de mapeamento.

**Acceptance Scenarios**:

1. **Given** que contrato foi ingerido e texto extraído, **When** sistema inicia análise por IA, **Then** deve processar texto, identificar serviços prestados e gerar lista de processos sugeridos
2. **Given** que contrato menciona "manutenção preventiva mensal de elevadores", **When** IA analisa, **Then** deve sugerir processo de "Manutenção de Elevadores" com categoria "Operação"
3. **Given** que contrato menciona múltiplos serviços, **When** IA analisa, **Then** deve identificar todos os serviços e sugerir múltiplos processos correspondentes
4. **Given** que IA identifica processos, **When** análise completa, **Then** sistema deve exibir lista de processos sugeridos com confiança e permitir revisão antes de gerar
5. **Given** que análise falha, **When** erro ocorre, **Then** sistema deve exibir mensagem de erro e permitir reanálise ou processamento manual

---

### User Story 3 - Mapeamento Automático de Processo com Workflow e Entidades (Priority: P1)

Para cada processo identificado, sistema deve usar IA para mapear workflow completo (etapas numeradas), identificar entidades envolvidas (fornecedor, síndico, administradora, etc.) e definir variáveis do sistema necessárias.

**Why this priority**: Mapeamento automático transforma identificação de processo em estrutura completa. Sem isso, usuário teria que criar manualmente todo o workflow, perdendo o valor da automação. É essencial para completar a geração automática.

**Independent Test**: Pode ser testado verificando se processo sugerido tem workflow completo, entidades corretas identificadas e variáveis relevantes. O valor entregue é estrutura completa de processo pronta para uso.

**Acceptance Scenarios**:

1. **Given** que processo foi identificado pela IA, **When** sistema mapeia processo, **Then** deve gerar workflow com etapas numeradas descrevendo fluxo completo do serviço
2. **Given** que processo envolve fornecedor e síndico, **When** sistema mapeia, **Then** deve identificar entidades: fornecedor específico, síndico, administradora (se aplicável)
3. **Given** que processo menciona horários ou frequências, **When** sistema mapeia, **Then** deve identificar variáveis do sistema relevantes (ex: horario_manutencao, frequencia_manutencao)
4. **Given** que múltiplos processos são mapeados, **When** mapeamento completa, **Then** cada processo deve ter workflow, entidades e variáveis independentes e completos
5. **Given** que mapeamento é gerado, **When** usuário visualiza, **Then** deve poder revisar e editar workflow, entidades e variáveis antes de confirmar geração

---

### User Story 4 - Definição Automática de Responsabilidades RACI (Priority: P1)

Para cada etapa do workflow mapeado, sistema deve usar IA para definir matriz RACI automaticamente, identificando quem é Responsável (R), Accountable (A), Consulted (C) e Informed (I) em cada etapa.

**Why this priority**: Matriz RACI é obrigatória no template de processos. Sem definição automática, usuário teria que preencher manualmente para cada etapa, reduzindo valor da automação. É essencial para completar processo conforme template.

**Independent Test**: Pode ser testado verificando se cada etapa do workflow tem entrada RACI completa, se responsabilidades fazem sentido (ex: fornecedor como Responsible, síndico como Accountable) e se matriz está completa. O valor entregue é processo completo e pronto para aprovação.

**Acceptance Scenarios**:

1. **Given** que workflow foi mapeado com N etapas, **When** sistema define RACI, **Then** deve criar entrada RACI para cada etapa do workflow
2. **Given** que etapa envolve execução pelo fornecedor, **When** sistema define RACI, **Then** deve marcar fornecedor como Responsible (R) e síndico como Accountable (A)
3. **Given** que etapa requer aprovação, **When** sistema define RACI, **Then** deve identificar aprovador como Accountable e partes consultadas como Consulted
4. **Given** que etapa gera notificação, **When** sistema define RACI, **Then** deve identificar partes informadas como Informed
5. **Given** que RACI é gerado, **When** usuário visualiza, **Then** deve poder revisar e ajustar responsabilidades antes de confirmar

---

### User Story 5 - Geração de Processo Conforme Template (Priority: P1)

Sistema deve gerar processo completo seguindo exatamente o template de processos, incluindo todos os campos obrigatórios (nome, categoria, descrição, workflow, entidades, variáveis, diagrama Mermaid, matriz RACI) e criar processo no sistema com status "rascunho".

**Why this priority**: Geração final do processo é o objetivo da feature. Sem capacidade de criar processo completo no sistema seguindo template, toda análise anterior não tem valor prático. É a entrega final que permite uso do processo gerado.

**Independent Test**: Pode ser testado verificando se processo gerado tem todos os campos do template preenchidos, se segue estrutura correta, se diagrama Mermaid é válido e se processo aparece na lista de processos. O valor entregue é processo completo pronto para revisão e aprovação.

**Acceptance Scenarios**:

1. **Given** que mapeamento e RACI foram aprovados pelo usuário, **When** sistema gera processo, **Then** deve criar processo completo com todos os campos do template preenchidos
2. **Given** que processo é gerado, **When** sistema cria, **Then** deve incluir: nome descritivo, categoria correta, descrição, workflow completo, entidades, variáveis, diagrama Mermaid válido e matriz RACI completa
3. **Given** que diagrama Mermaid é gerado, **When** processo é criado, **Then** diagrama deve seguir formato correto com responsáveis indicados e cores apropriadas
4. **Given** que processo é gerado, **When** criado no sistema, **Then** deve ter status "rascunho" e estar disponível para edição e envio para aprovação
5. **Given** que múltiplos processos são gerados, **When** geração completa, **Then** cada processo deve ser independente, completo e seguir template corretamente

---

### User Story 6 - Revisão e Edição de Processos Gerados (Priority: P2)

Usuário precisa revisar processos gerados automaticamente, poder editar qualquer campo (workflow, RACI, descrição, etc.) antes de confirmar criação e enviar para aprovação.

**Why this priority**: IA pode cometer erros ou não capturar nuances. Capacidade de revisar e editar é essencial para garantir qualidade antes de enviar para aprovação. Melhora confiança no sistema.

**Independent Test**: Pode ser testado gerando processo, editando campos, verificando se alterações são salvas e se processo editado mantém integridade. O valor entregue é controle de qualidade e ajuste fino.

**Acceptance Scenarios**:

1. **Given** que processo foi gerado automaticamente, **When** usuário acessa para revisar, **Then** deve ver todos os campos editáveis e poder modificar qualquer campo
2. **Given** que workflow gerado tem etapa incorreta, **When** usuário edita, **Then** deve poder adicionar, remover ou modificar etapas e RACI deve ser atualizado automaticamente
3. **Given** que entidade foi identificada incorretamente, **When** usuário edita, **Then** deve poder corrigir entidades e sistema deve validar se entidade existe no cadastro
4. **Given** que usuário faz alterações, **When** salva, **Then** processo deve ser atualizado mantendo histórico e versão
5. **Given** que processo foi revisado, **When** usuário confirma, **Then** deve poder enviar para aprovação seguindo workflow normal de aprovação

---

### User Story 7 - Histórico e Rastreabilidade de Contratos e Processos Gerados (Priority: P2)

Sistema deve manter histórico completo ligando contrato original aos processos gerados, permitindo rastreabilidade e auditoria de qual processo veio de qual contrato.

**Why this priority**: Rastreabilidade é importante para auditoria, compliance e entendimento da origem dos processos. Permite verificar se processos refletem corretamente contratos assinados.

**Independent Test**: Pode ser testado gerando processos de um contrato, verificando se histórico mostra relação, se é possível acessar contrato original e ver quais processos foram gerados. O valor entregue é transparência e auditoria.

**Acceptance Scenarios**:

1. **Given** que processos foram gerados de um contrato, **When** usuário visualiza contrato, **Then** deve ver lista de processos gerados com links para cada processo
2. **Given** que processo foi gerado, **When** usuário visualiza processo, **Then** deve ver referência ao contrato original com link para acessar
3. **Given** que contrato foi atualizado, **When** novo processo é gerado, **Then** histórico deve mostrar versão do contrato e data de geração
4. **Given** que processo foi editado após geração, **When** histórico é consultado, **Then** deve mostrar que processo foi gerado automaticamente e depois editado manualmente
5. **Given** que múltiplos contratos geram processos similares, **When** histórico é consultado, **Then** deve ser possível identificar origem de cada processo

---

### User Story 8 - Criação Automática de Entidade Fornecedor (Priority: P2)

Quando contrato é ingerido, sistema deve extrair informações do fornecedor (nome, contato, tipo de serviço) e criar ou atualizar entidade fornecedor automaticamente no cadastro de entidades.

**Why this priority**: Processos gerados referenciam fornecedor como entidade. Criar entidade automaticamente evita erro de referência a entidade inexistente e melhora integridade dos dados.

**Independent Test**: Pode ser testado ingerindo contrato, verificando se entidade fornecedor é criada com dados corretos e se processos gerados referenciam essa entidade. O valor entregue é integridade automática de dados.

**Acceptance Scenarios**:

1. **Given** que contrato é ingerido, **When** sistema extrai informações do fornecedor, **Then** deve identificar nome, CNPJ, contatos e tipo de serviço
2. **Given** que fornecedor não existe no cadastro, **When** sistema processa, **Then** deve criar nova entidade com tipo "empresa" e categoria apropriada
3. **Given** que fornecedor já existe, **When** sistema processa, **Then** deve atualizar informações se houver mudanças (novos contatos, etc.)
4. **Given** que entidade é criada, **When** processos são gerados, **Then** devem referenciar corretamente a entidade criada
5. **Given** que dados do fornecedor são incompletos, **When** entidade é criada, **Then** sistema deve marcar campos faltantes e permitir completar manualmente

---

### Edge Cases

- O que acontece quando contrato está em formato não suportado (imagem, texto escaneado)?
- Como sistema lida com contratos muito longos que excedem limite de tokens da IA?
- O que acontece quando IA não consegue identificar nenhum processo no contrato?
- Como sistema lida com contratos que mencionam serviços genéricos sem especificidade?
- O que acontece quando múltiplos fornecedores são mencionados no mesmo contrato?
- Como sistema lida com contratos em idiomas diferentes de português?
- O que acontece quando processo gerado referencia entidade que não existe e não pode ser criada automaticamente?
- Como sistema lida com contratos que têm cláusulas condicionais ou processos opcionais?
- O que acontece quando usuário rejeita todos os processos sugeridos pela IA?
- Como sistema lida com contratos que são atualizações de contratos anteriores (versões)?

## Requirements *(mandatory)*

### Functional Requirements

#### Upload e Ingestão de Contratos
- **FR-001**: Sistema MUST permitir upload de contratos em formatos PDF, DOCX, TXT
- **FR-002**: Sistema MUST validar tamanho máximo de arquivo (ex: 10MB) antes de aceitar upload
- **FR-003**: Sistema MUST extrair texto de contratos PDF (incluindo PDFs escaneados com OCR se necessário)
- **FR-004**: Sistema MUST extrair texto de contratos DOCX preservando estrutura quando possível
- **FR-005**: Sistema MUST armazenar arquivo original do contrato para referência futura
- **FR-006**: Sistema MUST criar registro de contrato com metadados (nome do arquivo, data de upload, fornecedor identificado, status)
- **FR-007**: Sistema MUST exibir progresso de upload e processamento para usuário
- **FR-008**: Sistema MUST permitir visualização do texto extraído após processamento
- **FR-009**: Sistema MUST tratar erros de upload e exibir mensagens claras ao usuário
- **FR-010**: Sistema MUST suportar upload de múltiplos contratos simultaneamente

#### Análise de Contrato por IA
- **FR-011**: Sistema MUST usar IA para analisar texto do contrato e identificar serviços prestados
- **FR-012**: Sistema MUST identificar fornecedor mencionado no contrato (nome, CNPJ, contatos)
- **FR-013**: Sistema MUST inferir processos condominiais necessários baseado nos serviços identificados
- **FR-014**: Sistema MUST associar processos sugeridos a categorias corretas (Governança, Operação, etc.)
- **FR-015**: Sistema MUST exibir nível de confiança para cada processo sugerido
- **FR-016**: Sistema MUST permitir que usuário revise e selecione quais processos gerar antes da geração
- **FR-017**: Sistema MUST permitir reanálise do contrato se resultado não for satisfatório
- **FR-018**: Sistema MUST tratar erros de análise por IA e permitir processamento manual alternativo
- **FR-019**: Sistema MUST processar contratos em português brasileiro com termos condominiais
- **FR-020**: Sistema MUST lidar com contratos longos dividindo em seções se necessário

#### Mapeamento Automático de Processos
- **FR-021**: Sistema MUST gerar workflow completo (etapas numeradas) para cada processo identificado
- **FR-022**: Sistema MUST identificar entidades envolvidas em cada processo (fornecedor, síndico, administradora, etc.)
- **FR-023**: Sistema MUST identificar variáveis do sistema relevantes (horários, frequências, limites, etc.)
- **FR-024**: Sistema MUST gerar descrição detalhada do processo baseada no contrato
- **FR-025**: Sistema MUST determinar tipo de documento apropriado (POP, Manual, Regulamento, etc.)
- **FR-026**: Sistema MUST gerar nome descritivo e claro para cada processo
- **FR-027**: Sistema MUST validar que entidades identificadas existem ou podem ser criadas
- **FR-028**: Sistema MUST permitir edição de workflow, entidades e variáveis antes de confirmar geração

#### Definição Automática de RACI
- **FR-029**: Sistema MUST gerar matriz RACI completa para cada etapa do workflow
- **FR-030**: Sistema MUST identificar Responsible (R) para cada etapa baseado no contexto
- **FR-031**: Sistema MUST identificar Accountable (A) para cada etapa (geralmente síndico para processos de fornecedores)
- **FR-032**: Sistema MUST identificar Consulted (C) quando etapa requer consulta prévia
- **FR-033**: Sistema MUST identificar Informed (I) quando etapa gera notificações
- **FR-034**: Sistema MUST garantir que cada etapa tenha pelo menos Responsible e Accountable definidos
- **FR-035**: Sistema MUST permitir edição de matriz RACI antes de confirmar geração

#### Geração de Processo Conforme Template
- **FR-036**: Sistema MUST gerar processo completo seguindo exatamente template de processos
- **FR-037**: Sistema MUST incluir todos os campos obrigatórios: id, name, category, icon, status, description, workflow, entities, variables, documentType
- **FR-038**: Sistema MUST gerar diagrama Mermaid válido com responsáveis indicados em cada nó
- **FR-039**: Sistema MUST aplicar cores corretas no diagrama Mermaid (azul para execução, verde para aprovação, vermelho para urgência)
- **FR-040**: Sistema MUST gerar matriz RACI completa com uma entrada para cada etapa do workflow
- **FR-041**: Sistema MUST criar processo no sistema com status "rascunho" inicialmente
- **FR-042**: Sistema MUST validar que processo gerado segue estrutura do template antes de salvar
- **FR-043**: Sistema MUST permitir geração de múltiplos processos de um único contrato
- **FR-044**: Sistema MUST criar versão inicial do processo quando gerado

#### Revisão e Edição
- **FR-045**: Sistema MUST permitir edição de todos os campos do processo gerado antes de confirmar
- **FR-046**: Sistema MUST validar entidades quando processo é editado
- **FR-047**: Sistema MUST atualizar matriz RACI automaticamente se workflow for editado (adicionar/remover etapas)
- **FR-048**: Sistema MUST permitir visualização lado a lado do contrato original e processo gerado
- **FR-049**: Sistema MUST permitir descartar processo gerado se não for adequado
- **FR-050**: Sistema MUST permitir regerar processo com parâmetros diferentes se necessário

#### Histórico e Rastreabilidade
- **FR-051**: Sistema MUST manter relação entre contrato e processos gerados
- **FR-052**: Sistema MUST permitir visualizar quais processos foram gerados de um contrato
- **FR-053**: Sistema MUST permitir visualizar qual contrato originou um processo
- **FR-054**: Sistema MUST registrar data e hora de geração de cada processo
- **FR-055**: Sistema MUST manter histórico de edições feitas em processos gerados automaticamente
- **FR-056**: Sistema MUST permitir exportar relatório de processos gerados por contrato

#### Criação Automática de Entidades
- **FR-057**: Sistema MUST extrair informações do fornecedor do contrato (nome, CNPJ, contatos, tipo de serviço)
- **FR-058**: Sistema MUST criar entidade fornecedor automaticamente se não existir no cadastro
- **FR-059**: Sistema MUST atualizar entidade fornecedor se já existir com informações mais recentes
- **FR-060**: Sistema MUST associar entidade criada aos processos gerados
- **FR-061**: Sistema MUST validar dados do fornecedor antes de criar entidade
- **FR-062**: Sistema MUST permitir edição manual de entidade criada automaticamente

### Key Entities

- **Contrato**: Representa contrato de fornecedor ingerido. Atributos: id, nome_arquivo, caminho_arquivo, texto_extraido, fornecedor_id, status (uploaded, processing, texto_extraido, analisando, processos_gerados, erro), data_upload, data_processamento, processos_gerados_ids. Relacionamentos: fornecedor (Entity), processos_gerados (Process[]).

- **Análise de Contrato**: Representa resultado da análise por IA. Atributos: id, contrato_id, servicos_identificados, processos_sugeridos (com confiança), entidades_identificadas, variaveis_identificadas, data_analise, modelo_ia_usado. Relacionamentos: contrato, processos_sugeridos.

- **Processo Gerado**: Representa processo criado automaticamente a partir de contrato. Herda de Process mas adiciona: contrato_origem_id, gerado_automaticamente (boolean), data_geracao, editado_apos_geracao (boolean). Relacionamentos: contrato_origem, versões, aprovações.

- **Fornecedor (Entity)**: Entidade do tipo empresa representando fornecedor. Atributos padrão de Entity mais: cnpj, tipo_servico, criado_automaticamente (boolean), contrato_associado_id. Relacionamentos: contratos, processos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sistema consegue extrair texto de 95% dos contratos PDF e DOCX enviados sem erros

- **SC-002**: IA identifica corretamente pelo menos 80% dos processos relevantes mencionados em contratos (validação manual)

- **SC-003**: Processos gerados automaticamente têm pelo menos 90% dos campos do template preenchidos corretamente na primeira geração

- **SC-004**: Matriz RACI gerada automaticamente tem Responsible e Accountable definidos para 100% das etapas

- **SC-005**: Diagramas Mermaid gerados são válidos e renderizam corretamente em 95% dos casos

- **SC-006**: Sistema cria entidade fornecedor automaticamente em 100% dos casos quando fornecedor não existe

- **SC-007**: Usuário consegue revisar e editar processo gerado e enviar para aprovação em menos de 10 minutos

- **SC-008**: Redução de 70% no tempo de criação de processos de fornecedores comparado à criação manual

- **SC-009**: 85% dos processos gerados automaticamente são aprovados sem necessidade de edição significativa

- **SC-010**: Sistema mantém rastreabilidade completa (100%) entre contratos e processos gerados

- **SC-011**: Upload e processamento inicial de contrato (até exibição de processos sugeridos) ocorre em menos de 2 minutos para contratos de até 50 páginas

- **SC-012**: Geração completa de processo (workflow + RACI + diagrama) ocorre em menos de 30 segundos por processo

## Assumptions

- Contratos estão em português brasileiro
- Contratos seguem estrutura comum (partes, objeto, obrigações, prazos)
- IA tem acesso a modelo de linguagem adequado (GPT-4, Claude, ou similar) via API
- Sistema tem capacidade de processar arquivos PDF (incluindo OCR para PDFs escaneados)
- Fornecedores mencionados em contratos podem ser identificados por nome, CNPJ ou descrição
- Processos de fornecedores geralmente se encaixam em categorias existentes (principalmente "Operação")
- Template de processos permanece estável durante implementação
- Usuários têm conhecimento básico dos processos do condomínio para validar sugestões da IA
- Sistema de entidades já está implementado e funcional
- Sistema de processos e aprovação já está implementado e funcional

## Dependencies

- Sistema de processos existente (003-app-gestao-processos-aprovacao)
- Sistema de entidades existente (004-validacao-entidades-processos)
- Template de processos definido e estável
- API de IA para análise de texto (OpenAI, Anthropic, ou similar)
- Biblioteca de extração de texto de PDF/DOCX (PyPDF2, python-docx, pdfplumber, ou similar)
- Biblioteca de OCR para PDFs escaneados (Tesseract, ou similar)
- Sistema de armazenamento de arquivos (local ou cloud storage)
- Sistema de autenticação e autorização

## Out of Scope

- Assinatura digital ou validação legal de contratos
- Negociação ou edição de contratos
- Gestão de vencimento ou renovação de contratos
- Integração com sistemas externos de gestão de contratos
- Análise de cláusulas legais ou compliance
- Geração de contratos (apenas ingestão e análise)
- Processamento de contratos em outros idiomas além de português
- Suporte a formatos de arquivo além de PDF, DOCX e TXT
- Processamento de contratos muito grandes (>100 páginas) sem otimizações específicas
- Treinamento de modelo de IA customizado (usa modelo pré-treinado via API)
