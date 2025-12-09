# 🔐 Evolução do RBAC - Role-Based Access Control

## 📊 Situação Atual

### ✅ O que já temos:

1. **Roles definidas:**
   - `ADMIN` - Administrador do sistema
   - `SYNDIC` - Síndico
   - `COUNCIL` - Conselho consultivo
   - `RESIDENT` - Morador
   - `STAFF` - Funcionário/Staff

2. **Dependências de segurança:**
   - `get_current_user` - Usuário autenticado
   - `get_current_active_syndic` - Síndico ou Admin
   - `get_current_admin` - Apenas Admin
   - `get_current_council_or_syndic` - Conselho, Síndico ou Admin

3. **Proteções implementadas:**
   - ✅ Aprovação/Rejeição: Apenas Council/Syndic/Admin
   - ✅ Criação de processos: Qualquer usuário autenticado
   - ✅ Edição de processos: Qualquer usuário autenticado
   - ✅ Deletar processos: Apenas Syndic/Admin
   - ✅ Chat: Qualquer usuário autenticado

### ⚠️ Limitações Atuais:

1. **Permissões granulares faltando:**
   - Não há controle fino por ação (read, write, delete, approve)
   - Não há controle por recurso específico (processo, entidade)
   - Não há permissões customizadas

2. **Falta de hierarquia:**
   - Admin tem todas as permissões, mas não está explícito
   - Não há herança de permissões

3. **Falta de auditoria:**
   - Não rastreia quem fez o quê
   - Não há logs de ações sensíveis

4. **Falta de gestão de usuários:**
   - Não há endpoints para criar/editar usuários
   - Não há gestão de roles

## 🎯 Proposta de Evolução

### Fase 1: Sistema de Permissões Granulares

#### 1.1 Modelo de Permissões

```python
# backend/src/app/models/permission.py
class Permission(str, enum.Enum):
    # Processos
    PROCESS_READ = "process:read"
    PROCESS_CREATE = "process:create"
    PROCESS_UPDATE = "process:update"
    PROCESS_DELETE = "process:delete"
    PROCESS_APPROVE = "process:approve"
    PROCESS_REJECT = "process:reject"
    
    # Entidades
    ENTITY_READ = "entity:read"
    ENTITY_CREATE = "entity:create"
    ENTITY_UPDATE = "entity:update"
    ENTITY_DELETE = "entity:delete"
    
    # Usuários
    USER_READ = "user:read"
    USER_CREATE = "user:create"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_MANAGE_ROLES = "user:manage_roles"
    
    # Chat
    CHAT_USE = "chat:use"
    
    # Admin
    ADMIN_ALL = "admin:all"
```

#### 1.2 Mapeamento Role → Permissões

```python
# backend/src/app/core/permissions.py
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        Permission.ADMIN_ALL,  # Todas as permissões
    ],
    UserRole.SYNDIC: [
        Permission.PROCESS_READ,
        Permission.PROCESS_CREATE,
        Permission.PROCESS_UPDATE,
        Permission.PROCESS_DELETE,
        Permission.PROCESS_APPROVE,
        Permission.PROCESS_REJECT,
        Permission.ENTITY_READ,
        Permission.ENTITY_CREATE,
        Permission.ENTITY_UPDATE,
        Permission.ENTITY_DELETE,
        Permission.USER_READ,
        Permission.CHAT_USE,
    ],
    UserRole.COUNCIL: [
        Permission.PROCESS_READ,
        Permission.PROCESS_APPROVE,
        Permission.PROCESS_REJECT,
        Permission.ENTITY_READ,
        Permission.CHAT_USE,
    ],
    UserRole.STAFF: [
        Permission.PROCESS_READ,
        Permission.PROCESS_CREATE,
        Permission.PROCESS_UPDATE,
        Permission.ENTITY_READ,
        Permission.ENTITY_CREATE,
        Permission.ENTITY_UPDATE,
        Permission.CHAT_USE,
    ],
    UserRole.RESIDENT: [
        Permission.PROCESS_READ,
        Permission.ENTITY_READ,
        Permission.CHAT_USE,
    ],
}
```

#### 1.3 Decorator de Permissões

```python
# backend/src/app/core/permissions.py
from functools import wraps
from fastapi import Depends, HTTPException, status

def require_permission(permission: Permission):
    """Decorator para verificar permissão"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            user_permissions = get_user_permissions(current_user)
            
            # Admin tem todas as permissões
            if Permission.ADMIN_ALL in user_permissions:
                return await func(*args, **kwargs)
            
            if permission not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission required: {permission.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def get_user_permissions(user: Stakeholder) -> list[Permission]:
    """Retorna lista de permissões do usuário"""
    base_permissions = ROLE_PERMISSIONS.get(user.user_role, [])
    
    # Se tem ADMIN_ALL, retorna todas
    if Permission.ADMIN_ALL in base_permissions:
        return list(Permission)
    
    return base_permissions
```

#### 1.4 Dependency para Verificar Permissão

```python
# backend/src/app/core/permissions.py
def require_permission_dep(permission: Permission):
    """Dependency para verificar permissão"""
    async def permission_checker(
        current_user: Stakeholder = Depends(get_current_user)
    ) -> Stakeholder:
        user_permissions = get_user_permissions(current_user)
        
        if Permission.ADMIN_ALL in user_permissions:
            return current_user
        
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission.value}"
            )
        
        return current_user
    
    return permission_checker
```

