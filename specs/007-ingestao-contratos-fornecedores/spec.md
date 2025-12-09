# Feature Specification: Ingestão e Processamento Automático de Contratos de Fornecedores

**Feature Branch**: `007-ingestao-contratos-fornecedores`  
**Created**: 2024-12-09  
**Status**: Draft  
**Input**: User description: "Ingestão de contrato de fornecedores. Após a Ingestão uma IA irá ler e inferir quais processos o fornecedor de serviços fará, mapeará o processo, definirá as responsabilidades e gerará o processo obedecendo o template de processos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload e Ingestão de Contrato de Fornecedor (Priority: P1)

Administrador precisa fazer upload de contrato de fornecedor (PDF, DOCX, imagem) e sistema deve extrair texto completo do contrato, armazenar documento original e preparar para análise por IA.

**Why this priority**: Sem ingestão do contrato, não há dados para processar. É o primeiro passo fundamental para toda funcionalidade. Entrega valor imediato permitindo armazenar contratos digitalmente.

**Independent Test**: Pode ser testado fazendo upload de diferentes formatos de contratos e verificando se texto é extraído corretamente. O valor entregue é armazenamento estruturado de contratos.

**Acceptance Scenarios**:

1. **Given** que administrador acessa interface de ingestão, **When** faz upload de contrato em PDF, **Then** sistema deve extrair texto completo, detectar idioma e armazenar documento
2. **Given** que contrato em DOCX é enviado, **When** sistema processa, **Then** deve extrair texto mantendo estrutura de seções e cláusulas
3. **Given** que contrato é imagem digitalizada, **When** sistema processa, **Then** deve aplicar OCR, extrair texto e indicar confiança da extração
4. **Given** que extração falha, **When** erro ocorre, **Then** sistema deve permitir entrada manual ou correção do texto extraído
5. **Given** que contrato é extraído com sucesso, **When** armazenado, **Then** deve associar metadados: fornecedor, data upload, tipo serviço, vigência

---

### User Story 2 - Análise por IA e Inferência de Processos (Priority: P1)

Sistema deve usar IA (LLM) para analisar contrato extraído, identificar serviços que fornecedor prestará e inferir quais processos condominiais serão necessários baseado no escopo do contrato.

**Why this priority**: Análise inteligente é o diferencial da feature. Automatiza trabalho manual de interpretação de contratos e identificação de processos necessários. Entrega valor core.

**Independent Test**: Pode ser testado enviando contrato de fornecedor conhecido e verificando se IA identifica corretamente serviços e processos. O valor entregue é automação de análise de contratos.

**Acceptance Scenarios**:

1. **Given** que contrato foi ingerido, **When** IA analisa, **Then** deve identificar: tipo de serviço, escopo de trabalho, frequência, responsabilidades do fornecedor, SLAs
2. **Given** que escopo é identificado, **When** IA infere processos, **Then** deve mapear serviços para categorias de processos (Operação, Manutenção, Segurança, etc.)
3. **Given** que contrato é de limpeza, **When** IA processa, **Then** deve inferir processos como "Limpeza de Áreas Comuns", "Gestão de Materiais de Limpeza", "Checklist de Limpeza"
4. **Given** que contrato é de segurança, **When** IA processa, **Then** deve inferir processos como "Ronda de Segurança", "Controle de Acesso", "Gestão de Incidentes"
5. **Given** que contrato é de jardinagem, **When** IA processa, **Then** deve inferir processos como "Manutenção de Jardins", "Poda de Árvores", "Irrigação"
6. **Given** que IA está incerta, **When** analisa, **Then** deve indicar nível de confiança e permitir revisão humana

---

### User Story 3 - Mapeamento Automático de Workflow do Processo (Priority: P1)

Sistema deve gerar automaticamente workflow (etapas numeradas) do processo baseado no contrato, seguindo lógica operacional do serviço e melhores práticas.

**Why this priority**: Workflow é componente essencial do processo. Automação economiza tempo e garante estrutura consistente. Sem workflow, processo não está completo.

