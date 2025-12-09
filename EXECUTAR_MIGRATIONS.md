# 🚀 Executar Migrations e Criar Admin

## ⚠️ Problema Atual

O backend FastAPI não está sendo servido corretamente na Vercel (endpoints retornam 404). 

## ✅ Solução: Executar Localmente

Como o banco Neon está configurado e acessível, podemos executar as migrations e criar o admin localmente.

### 1. Configurar Ambiente Local

```bash
cd backend

# Criar/ativar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configurar DATABASE_URL

Crie um arquivo `.env` no diretório `backend/`:

```bash
# backend/.env
DATABASE_URL=postgresql://neondb_owner:npg_msGZJiO9co0U@ep-hidden-dew-a4dneugx.us-east-1.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=cnFtUF3ucg3s20vDJauHtkHG4wHWjOaYMXdIVVLKhXg
OPENAI_API_KEY=your-openai-api-key-hereproj-IRjgUHTRXqZp17OIKfIjMGMqNO-fgn14PLj14citHr4i-UcFNbEtv14hLD3suC0xjPKULeaMA0T3BlbkFJu5kEDsLu1fu1ofm-NtZ9oYEVgj0kHgsFXdNN_iQwFmQb7P4Dd9IOfutruAC8TSxn4Y8n7FuT0A
OPENAI_MODEL=gpt-4o
```

### 3. Executar Migrations

```bash
cd backend
alembic upgrade head
```

Isso criará todas as tabelas no banco Neon:
- `stakeholders`
- `processes`
- `process_versions`
- `approvals`
- `rejections`
- etc.

### 4. Criar Usuário Admin

Crie um script Python simples:

```python
# backend/create_admin.py
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.stakeholder import Stakeholder, StakeholderType, UserRole

db = SessionLocal()

email = "resper@gmail.com"
password = "cvdf2025"

# Verificar se já existe
existing = db.query(Stakeholder).filter(Stakeholder.email == email).first()
if existing:
    existing.hashed_password = get_password_hash(password)
    existing.user_role = UserRole.ADMIN
    existing.type = StakeholderType.SINDICO
    existing.is_active = True
    existing.name = "Ricardo Esper"
    db.commit()
    print(f"✅ Usuário admin atualizado: {email}")
else:
    admin = Stakeholder(
        name="Ricardo Esper",
        email=email,
        hashed_password=get_password_hash(password),
        type=StakeholderType.SINDICO,
        user_role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print(f"✅ Usuário admin criado: {email}")

db.close()
```

Execute:

```bash
python3 create_admin.py
```

### 5. Verificar

Teste a conexão:

```python
# backend/test_connection.py
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app.core.database import SessionLocal
from app.models.stakeholder import Stakeholder

db = SessionLocal()
users = db.query(Stakeholder).all()
print(f"✅ Usuários encontrados: {len(users)}")
for user in users:
    print(f"  - {user.name} ({user.email}) - {user.user_role.value}")
db.close()
```

Execute:

```bash
python3 test_connection.py
```

## 📋 Checklist

- [ ] Ambiente virtual criado e ativado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] `.env` configurado com `DATABASE_URL` do Neon
- [ ] Migrations executadas (`alembic upgrade head`)
- [ ] Usuário admin criado
- [ ] Conexão testada

## 🎯 Após Executar

1. **Login:** Acesse https://villadelfiori.vercel.app/login
2. **Credenciais:**
   - Email: `resper@gmail.com`
   - Senha: `cvdf2025`

## 🔧 Próximos Passos

Após executar as migrations e criar o admin, você pode:

1. **Testar o sistema** via frontend na Vercel
2. **Corrigir o backend** na Vercel (se necessário)
3. **Usar o sistema** normalmente

O banco Neon está configurado e funcionando, então o sistema funcionará mesmo que o backend precise ser ajustado na Vercel.

