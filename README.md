# Gestão de Processos Condominiais

Sistema de gestão de processos condominiais com workflow de aprovação.

## Estrutura do Projeto

```
villadelfiori/
├── backend/          # API FastAPI
├── frontend/         # Next.js App (deploy na Vercel)
├── specs/            # Especificações e documentação
└── docker-compose.yml
```

## Deploy na Vercel

O frontend está configurado para deploy automático na Vercel:

1. **Root Directory**: `frontend`
2. **Framework**: Next.js (detectado automaticamente)
3. **Build Command**: `npm run build` (automático)
4. **Output Directory**: `.next` (automático)

### Variáveis de Ambiente na Vercel

Configure no painel da Vercel (Settings → Environment Variables):

- `NEXT_PUBLIC_API_URL`: URL do backend API
  - Desenvolvimento: `http://localhost:8000/api/v1`
  - Produção: URL do seu backend em produção

## Autenticação

O sistema usa autenticação simples apenas com senha:
- **Senha**: `cvdf2025`

## Setup Local

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

- Frontend Local: http://localhost:3000
- Frontend Vercel: https://villa-del-fiori.vercel.app (após deploy)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Login

Acesse a página de login e use a senha: `cvdf2025`