**Independent Test**: Pode ser testado gerando workflow para contrato e verificando se etapas são lógicas, sequenciais e completas. O valor entregue é geração automática de workflows estruturados.

**Acceptance Scenarios**:

1. **Given** que IA identificou serviço de limpeza, **When** gera workflow, **Then** deve criar etapas: 1. Recebimento de materiais, 2. Execução da limpeza, 3. Inspeção de qualidade, 4. Registro de conclusão
2. **Given** que workflow é gerado, **When** validado, **Then** cada etapa deve ter descrição clara e ordem lógica de execução
3. **Given** que contrato menciona frequência (ex: diária, semanal), **When** workflow é gerado, **Then** deve incluir periodicidade nas etapas relevantes
4. **Given** que contrato tem múltiplos serviços, **When** IA processa, **Then** deve gerar workflows separados ou etapas distintas para cada serviço
5. **Given** que workflow é gerado, **When** sistema valida, **Then** deve verificar se etapas são executáveis e não redundantes

---

### User Story 4 - Definição Automática de Responsabilidades (RACI) (Priority: P1)

Sistema deve gerar automaticamente matriz RACI para cada etapa do workflow, identificando quem é Responsável, Aprovador, Consultado e Informado baseado no contrato e estrutura do condomínio.

**Why this priority**: RACI é crítico para clareza de responsabilidades. Automação garante que cada etapa tenha responsáveis definidos, evitando confusão. Essencial para processo completo.

**Independent Test**: Pode ser testado gerando RACI para processo e verificando se responsabilidades estão corretas e completas. O valor entregue é clareza automática de responsabilidades.

**Acceptance Scenarios**:

1. **Given** que workflow foi gerado, **When** IA cria RACI, **Then** para cada etapa deve definir: Responsible (quem executa), Accountable (quem aprova), Consulted (quem é consultado), Informed (quem é informado)
2. **Given** que contrato menciona fornecedor, **When** RACI é gerado, **Then** fornecedor deve ser marcado como "Responsible" nas etapas de execução
3. **Given** que etapa requer aprovação, **When** RACI é gerado, **Then** Síndico ou Administradora deve ser "Accountable" (aprovador)
4. **Given** que processo envolve moradores, **When** RACI é gerado, **Then** moradores devem ser marcados como "Informed" (informados)
5. **Given** que RACI é gerado, **When** validado, **Then** cada etapa deve ter exatamente 1 Accountable (aprovador) e pelo menos 1 Responsible
6. **Given** que entidade não existe no sistema, **When** RACI é gerado, **Then** sistema deve criar sugestão de nova entidade ou mapear para entidade existente

---

### User Story 5 - Geração Automática de Diagrama Mermaid (Priority: P2)

Sistema deve gerar automaticamente diagrama de fluxo em formato Mermaid representando visualmente o workflow do processo, incluindo responsáveis em cada nó.

**Why this priority**: Diagrama visual melhora compreensão do processo. Útil mas não crítico para funcionamento básico. Pode ser implementado após geração de workflow.

**Independent Test**: Pode ser testado gerando diagrama e verificando se renderiza corretamente e representa workflow fielmente. O valor entregue é visualização automática de processos.

**Acceptance Scenarios**:

1. **Given** que workflow foi gerado, **When** IA cria diagrama Mermaid, **Then** deve representar cada etapa como nó no fluxo com responsável indicado
2. **Given** que workflow tem decisões (ex: aprovado/rejeitado), **When** diagrama é gerado, **Then** deve incluir nós de decisão (losango) com caminhos alternativos
3. **Given** que diagrama é gerado, **When** renderizado, **Then** deve aplicar cores: azul para execução, verde para aprovação, vermelho para emergência/rejeição
4. **Given** que workflow é linear, **When** diagrama é gerado, **Then** deve mostrar sequência clara com setas conectando etapas
5. **Given** que workflow tem loops (repetição), **When** diagrama é gerado, **Then** deve representar com seta de retorno para etapa anterior
6. **Given** que diagrama é gerado, **When** validado, **Then** deve seguir sintaxe Mermaid correta e ser renderizável

