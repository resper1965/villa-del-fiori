# Quickstart: Aplicação de Gestão de Processos Condominiais

**Feature**: `003-app-gestao-processos-aprovacao`  
**Date**: 2024-12-08

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Docker e Docker Compose (opcional, mas recomendado)
- Git

## Setup Rápido

### 1. Clone e Configure o Repositório

```bash
git clone <repository-url>
cd villadelfiori
```

### 2. Backend Setup

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações:
# - DATABASE_URL
# - SECRET_KEY
# - SMTP settings

# Executar migrations
alembic upgrade head

# Seed dados iniciais (processos pré-cadastrados)
python -m app.services.seed_service

# Iniciar servidor de desenvolvimento
uvicorn app.main:app --reload --port 8000
```

Backend estará disponível em: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Iniciar servidor de desenvolvimento
npm run dev
```

Frontend estará disponível em: http://localhost:3000

### 4. Setup com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d

# Executar migrations
docker-compose exec backend alembic upgrade head

# Seed dados iniciais
docker-compose exec backend python -m app.services.seed_service
```

## Primeiro Acesso

### 1. Criar Usuário Administrador

```bash
# Via CLI do backend
python -m app.cli create_admin --email admin@condominio.com --name "Administrador"
```

### 2. Login

1. Acesse http://localhost:3000/login
2. Use as credenciais do administrador criado
3. Você será redirecionado para o dashboard

### 3. Configurar Stakeholders

1. Acesse "Stakeholders" no menu
2. Crie stakeholders (síndico, conselheiros, administradora)
3. Atribua permissões (Aprovador, Visualizador, Editor)

### 4. Explorar Processos Pré-cadastrados

1. Acesse "Processos" no menu
2. Explore processos organizados por categoria
3. Visualize detalhes de um processo
4. Teste workflow de aprovação

## Estrutura de Desenvolvimento

### Backend

```
backend/
├── src/app/
│   ├── api/v1/endpoints/    # Endpoints da API
│   ├── core/                # Config, security, database
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── services/            # Lógica de negócio
├── alembic/                 # Migrations
└── tests/                   # Testes
```

### Frontend

```
frontend/
├── src/app/                 # Next.js App Router
├── components/              # Componentes React
├── lib/                     # Utilitários, hooks, API client
└── types/                   # TypeScript types
```

## Comandos Úteis

### Backend

```bash
# Rodar testes
pytest

# Criar nova migration
alembic revision --autogenerate -m "description"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Seed dados
python -m app.services.seed_service
```

### Frontend

```bash
# Rodar testes
npm test

# Testes E2E
npm run test:e2e

# Build para produção
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

## Fluxo de Desenvolvimento

### 1. Criar Nova Feature

1. Criar branch: `git checkout -b feature/nome-da-feature`
2. Implementar backend (models, schemas, endpoints, services)
3. Implementar frontend (components, pages, hooks)
4. Escrever testes
5. Testar localmente
6. Criar PR

### 2. Workflow de Aprovação (Exemplo)

1. Criar processo em status "Rascunho"
2. Editar e salvar processo
3. Enviar para aprovação (status → "Em Revisão")
4. Stakeholders recebem notificação
5. Stakeholder aprova ou rejeita
6. Se aprovado por todos → status "Aprovado"
7. Se rejeitado → status "Rejeitado", criador pode refazer

### 3. Testar Workflow Completo

```bash
# 1. Criar processo via API
curl -X POST http://localhost:8000/api/v1/processes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Processo",
    "category": "governanca",
    "document_type": "pop"
  }'

# 2. Enviar para aprovação
curl -X POST http://localhost:8000/api/v1/processes/{id}/submit \
  -H "Authorization: Bearer <token>"

# 3. Aprovar como stakeholder
curl -X POST http://localhost:8000/api/v1/processes/{id}/approve \
  -H "Authorization: Bearer <stakeholder_token>" \
  -H "Content-Type: application/json" \
  -d '{"comments": "Aprovado"}'
```

## Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs
docker-compose logs postgres

# Recriar banco
docker-compose down -v
docker-compose up -d
alembic upgrade head
```

### Erro de Migrations

```bash
# Verificar status
alembic current

# Ver histórico
alembic history

# Resolver conflitos manualmente se necessário
```

### Frontend não conecta ao Backend

1. Verificar `NEXT_PUBLIC_API_URL` no `.env.local`
2. Verificar se backend está rodando na porta 8000
3. Verificar CORS no backend

## Próximos Passos

1. Explorar processos pré-cadastrados
2. Criar primeiro processo de teste
3. Configurar stakeholders e permissões
4. Testar workflow completo de aprovação
5. Personalizar variáveis do sistema
6. Configurar notificações por email

## Recursos Adicionais

- API Documentation: http://localhost:8000/docs
- Database Admin: Usar pgAdmin ou DBeaver
- Logs: `docker-compose logs -f backend` ou `docker-compose logs -f frontend`


