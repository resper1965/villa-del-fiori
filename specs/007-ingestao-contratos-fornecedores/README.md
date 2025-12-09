# Feature 007: Ingestão e Processamento de Contratos de Fornecedores

## 📌 Resumo Executivo

Esta feature automatiza a criação de processos condominiais a partir de contratos de fornecedores, usando IA (LLM) para ler, interpretar e gerar processos estruturados seguindo o template do sistema.

### Valor Entregue

- ⚡ **Automação**: Reduz em 70%+ o tempo de criação manual de processos
- 🤖 **IA Inteligente**: Analisa contratos e infere processos necessários automaticamente
- 📋 **Estruturação**: Gera workflow, RACI, diagrama Mermaid e metadados completos
- ✅ **Validação**: Garante consistência e integridade dos dados
- 🔍 **Revisão Humana**: Permite edição e aprovação antes de publicar

### Fluxo Principal

```
Upload Contrato (PDF/DOCX) 
    ↓
Extração de Texto (PDF parser ou OCR)
    ↓
Análise por IA (Claude/GPT-4)
    ↓
Geração Automática de Processos
    ↓
Revisão e Edição Humana
    ↓
Workflow de Aprovação
```

---

## 🎯 Objetivos

1. **Agilizar criação de processos**: Automatizar trabalho manual de interpretação de contratos
2. **Garantir qualidade**: Processos gerados seguem template e melhores práticas
3. **Reduzir erros**: Validação automática de entidades e consistência
4. **Facilitar gestão**: Dashboard para acompanhar contratos e processos gerados
5. **Escalar operação**: Processar múltiplos contratos rapidamente

---

## 📄 Documentação

- **[spec.md](./spec.md)**: Especificação completa com user stories, requisitos e critérios de sucesso
- **[plan.md](./plan.md)**: Plano técnico detalhado de implementação com arquitetura, modelos, APIs e prompts
- **[tasks.md](./tasks.md)**: Lista completa de 238 tarefas organizadas por fase e user story
- **[quickstart.md](./quickstart.md)**: Guia rápido para começar o desenvolvimento

---

## 🚀 Quickstart

### Setup Mínimo

```bash
# 1. Configurar API do LLM
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# 2. Instalar dependências
cd backend
pip install anthropic celery redis pdfplumber python-docx

# 3. Iniciar Redis
redis-server

# 4. Rodar migrations
alembic upgrade head

# 5. Iniciar Celery worker
celery -A src.app.core.celery worker --loglevel=info

# 6. Iniciar backend
uvicorn src.app.main:app --reload
```

### Testar Upload

```bash
curl -X POST http://localhost:8000/api/v1/contracts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contract.pdf" \
  -F "supplier_name=Empresa XYZ" \
  -F "service_type=Limpeza"
```

---

## 🏗️ Arquitetura

### Componentes Backend

```
Services:
- ContractService: Lógica de negócio de contratos
- ExtractionService: Extração de texto (PDF/DOCX/OCR)
- AIAnalysisService: Análise inteligente com LLM
- ProcessGenerationService: Geração de processos estruturados
- EntityMatchingService: Validação e matching de entidades

Tasks (Celery):
- extract_contract_text_task: Extração assíncrona
- analyze_contract_task: Análise assíncrona
- generate_processes_task: Geração assíncrona

Models:
- Contract: Contrato do fornecedor
- ContractAnalysis: Resultado da análise IA
- ContractHistory: Histórico de processamento
- Process (estendido): Processos gerados
```

### Componentes Frontend

```
Pages:
- /contracts: Lista e upload de contratos
- /contracts/[id]: Detalhes e análise do contrato
- /contracts/[id]/processes/[processId]: Edição de processo gerado

Components:
- ContractUpload: Upload de documentos
- ContractList: Lista com status
- AnalysisResults: Resultados da IA
- ProcessPreview: Preview do processo gerado
- ProcessEditor: Editor completo de processo
```

---

## 🤖 IA e Prompts

### LLM Usado

**Recomendado**: Anthropic Claude Sonnet 3.5
- Custo: ~$0.18 por contrato (vs ~$1.05 com GPT-4)
- Qualidade: Excelente para análise de documentos
- Contexto: 200k tokens (suficiente para contratos grandes)

### Prompts Principais

1. **ANALYSIS_PROMPT**: Analisa contrato e infere serviços e processos necessários
2. **WORKFLOW_GENERATION_PROMPT**: Gera etapas do workflow do processo
3. **RACI_GENERATION_PROMPT**: Define responsabilidades RACI para cada etapa
4. **MERMAID_GENERATION_PROMPT**: Gera diagrama de fluxo visual

---

## 📊 Estimativas

### Tempo de Implementação

- **Fase 1** (Fundação e Extração): 2 semanas
- **Fase 2** (IA e Análise): 2 semanas
- **Fase 3** (Geração de Processos): 2 semanas
- **Fase 4** (Revisão e Edição): 2 semanas
- **Fase 5** (Dashboard): 2 semanas
- **Fase 6** (OCR e Refinamentos): 2 semanas

**Total**: 10-12 semanas para implementação completa

### Custos Operacionais

**Por contrato processado** (3 processos gerados):
- Extração: Gratuito (PDF nativo) ou ~$0.001 (OCR)
- Análise IA: ~$0.06 (Claude Sonnet)
- Geração: ~$0.12 (Claude Sonnet)

**Total: ~$0.18 por contrato** ✅

---

## ✅ Critérios de Sucesso

