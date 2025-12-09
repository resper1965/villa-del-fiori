# Quickstart: Ingestão de Contratos de Fornecedores

Este guia rápido ajuda você a começar com a implementação da feature de ingestão e processamento automático de contratos de fornecedores.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Backend FastAPI funcionando
- [ ] Frontend Next.js funcionando
- [ ] PostgreSQL configurado
- [ ] Conta Anthropic (Claude API) ou OpenAI (GPT-4 API)
- [ ] Redis instalado (para Celery)
- [ ] Python 3.11+
- [ ] Node.js 18+

---

## 🚀 Setup Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# backend/.env

# LLM Configuration (escolha um)
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
# ou
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-your-key-here

LLM_MODEL=claude-sonnet-3-5
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=4000

# OCR Configuration (opcional, para PDFs escaneados)
OCR_PROVIDER=tesseract  # gratuito
# ou
# OCR_PROVIDER=google_vision
# GOOGLE_VISION_API_KEY=your-key-here

# File Storage
STORAGE_BACKEND=local
LOCAL_STORAGE_PATH=/app/storage/contracts
MAX_FILE_SIZE_MB=50

# Celery & Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Database (já existente)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Instalar Dependências Backend

```bash
cd backend

# Adicionar ao requirements.txt:
# pip install anthropic  # ou openai
# pip install celery[redis]
# pip install redis
# pip install pdfplumber
# pip install python-docx
# pip install pytesseract  # para OCR
# pip install pillow  # para processamento de imagens

pip install -r requirements.txt
```

### 3. Instalar Redis (se ainda não tiver)

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Rodar Migrations

```bash
cd backend

# Criar migration
alembic revision --autogenerate -m "Add contracts tables"

# Aplicar migration
alembic upgrade head
```

### 5. Iniciar Celery Worker

```bash
cd backend

# Terminal 1: Celery worker
celery -A src.app.core.celery worker --loglevel=info

# Terminal 2: Backend API
uvicorn src.app.main:app --reload
```

### 6. Iniciar Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## 🧪 Testar Rapidamente

### 1. Upload de Contrato via API

```bash
# Upload de um contrato
curl -X POST http://localhost:8000/api/v1/contracts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/contract.pdf" \
  -F "supplier_name=Empresa XYZ Limpeza" \
  -F "service_type=Limpeza"
```

### 2. Verificar Status

```bash
# Listar contratos
curl http://localhost:8000/api/v1/contracts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver detalhes
curl http://localhost:8000/api/v1/contracts/{contract_id} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver análise
curl http://localhost:8000/api/v1/contracts/{contract_id}/analysis \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver processos gerados
curl http://localhost:8000/api/v1/contracts/{contract_id}/processes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Testar via Frontend

1. Acesse http://localhost:3000/contracts
2. Faça upload de um contrato PDF
3. Aguarde processamento (veja status mudando: uploaded → extracting → analyzing → generating → review)
4. Clique no contrato para ver análise
5. Revise processos gerados
6. Edite processo se necessário
7. Envie para aprovação

---

## 📂 Estrutura de Arquivos

```
backend/
├── src/app/
│   ├── models/
│   │   ├── contract.py               # Novo
│   │   └── contract_analysis.py      # Novo
│   ├── schemas/
│   │   └── contract.py                # Novo
│   ├── services/
│   │   ├── contract_service.py        # Novo
│   │   ├── extraction_service.py      # Novo
│   │   ├── ai_analysis_service.py     # Novo
│   │   ├── process_generation_service.py  # Novo
│   │   └── entity_matching_service.py  # Novo
│   ├── tasks/
│   │   └── contract_tasks.py          # Novo
│   ├── api/v1/endpoints/
│   │   └── contracts.py               # Novo
│   └── utils/
│       └── llm_client.py              # Novo
└── alembic/versions/
    └── 007_add_contracts_table.py     # Novo