---

### User Story 6 - Identificação e Validação de Entidades (Priority: P1)

Sistema deve identificar automaticamente entidades envolvidas no processo (fornecedor, síndico, moradores, etc.) e validar se existem no cadastro, criando sugestões para novas entidades quando necessário.

**Why this priority**: Processos dependem de entidades válidas para funcionar. Validação automática garante integridade de dados e evita referências quebradas. Crítico para qualidade.

**Independent Test**: Pode ser testado gerando processo e verificando se entidades são identificadas e validadas corretamente. O valor entregue é garantia de integridade de dados.

**Acceptance Scenarios**:

1. **Given** que contrato menciona fornecedor, **When** IA identifica entidades, **Then** deve extrair nome do fornecedor, CNPJ, contatos e tipo de serviço
2. **Given** que entidade extraída existe no sistema, **When** validação ocorre, **Then** deve associar processo à entidade existente
3. **Given** que entidade não existe, **When** validação ocorre, **Then** deve criar sugestão com dados extraídos do contrato para aprovação
4. **Given** que processo envolve múltiplas entidades, **When** IA identifica, **Then** deve listar todas (ex: Fornecedor, Síndico, Administradora, Moradores)
5. **Given** que entidade é ambígua, **When** IA processa, **Then** deve sugerir opções e permitir seleção manual
6. **Given** que todas as entidades são validadas, **When** processo é gerado, **Then** campo `entities` deve conter lista completa e válida

---

### User Story 7 - Identificação de Variáveis do Sistema (Priority: P2)

Sistema deve identificar variáveis configuráveis mencionadas no contrato (horários, frequências, limites) e mapear para variáveis do sistema existentes ou sugerir novas variáveis.

**Why this priority**: Variáveis tornam processos parametrizáveis. Importante para flexibilidade mas não crítico para geração inicial. Pode ser refinado posteriormente.

**Independent Test**: Pode ser testado analisando contrato com parâmetros específicos e verificando se variáveis são identificadas. O valor entregue é parametrização automática.

**Acceptance Scenarios**:

1. **Given** que contrato menciona horários, **When** IA identifica variáveis, **Then** deve mapear para variáveis como `horario_limpeza`, `horario_jardinagem`
2. **Given** que contrato menciona frequência (ex: 3x por semana), **When** IA processa, **Then** deve criar variável `frequencia_servico_[tipo]`
3. **Given** que variável já existe no sistema, **When** mapeamento ocorre, **Then** deve reutilizar variável existente
4. **Given** que variável não existe, **When** identificada, **Then** deve sugerir criação com nome, tipo e valor padrão
5. **Given** que processo é gerado, **When** completo, **Then** campo `variables` deve conter lista de variáveis aplicáveis ao processo

---

### User Story 8 - Revisão e Edição Antes de Aprovação (Priority: P1)

Administrador deve poder revisar processo gerado pela IA, editar qualquer campo (workflow, RACI, entidades, etc.) antes de enviar para workflow de aprovação.

**Why this priority**: IA pode cometer erros. Revisão humana é essencial para qualidade e confiança. Permite ajustes finos e validação antes de aprovação oficial.

**Independent Test**: Pode ser testado gerando processo, editando campos e verificando se alterações são salvas. O valor entregue é controle humano sobre processo automatizado.

**Acceptance Scenarios**:

1. **Given** que processo foi gerado pela IA, **When** administrador visualiza, **Then** deve ver todos os campos preenchidos (nome, categoria, workflow, RACI, entidades, variáveis, diagrama)
2. **Given** que administrador identifica erro, **When** edita campo, **Then** sistema deve permitir alteração de qualquer campo gerado
3. **Given** que workflow precisa ajuste, **When** administrador edita, **Then** deve poder adicionar, remover ou reordenar etapas
4. **Given** que RACI está incorreto, **When** administrador edita, **Then** deve poder alterar responsáveis de qualquer papel (R, A, C, I)
5. **Given** que entidade está errada, **When** administrador corrige, **Then** deve poder adicionar ou remover entidades da lista
6. **Given** que todas as edições são feitas, **When** administrador salva, **Then** processo deve ser salvo como rascunho para posterior envio à aprovação

