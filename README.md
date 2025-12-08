# Gestão de Processos Condominiais

Sistema de gestão de processos condominiais com workflow de aprovação.

## Estrutura do Projeto

```
villadelfiori/
├── backend/          # API FastAPI
├── frontend/         # Next.js App
├── specs/            # Especificações e documentação
└── docker-compose.yml
```

## Autenticação

O sistema usa autenticação simples apenas com senha:
- **Senha**: `cvdf2025`

## Setup Rápido

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

pip install -r requirements.txt

# Configurar .env (copiar de .env.example)
cp .env.example .env

# Rodar servidor
uvicorn src.app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# Configurar .env.local
cp .env.example .env.local

# Rodar servidor
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## Acesso

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Login

Acesse http://localhost:3000/login e use a senha: `cvdf2025`