frontend/
├── src/
│   ├── app/(dashboard)/
│   │   └── contracts/
│   │       ├── page.tsx                      # Novo
│   │       └── [id]/
│   │           ├── page.tsx                  # Novo
│   │           └── processes/[processId]/
│   │               └── page.tsx              # Novo
│   ├── components/contracts/
│   │   ├── ContractUpload.tsx         # Novo
│   │   ├── ContractList.tsx           # Novo
│   │   ├── ContractDetails.tsx        # Novo
│   │   ├── AnalysisResults.tsx        # Novo
│   │   ├── ProcessPreview.tsx         # Novo
│   │   └── ProcessEditor.tsx          # Novo
│   └── lib/api/
│       └── contracts.ts               # Novo
```

---

## 🔧 Desenvolvimento Incremental

### Fase 1: Começar com o Básico

1. **Criar Models**
   ```bash
   # Comece criando os modelos básicos
   touch backend/src/app/models/contract.py
   ```

2. **Criar Migration**
   ```bash
   alembic revision --autogenerate -m "Add contracts"
   alembic upgrade head
   ```

3. **Implementar Upload**
   ```bash
   # Criar service de upload simples
   touch backend/src/app/services/contract_service.py
   # Criar endpoint de upload
   touch backend/src/app/api/v1/endpoints/contracts.py
   ```

4. **Testar Upload**
   ```bash
   # Teste via curl ou Postman
   # Veja se arquivo é salvo e registro criado no DB
   ```

### Fase 2: Extração de Texto

1. **Implementar ExtractionService**
   ```bash
   touch backend/src/app/services/extraction_service.py
   ```

2. **Testar Extração Manualmente**
   ```python
   # backend/test_extraction.py
   from src.app.services.extraction_service import ExtractionService
   
   service = ExtractionService()
   result = service.extract_text("path/to/contract.pdf", "application/pdf")
   print(result["text"])
   ```

3. **Criar Task Assíncrona**
   ```bash
   touch backend/src/app/tasks/contract_tasks.py
   ```

### Fase 3: Análise com IA

1. **Criar LLM Client**
   ```bash
   touch backend/src/app/utils/llm_client.py
   ```

2. **Testar LLM Localmente**
   ```python
   # backend/test_llm.py
   from src.app.utils.llm_client import LLMClient
   
   client = LLMClient()
   response = client.generate("Olá, você está funcionando?")
   print(response)
   ```

3. **Implementar AIAnalysisService**
   ```bash
   touch backend/src/app/services/ai_analysis_service.py
   ```

4. **Testar Análise com Contrato Real**
   ```python
   # backend/test_analysis.py
   from src.app.services.ai_analysis_service import AIAnalysisService
   
   with open("contract.txt") as f:
       text = f.read()
   
   service = AIAnalysisService()
   result = service.analyze_contract(text)
   print(json.dumps(result, indent=2, ensure_ascii=False))
   ```

### Fase 4: Geração de Processos

1. **Implementar ProcessGenerationService**
   ```bash
   touch backend/src/app/services/process_generation_service.py
   ```

2. **Testar Geração de Workflow**
   ```python
   # backend/test_generation.py
   from src.app.services.process_generation_service import ProcessGenerationService
   
   service = ProcessGenerationService()
   
   process_info = {
       "name": "Limpeza de Áreas Comuns",
       "category": "Operação",
       "description": "Limpeza diária..."
   }
   
   workflow = service.generate_workflow(process_info, {}, {})
   print(workflow)
   
   raci = service.generate_raci(process_info, workflow, {}, "Fornecedor XYZ")
   print(raci)
   
   mermaid = service.generate_mermaid_diagram(workflow, raci)
   print(mermaid)
   ```

### Fase 5: Frontend

1. **Criar Página de Upload**
   ```bash
   mkdir -p frontend/src/app/\(dashboard\)/contracts
   touch frontend/src/app/\(dashboard\)/contracts/page.tsx
   ```

2. **Criar Componente de Upload**
   ```bash
   mkdir -p frontend/src/components/contracts
   touch frontend/src/components/contracts/ContractUpload.tsx
   ```

3. **Testar Upload via UI**
   - Abrir http://localhost:3000/contracts
   - Fazer upload de PDF
   - Verificar no DB se foi criado

---

## 🐛 Troubleshooting

### Redis não conecta

```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Se não estiver, iniciar
sudo systemctl start redis
# ou
redis-server
```

### Celery não processa tasks

```bash
# Verificar logs do Celery
celery -A src.app.core.celery worker --loglevel=debug