---

### User Story 9 - Geração de Múltiplos Processos por Contrato (Priority: P2)

Sistema deve permitir que um único contrato gere múltiplos processos quando fornecedor presta vários serviços distintos, organizando cada serviço como processo separado.

**Why this priority**: Contratos complexos envolvem múltiplos serviços. Separar em processos individuais melhora organização e granularidade. Útil mas não crítico inicialmente.

**Independent Test**: Pode ser testado com contrato multi-serviço e verificando se múltiplos processos são gerados corretamente. O valor entregue é granularidade e organização.

**Acceptance Scenarios**:

1. **Given** que contrato tem múltiplos serviços (ex: limpeza + jardinagem), **When** IA analisa, **Then** deve identificar cada serviço como processo separado
2. **Given** que múltiplos processos são gerados, **When** administrador visualiza, **Then** deve ver lista de processos com opção de revisar cada um individualmente
3. **Given** que processos estão relacionados, **When** gerados, **Then** deve haver vínculo indicando que vieram do mesmo contrato
4. **Given** que administrador quer ajustar, **When** revisa, **Then** deve poder mesclar processos ou dividir processo em múltiplos
5. **Given** que todos os processos estão prontos, **When** administrador confirma, **Then** todos devem ser salvos como rascunhos vinculados ao contrato

---

### User Story 10 - Dashboard de Contratos e Processos Gerados (Priority: P3)

Sistema deve exibir dashboard mostrando todos os contratos ingeridos, status de processamento, processos gerados por contrato e métricas de automação.

**Why this priority**: Dashboard melhora visibilidade e gestão mas não é crítico para funcionalidade básica. Útil para monitoramento e análise após implementação core.

**Independent Test**: Pode ser testado acessando dashboard e verificando se dados são exibidos corretamente. O valor entregue é visibilidade e governança.

**Acceptance Scenarios**:

1. **Given** que administrador acessa dashboard, **When** visualiza, **Then** deve ver lista de contratos ingeridos com status: processando, processado, erro, aprovado
2. **Given** que contrato foi processado, **When** dashboard é visualizado, **Then** deve mostrar quantos processos foram gerados e status de cada um
3. **Given** que múltiplos contratos existem, **When** dashboard é filtrado, **Then** deve permitir filtro por fornecedor, tipo de serviço, data de upload
4. **Given** que métricas são calculadas, **When** dashboard é visualizado, **Then** deve mostrar: total de contratos, processos gerados, tempo médio de processamento, taxa de aprovação
5. **Given** que erro ocorreu, **When** dashboard é visualizado, **Then** deve destacar contratos com erro e permitir reprocessamento

---

### Edge Cases

- O que acontece quando contrato está em idioma não suportado ou com formatação complexa?
- Como sistema lida com contratos que não especificam claramente responsabilidades ou escopo?
- O que acontece quando IA não consegue inferir nenhum processo do contrato?
- Como sistema lida com contratos aditivos que modificam contratos anteriores?
- O que acontece quando múltiplas interpretações são possíveis para um serviço?
- Como sistema lida com contratos que mencionam processos que já existem no sistema?
- O que acontece quando fornecedor mencionado no contrato já tem processos existentes?
- Como sistema lida com SLAs e métricas de performance mencionadas no contrato?
- O que acontece quando processo gerado tem conflito com processo existente?
- Como sistema lida com cláusulas de confidencialidade ou restrições de acesso no contrato?
- O que acontece quando contrato tem vigência expirada mas está sendo ingerido?
- Como sistema lida com contratos digitalizados de baixa qualidade ou ilegíveis?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Ingestão de Contratos
- **FR-001**: Sistema MUST permitir upload de contratos em formatos: PDF, DOCX, DOC, PNG, JPG, JPEG
- **FR-002**: Sistema MUST extrair texto completo de contratos PDF com texto nativo
- **FR-003**: Sistema MUST aplicar OCR em contratos digitalizados (imagens e PDFs escaneados)
- **FR-004**: Sistema MUST detectar idioma do contrato (português, inglês, espanhol)
- **FR-005**: Sistema MUST armazenar documento original e texto extraído separadamente
- **FR-006**: Sistema MUST permitir entrada ou edição manual de texto quando extração falha
- **FR-007**: Sistema MUST associar metadados ao contrato: fornecedor, tipo de serviço, data de upload, vigência, valor
- **FR-008**: Sistema MUST validar tamanho máximo de arquivo (ex: 50MB) antes de processar