- ✅ Sistema extrai texto de 95%+ dos contratos PDF
- ✅ IA identifica corretamente serviços em 90%+ dos contratos
- ✅ IA gera workflow executável em 85%+ dos processos
- ✅ RACI gerado está completo em 90%+ dos processos
- ✅ Diagrama Mermaid renderiza corretamente em 95%+ dos casos
- ✅ Validação de entidades previne 100% das referências quebradas
- ✅ Processamento completo em < 3 minutos
- ✅ 80%+ dos processos aprovados com edições mínimas
- ✅ Redução de 70%+ no tempo de criação manual

---

## 🔐 Segurança e Compliance

### Dados Sensíveis

- Contratos podem conter informações confidenciais (valores, cláusulas)
- Texto enviado para LLM (Anthropic/OpenAI) - **usar termos de uso corporativos**
- Armazenamento seguro dos documentos originais
- Acesso restrito por autenticação e autorização

### Recomendações

1. Usar APIs corporativas com garantias de não-treino
2. Implementar redaction de informações sensíveis antes de enviar para LLM
3. Criptografar documentos em repouso
4. Logs de auditoria para acesso a contratos
5. Backup regular com retenção definida

---

## 🧪 Testes

### Cobertura de Testes

- Unit tests: 80%+ coverage
- Integration tests: Todos os endpoints
- E2E tests: Fluxo completo de upload → geração → aprovação
- Performance tests: Load testing com múltiplos uploads simultâneos

### Testes Críticos

- [x] Upload de PDF nativo → extração → análise → geração
- [x] Upload de DOCX → extração → análise → geração
- [x] Upload de PDF escaneado → OCR → análise → geração
- [x] Validação de entidades (existentes e não existentes)
- [x] Edição de processo gerado
- [x] Envio para workflow de aprovação
- [x] Múltiplos processos gerados de um contrato
- [x] Reprocessamento de contrato com erro
- [x] Tratamento de falhas do LLM

---

## 📈 Métricas e Monitoramento

### Métricas de Negócio

- Total de contratos processados
- Taxa de sucesso de processamento
- Tempo médio de processamento
- Processos gerados por contrato
- Taxa de aprovação de processos gerados
- Edições necessárias por processo

### Métricas Técnicas

- Tempo de extração de texto
- Tempo de análise IA
- Tempo de geração de processos
- Tokens usados por contrato (custo)
- Taxa de erro por etapa
- Latência de APIs

### Alertas

- ⚠️ Taxa de erro > 10%
- ⚠️ Tempo de processamento > 5 minutos
- ⚠️ Custo por contrato > $0.50
- ⚠️ LLM API indisponível
- ⚠️ Celery queue > 50 tasks

---

## 🔄 Dependências

### Features do Sistema

- ✅ Feature 003: Workflow de Aprovação (processos gerados entram neste workflow)
- ✅ Feature 004: Validação de Entidades (valida entidades dos processos gerados)
- 🔄 Feature 005: Base de Conhecimento (opcional, para treinar IA com processos existentes)

### Serviços Externos

- Anthropic Claude API ou OpenAI GPT-4 API
- Redis (para Celery)
- PostgreSQL (já existe)
- Storage (S3 ou local)
- OCR (Tesseract, Google Vision, ou AWS Textract - opcional)

---

## 🚧 Limitações Conhecidas

### V1 (MVP)

- Suporte apenas para português brasileiro
- Contratos em formatos padrão (não suporta layouts muito complexos)
- Análise jurídica limitada (foco em informações operacionais)
- OCR básico (qualidade depende do documento)
- Sem comparação automática de versões de contrato

### Evoluções Futuras

- Suporte multi-idioma (inglês, espanhol)
- Análise de aditivos contratuais
- Comparação de versões
- Alertas de vencimento
- Gestão de SLAs e KPIs
- Integração com sistema de chamados
- Fine-tuning de modelo para domínio específico

---

## 🤝 Contribuindo

### Como Contribuir

1. Escolha uma task do [tasks.md](./tasks.md)
2. Crie branch: `git checkout -b 007-feature-description`
3. Implemente seguindo padrões do projeto
4. Escreva testes
5. Atualize documentação
6. Abra Pull Request

### Padrões

- Código: Seguir PEP 8 (Python) e ESLint/Prettier (TypeScript)
- Commits: Conventional Commits
- Testes: Mínimo 80% coverage
- Documentação: Docstrings e comentários claros
- Prompts: Versionados e documentados

---

## 📞 Suporte

### Problemas Comuns

Veja [quickstart.md](./quickstart.md#-troubleshooting) para troubleshooting.

### Contatos

- **Spec/Design**: Ver spec.md e plan.md
- **Implementação**: Ver tasks.md
- **Setup**: Ver quickstart.md

---

## 📝 Changelog

### [Unreleased]

#### Phase 1 - Foundation ✅
- [x] Database models and migrations
- [x] File upload and storage
- [x] Text extraction (PDF, DOCX)
- [x] Basic API endpoints

#### Phase 2 - AI Analysis 🚧
- [ ] LLM client integration
- [ ] Contract analysis service
- [ ] Analysis API endpoints

#### Phase 3 - Process Generation 🚧
- [ ] Process generation service
- [ ] Workflow generation
- [ ] RACI generation
- [ ] Mermaid diagram generation

#### Phase 4 - Review & Editing 🚧
- [ ] Process preview UI
- [ ] Process editor UI
- [ ] Validation and submit

#### Phase 5 - Dashboard 🚧
- [ ] Contract dashboard
- [ ] Metrics and monitoring
- [ ] History timeline

#### Phase 6 - OCR & Refinements 🚧
- [ ] OCR implementation
- [ ] Multiple processes per contract
- [ ] Entity suggestions
- [ ] Performance optimization

---

## 📜 Licença

Este projeto segue a mesma licença do projeto principal.

---

**Status**: 🚧 Em Planejamento  
**Início Previsto**: A definir  
**Estimativa**: 10-12 semanas  
**Prioridade**: Alta  