# Verificar tasks pendentes no Redis
redis-cli
> KEYS *
> LLEN celery  # ver quantas tasks na fila
```

### LLM retorna erro

```bash
# Verificar chave API
echo $ANTHROPIC_API_KEY

# Testar manualmente
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-3-5-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Extração de PDF falha

```bash
# Verificar se pdfplumber está instalado
python -c "import pdfplumber; print('OK')"

# Testar manualmente
python
>>> import pdfplumber
>>> with pdfplumber.open("contract.pdf") as pdf:
...     text = pdf.pages[0].extract_text()
...     print(text)
```

### OCR não funciona

```bash
# Instalar Tesseract
sudo apt-get install tesseract-ocr tesseract-ocr-por  # Ubuntu
brew install tesseract tesseract-lang  # macOS

# Testar
tesseract --version

# Testar OCR manualmente
tesseract image.png output -l por
cat output.txt
```

---

## 📊 Monitorar Processamento

### Via Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Celery logs
celery -A src.app.core.celery worker --loglevel=info

# Redis monitor
redis-cli monitor
```

### Via Database

```sql
-- Ver contratos e status
SELECT id, supplier_name, status, uploaded_at, processed_at 
FROM contracts 
ORDER BY uploaded_at DESC 
LIMIT 10;

-- Ver análises
SELECT c.supplier_name, ca.confidence_score, ca.analyzed_at
FROM contracts c
JOIN contract_analyses ca ON ca.contract_id = c.id
ORDER BY ca.analyzed_at DESC;

-- Ver processos gerados
SELECT p.name, p.category, p.auto_generated, p.generation_confidence
FROM processes p
WHERE p.source_contract_id IS NOT NULL
ORDER BY p.created_at DESC;

-- Ver histórico de processamento
SELECT ch.event_type, ch.created_at, ch.event_details
FROM contract_history ch
WHERE ch.contract_id = 'your-contract-id'
ORDER BY ch.created_at;
```

---

## 🎯 Próximos Passos

Após setup inicial funcionando:

1. ✅ Refinar prompts para melhor qualidade
2. ✅ Adicionar validações e tratamento de erros
3. ✅ Implementar frontend completo
4. ✅ Adicionar testes automatizados
5. ✅ Otimizar performance (cache, indexes)
6. ✅ Adicionar OCR para documentos escaneados
7. ✅ Implementar dashboard de métricas
8. ✅ Documentar e preparar para produção

---

## 📚 Recursos Úteis

### APIs

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Celery Docs](https://docs.celeryq.dev/)

### Bibliotecas

- [pdfplumber](https://github.com/jsvine/pdfplumber)
- [python-docx](https://python-docx.readthedocs.io/)
- [pytesseract](https://github.com/madmaze/pytesseract)

### Tutoriais

- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Celery with FastAPI](https://testdriven.io/blog/fastapi-and-celery/)
- [LLM Prompt Engineering](https://www.promptingguide.ai/)

---

## 💡 Dicas

1. **Comece simples**: Teste cada componente isoladamente antes de integrar
2. **Use mocks**: Mocke LLM nas primeiras iterações para economizar custos
3. **Logs são seus amigos**: Adicione logs detalhados em cada etapa
4. **Valide tudo**: Sempre valide entrada e saída de LLM
5. **Custos**: Monitore uso de tokens do LLM (pode ficar caro!)
6. **Retry logic**: Implemente retry para chamadas LLM (podem falhar temporariamente)
7. **Timeout**: Configure timeout adequado (LLM pode demorar)
8. **Versionamento**: Mantenha prompts versionados (podem precisar ajustes)

---

## 🆘 Ajuda

Se tiver problemas:

1. Verifique logs do backend e Celery
2. Verifique se Redis está rodando
3. Verifique se chaves API estão corretas
4. Teste componentes isoladamente
5. Consulte spec.md e plan.md para detalhes
6. Veja tasks.md para checklist de implementação

Boa sorte! 🚀