#### Análise por IA
- **FR-009**: Sistema MUST usar LLM (GPT-4, Claude, ou similar) para analisar texto do contrato
- **FR-010**: Sistema MUST identificar automaticamente: tipo de serviço, escopo de trabalho, responsabilidades, frequência, SLAs
- **FR-011**: Sistema MUST inferir quais processos condominiais são necessários baseado no escopo do contrato
- **FR-012**: Sistema MUST mapear serviços para categorias de processos existentes (Governança, Operação, Segurança, etc.)
- **FR-013**: Sistema MUST indicar nível de confiança da análise (alto, médio, baixo)
- **FR-014**: Sistema MUST permitir revisão e correção da análise da IA antes de gerar processos
- **FR-015**: Sistema MUST extrair informações estruturadas do contrato: cláusulas, obrigações, prazos, penalidades

#### Geração de Processos
- **FR-016**: Sistema MUST gerar processos seguindo template existente (name, category, icon, status, description, workflow, entities, variables, documentType, mermaid_diagram, raci)
- **FR-017**: Sistema MUST gerar workflow com etapas numeradas e descrições claras para cada processo
- **FR-018**: Sistema MUST gerar matriz RACI completa para cada etapa do workflow
- **FR-019**: Sistema MUST garantir que cada etapa do RACI tenha exatamente 1 Accountable (aprovador)
- **FR-020**: Sistema MUST gerar diagrama Mermaid com responsáveis indicados em cada nó
- **FR-021**: Sistema MUST aplicar cores corretas no diagrama Mermaid (azul: execução, verde: aprovação, vermelho: urgência)
- **FR-022**: Sistema MUST identificar e listar entidades envolvidas no processo
- **FR-023**: Sistema MUST validar se entidades existem no cadastro antes de associar ao processo
- **FR-024**: Sistema MUST sugerir criação de novas entidades quando necessário
- **FR-025**: Sistema MUST identificar e mapear variáveis do sistema mencionadas no contrato
- **FR-026**: Sistema MUST sugerir criação de novas variáveis quando necessário
- **FR-027**: Sistema MUST definir categoria e ícone apropriados para cada processo gerado
- **FR-028**: Sistema MUST definir tipo de documento (Manual, POP, Regulamento, Formulário) baseado no escopo

#### Múltiplos Processos
- **FR-029**: Sistema MUST permitir geração de múltiplos processos quando contrato tem múltiplos serviços
- **FR-030**: Sistema MUST vincular todos os processos gerados ao contrato de origem
- **FR-031**: Sistema MUST permitir que administrador mescle ou divida processos durante revisão

#### Revisão e Edição
- **FR-032**: Sistema MUST permitir que administrador revise todos os campos do processo gerado
- **FR-033**: Sistema MUST permitir edição de qualquer campo: workflow, RACI, entidades, variáveis, diagrama
- **FR-034**: Sistema MUST validar consistência entre workflow e RACI (todas as etapas do workflow devem ter entrada RACI)
- **FR-035**: Sistema MUST validar sintaxe do diagrama Mermaid antes de salvar
- **FR-036**: Sistema MUST salvar processo como "rascunho" após geração automática
- **FR-037**: Sistema MUST permitir envio do processo para workflow de aprovação após revisão

