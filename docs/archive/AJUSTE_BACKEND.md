# 🔧 Ajuste do Backend - Problema e Solução

## ⚠️ Problema Identificado

O backend FastAPI está retornando **404 Not Found** porque:

1. **Roteamento do Vercel:** O `vercel.json` está configurado para rotear `/v1/*` para `/api/[...path]`, mas o handler não está sendo encontrado
2. **Estrutura de arquivos:** O backend precisa estar acessível no caminho correto
3. **Mangum configuration:** O `api_gateway_base_path` pode estar incorreto

## 🔍 Análise do Problema

### Configuração Atual:

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/v1/:path*",
      "destination": "/api/[...path]"
    }
  ]
}
```

**api/[...path].py:**
- Handler configurado com Mangum
- `api_gateway_base_path="/api"` 
- Backend em `backend/src/`

### Problema:

Quando o Vercel recebe `/v1/health`, ele:
1. Rewrite para `/api/[...path]` → `/api/v1/health`
2. Procura handler em `api/[...path].py`
3. O handler recebe o path como `v1/health`
4. Mas o FastAPI espera apenas `/v1` (sem o `/api`)

## ✅ Solução

### Opção 1: Ajustar o Mangum (Recomendado)

O problema é que o `api_gateway_base_path` está como `/api`, mas o Vercel já remove o `/api` antes de passar para o handler.

**Correção:**

```python
# api/[...path].py
handler = Mangum(app, lifespan="off")  # Remover api_gateway_base_path
```

### Opção 2: Ajustar o Rewrite

Mudar o rewrite para não incluir `/api`:

```json
{
  "rewrites": [
    {
      "source": "/v1/:path*",
      "destination": "/api/v1/:path*"
    }
  ]
}
```

E ajustar o handler para receber `/v1/...` diretamente.

### Opção 3: Usar estrutura diferente

Criar handler específico para cada rota ou usar estrutura de pastas diferente.

## 🎯 Solução Recomendada

Ajustar o `api/[...path].py` para remover o `api_gateway_base_path`:

```python
handler = Mangum(app, lifespan="off")  # Sem base_path
```

E ajustar o `vercel.json` para rotear corretamente:

```json
{
  "rewrites": [
    {
      "source": "/v1/:path*",
      "destination": "/api/v1/:path*"
    }
  ]
}
```

Mas o FastAPI já está configurado para usar `/v1` quando `VERCEL=1`, então o handler deve receber o path completo.

## 📝 Próximos Passos

1. Ajustar `api/[...path].py`
2. Testar localmente (se possível)
3. Fazer novo deploy
4. Verificar endpoints