### Fase 2: Gestão de Usuários

#### 2.1 Endpoints de Gestão

```python
# backend/src/app/api/v1/endpoints/users.py
@router.get("/users", response_model=UserListResponse)
async def list_users(
    current_user: Stakeholder = Depends(require_permission_dep(Permission.USER_READ)),
    db: Session = Depends(get_db),
):
    """Listar usuários - Apenas quem tem permissão"""

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: Stakeholder = Depends(require_permission_dep(Permission.USER_CREATE)),
    db: Session = Depends(get_db),
):
    """Criar usuário - Apenas quem tem permissão"""

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID,
    new_role: UserRole,
    current_user: Stakeholder = Depends(require_permission_dep(Permission.USER_MANAGE_ROLES)),
    db: Session = Depends(get_db),
):
    """Atualizar role de usuário - Apenas Admin"""
```

### Fase 3: Auditoria e Logs

#### 3.1 Modelo de Auditoria

```python
# backend/src/app/models/audit.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("stakeholders.id"), nullable=False)
    action = Column(String(100), nullable=False)  # "process:create", "process:approve"
    resource_type = Column(String(50), nullable=False)  # "process", "entity"
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)  # Dados adicionais
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("Stakeholder", backref="audit_logs")
```

#### 3.2 Middleware de Auditoria

```python
# backend/src/app/core/audit.py
async def log_action(
    user: Stakeholder,
    action: str,
    resource_type: str,
    resource_id: str = None,
    details: dict = None,
    request: Request = None,
    db: Session = None,
):
    """Registra ação no log de auditoria"""
    audit_log = AuditLog(
        user_id=user.id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )
    db.add(audit_log)
    db.commit()
```

### Fase 4: Permissões por Recurso

#### 4.1 Ownership e Permissões Específicas

```python
# Verificar se usuário pode editar processo específico
def can_edit_process(user: Stakeholder, process: Process) -> bool:
    """Verifica se usuário pode editar processo específico"""
    permissions = get_user_permissions(user)
    
    # Admin pode tudo
    if Permission.ADMIN_ALL in permissions:
        return True
    
    # Criador pode editar se tiver permissão
    if process.creator_id == user.id and Permission.PROCESS_UPDATE in permissions:
        return True
    
    # Syndic pode editar
    if user.user_role == UserRole.SYNDIC and Permission.PROCESS_UPDATE in permissions:
        return True
    
    return False
```

### Fase 5: Frontend - Proteção de Rotas

#### 5.1 Hook de Permissões

```typescript
// frontend/src/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth()
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Admin tem todas as permissões
    if (user.user_role === 'admin') return true
    
    const rolePermissions = ROLE_PERMISSIONS[user.user_role] || []
    return rolePermissions.includes(permission)
  }
  
  return { hasPermission, user }
}
```

#### 5.2 Componente de Proteção

```typescript
// frontend/src/components/auth/PermissionGuard.tsx
export function PermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(permission)) {
    return fallback || null
  }
  
  return <>{children}</>
}
```

## 📋 Plano de Implementação

### Prioridade Alta (Fase 1)

1. ✅ Criar modelo de `Permission`
2. ✅ Criar mapeamento `ROLE_PERMISSIONS`
3. ✅ Implementar `get_user_permissions()`
4. ✅ Criar dependency `require_permission_dep()`
5. ✅ Atualizar endpoints existentes para usar permissões

### Prioridade Média (Fase 2)

1. ✅ Criar endpoints de gestão de usuários
2. ✅ Criar interface de gestão no frontend
3. ✅ Implementar validações de role

### Prioridade Baixa (Fase 3-5)

1. ✅ Implementar auditoria
2. ✅ Adicionar permissões por recurso
3. ✅ Proteção de rotas no frontend

## 🔄 Migração Gradual

### Estratégia:

1. **Manter compatibilidade:** Dependências antigas continuam funcionando
2. **Adicionar gradualmente:** Novos endpoints usam novo sistema
3. **Migrar endpoints:** Atualizar endpoints existentes um por um
4. **Remover código antigo:** Após migração completa

### Exemplo de Migração:

```python
# ANTES
@router.post("/processes/{process_id}/approve")
async def approve_process(
    current_user: Stakeholder = Depends(get_current_council_or_syndic),
    ...
):

# DEPOIS
@router.post("/processes/{process_id}/approve")
async def approve_process(
    current_user: Stakeholder = Depends(require_permission_dep(Permission.PROCESS_APPROVE)),
    ...
):
```

## 📊 Benefícios

1. **Flexibilidade:** Fácil adicionar novas permissões
2. **Granularidade:** Controle fino por ação
3. **Manutenibilidade:** Código mais limpo e organizado
4. **Auditoria:** Rastreamento completo de ações
5. **Escalabilidade:** Fácil adicionar novos roles/permissões

## 🎯 Próximos Passos

1. Implementar Fase 1 (Permissões Granulares)
2. Testar com endpoints existentes
3. Criar documentação de permissões
4. Implementar Fase 2 (Gestão de Usuários)
5. Adicionar auditoria (Fase 3)