#### Dashboard e Gestão
- **FR-038**: Sistema MUST exibir lista de todos os contratos ingeridos
- **FR-039**: Sistema MUST exibir status de cada contrato: processando, processado, erro, aprovado
- **FR-040**: Sistema MUST exibir lista de processos gerados por cada contrato
- **FR-041**: Sistema MUST permitir filtros por fornecedor, tipo de serviço, data, status
- **FR-042**: Sistema MUST exibir métricas: total de contratos, processos gerados, tempo médio de processamento
- **FR-043**: Sistema MUST permitir reprocessamento de contratos com erro
- **FR-044**: Sistema MUST permitir download do contrato original

#### Notificações e Alertas
- **FR-045**: Sistema MUST notificar administrador quando contrato é processado com sucesso
- **FR-046**: Sistema MUST notificar administrador quando ocorre erro no processamento
- **FR-047**: Sistema MUST notificar quando processos gerados são aprovados no workflow

#### Histórico e Auditoria
- **FR-048**: Sistema MUST manter histórico completo: upload, extração, análise, geração, edições, aprovação
- **FR-049**: Sistema MUST registrar quem fez upload, quem revisou, quem aprovou cada processo gerado
- **FR-050**: Sistema MUST permitir visualização de timeline completa do contrato

### Key Entities

- **Contrato de Fornecedor**: Representa contrato ingerido. Atributos: id, fornecedor, tipo_servico, documento_original_url, texto_extraido, data_upload, data_vigencia_inicio, data_vigencia_fim, valor_mensal, status_processamento (processando, processado, erro), nivel_confianca_ia, usuario_upload, metadados. Relacionamentos: processos_gerados, fornecedor_entidade, historico_processamento.

- **Análise de Contrato**: Representa resultado da análise por IA. Atributos: id, contrato_id, servicos_identificados (JSON), escopo_trabalho (JSON), responsabilidades (JSON), frequencias (JSON), slas (JSON), processos_inferidos (JSON array), nivel_confianca, modelo_ia_usado, tempo_processamento, data_analise. Relacionamentos: contrato.

- **Processo Gerado**: Estende modelo Process existente. Atributos adicionais: contrato_origem_id, gerado_automaticamente (boolean), revisado_por, data_revisao, editado (boolean), nivel_confianca_geracao. Relacionamentos: contrato_origem, versoes_editadas.

- **Entidade Sugerida**: Representa sugestão de nova entidade extraída do contrato. Atributos: id, contrato_id, nome_sugerido, tipo_entidade, dados_extraidos (JSON), status (pendente, aprovada, rejeitada), criada_entidade_id. Relacionamentos: contrato, entidade_criada.

- **Variável Sugerida**: Representa sugestão de nova variável identificada. Atributos: id, contrato_id, nome_variavel, tipo_variavel, valor_sugerido, descricao, status (pendente, aprovada, rejeitada). Relacionamentos: contrato.

- **Histórico de Processamento**: Representa evento no processamento do contrato. Atributos: id, contrato_id, tipo_evento (upload, extracao, analise, geracao_processo, edicao, aprovacao, erro), detalhes (JSON), usuario, data_hora. Relacionamentos: contrato.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sistema consegue extrair texto de 95%+ dos contratos em PDF com texto nativo sem erros significativos

- **SC-002**: OCR consegue extrair texto legível de 85%+ dos contratos digitalizados com qualidade mínima aceitável

- **SC-003**: IA identifica corretamente tipo de serviço e escopo em 90%+ dos contratos analisados (validado por revisão humana)

- **SC-004**: IA gera workflow com etapas lógicas e executáveis em 85%+ dos processos sem necessidade de edição significativa

- **SC-005**: Matriz RACI gerada automaticamente está completa (todos os papéis definidos) em 90%+ dos processos

- **SC-006**: Diagrama Mermaid gerado renderiza corretamente em 95%+ dos casos sem erros de sintaxe

- **SC-007**: Validação de entidades identifica 100% das entidades inexistentes e previne referências quebradas

- **SC-008**: Tempo total de processamento (upload → análise → geração) é < 3 minutos para contrato de até 50 páginas

- **SC-009**: Administrador consegue revisar e editar processo gerado em < 10 minutos em média

- **SC-010**: 80%+ dos processos gerados automaticamente são aprovados no workflow com edições mínimas ou sem edições

- **SC-011**: Sistema reduz tempo de criação manual de processos em 70%+ comparado com método tradicional

- **SC-012**: Dashboard exibe status atualizado de todos os contratos em tempo real com latência < 2 segundos

---

## Assumptions

- LLM API está disponível (OpenAI GPT-4, Anthropic Claude, ou similar) com rate limits adequados
- Contratos fornecidos estão em português brasileiro ou inglês
- Contratos seguem formato padrão de contratos comerciais (cláusulas estruturadas)
- Qualidade de digitalização de contratos escaneados é suficiente para OCR (mínimo 300 DPI)
- Administrador tem conhecimento básico dos processos condominiais para revisar saída da IA
- Sistema de processos e entidades já existe e está funcional
- Workflow de aprovação já existe e está funcional
- Armazenamento de arquivos (documentos originais) está configurado (S3, local storage, etc.)
- Custos de API do LLM são aceitáveis para volume esperado de contratos

---

## Dependencies

- **Externas**:
  - LLM API (OpenAI GPT-4, Anthropic Claude, ou equivalente)
  - OCR engine (Tesseract, Google Vision API, AWS Textract, ou similar)
  - PDF parsing library (PyPDF2, pdfplumber, ou similar)
  - DOCX parsing library (python-docx)
  
- **Internas**:
  - Sistema de processos (Process model) - já existe
  - Sistema de entidades (Entity model) - já existe
  - Sistema de validação de entidades - já existe (feature 004)
  - Workflow de aprovação - já existe (feature 003)
  - Base de conhecimento - opcional para treinar IA com processos existentes (feature 005)
  - Sistema de autenticação e autorização - já existe
  - Armazenamento de arquivos (file storage)

---

## Out of Scope

- Análise jurídica completa de cláusulas contratuais (apenas extração de informações operacionais)
- Negociação ou gestão de renovação de contratos
- Gestão financeira de pagamentos a fornecedores
- Integração com sistemas de gestão de fornecedores externos
- Assinatura digital ou certificação de contratos
- Análise de compliance e conformidade legal
- Tradução automática de contratos em outros idiomas
- Comparação automática entre contratos (detectar mudanças em aditivos)
- Alertas de vencimento de contratos (pode ser feature futura)
- Gestão de SLAs e KPIs de fornecedores (pode ser feature futura)
- Integração com sistemas de tickets ou chamados para execução de processos
- Geração automática de relatórios de desempenho de fornecedores

---

## Open Questions

1. **Qual LLM usar?** OpenAI GPT-4 (melhor qualidade, mais caro), Claude Sonnet (ótimo custo-benefício), ou modelo local/open-source (mais barato, menos qualidade)?

2. **Qual OCR usar?** Google Vision API (melhor qualidade, requer Google Cloud), AWS Textract (excelente para documentos, requer AWS), ou Tesseract (gratuito, qualidade inferior)?

3. **Como treinar/calibrar IA?** Usar few-shot learning com exemplos de contratos e processos, ou fine-tuning de modelo com base de processos existentes?

4. **Validação humana obrigatória?** Processos gerados devem sempre passar por revisão humana antes de ir para aprovação, ou permitir aprovação automática com alta confiança?

5. **Reprocessamento?** Se contrato for reprocessado, o que acontece com processos já gerados e potencialmente aprovados?

6. **Múltiplas versões de contrato?** Sistema deve detectar e vincular aditivos contratuais a contratos originais?

7. **Privacidade de dados?** Contratos podem conter informações sensíveis. Como garantir que dados não sejam armazenados pelo LLM provider?

8. **Fallback?** Se LLM API estiver indisponível, sistema deve permitir entrada manual completa ou apenas notificar erro?

9. **Idiomas?** Priorizar suporte apenas para português brasileiro inicialmente, ou incluir inglês e espanhol desde o início?

10. **Custos?** Qual budget por contrato processado? Estimar tokens usados e custo por análise para avaliar viabilidade.
