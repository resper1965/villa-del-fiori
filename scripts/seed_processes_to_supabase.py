#!/usr/bin/env python3
"""
Script para migrar processos do arquivo processes.ts para o Supabase.

Uso:
    python scripts/seed_processes_to_supabase.py

Requisitos:
    - Variáveis de ambiente: SUPABASE_URL e SUPABASE_SERVICE_KEY
    - Ou passar via argumentos: --url e --key
"""

import os
import re
import json
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Erro: Biblioteca 'supabase' não instalada.")
    print("Instale com: pip install supabase")
    sys.exit(1)


# Mapeamento de categorias (frontend → banco)
CATEGORY_MAP = {
    "Governança": "governanca",
    "Acesso e Segurança": "acesso_seguranca",
    "Operação": "operacao",
    "Áreas Comuns": "areas_comuns",
    "Convivência": "convivencia",
    "Eventos": "eventos",
    "Emergências": "emergencias",
}

# Mapeamento de tipos de documento (frontend → banco)
DOCUMENT_TYPE_MAP = {
    "Manual": "manual",
    "Regulamento": "regulamento",
    "POP": "pop",
    "Fluxograma": "fluxograma",
    "Aviso": "aviso",
    "Comunicado": "comunicado",
    "Checklist": "checklist",
    "Formulário": "formulario",
    "Política": "politica",
}

# Mapeamento de status (frontend → banco)
STATUS_MAP = {
    "rascunho": "rascunho",
    "em_revisao": "em_revisao",
    "aprovado": "aprovado",
    "rejeitado": "rejeitado",
}


def parse_processes_from_json(json_file: str) -> List[Dict[str, Any]]:
    """Lê processos de um arquivo JSON."""
    with open(json_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def parse_typescript_array(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse um arquivo TypeScript que contém um array de objetos.
    Tenta primeiro usar um arquivo JSON intermediário (se existir),
    caso contrário, tenta parsear diretamente.
    """
    # Tentar usar arquivo JSON intermediário primeiro
    json_file = file_path.replace('.ts', '.json')
    json_file = json_file.replace('frontend/src/data', 'scripts')
    
    if os.path.exists(json_file):
        print(f"📖 Usando arquivo JSON intermediário: {json_file}")
        return parse_processes_from_json(json_file)
    
    # Se não existir, tentar parsear TypeScript diretamente
    print("⚠️  Arquivo JSON não encontrado. Tentando parsear TypeScript diretamente...")
    print("💡 Dica: Execute 'node scripts/convert_processes_to_json.js' primeiro para melhor resultado")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    processes = []
    
    # Extrair objetos usando regex (abordagem simplificada)
    # Procurar por padrões de objetos
    obj_pattern = r'\{\s*id:\s*\d+,[\s\S]*?\},?(?=\s*(?:\{|$))'
    matches = re.finditer(obj_pattern, content)
    
    for match in matches:
        obj_str = match.group(0).rstrip(',').strip()
        process = {}
        
        # Extrair campos básicos
        name_match = re.search(r'name:\s*"([^"]+)"', obj_str)
        if name_match:
            process['name'] = name_match.group(1)
        
        category_match = re.search(r'category:\s*"([^"]+)"', obj_str)
        if category_match:
            process['category'] = category_match.group(1)
        
        status_match = re.search(r'status:\s*"([^"]+)"', obj_str)
        if status_match:
            process['status'] = status_match.group(1)
        
        desc_match = re.search(r'description:\s*"([^"]+)"', obj_str)
        if desc_match:
            process['description'] = desc_match.group(1)
        
        doc_type_match = re.search(r'documentType:\s*"([^"]+)"', obj_str)
        if doc_type_match:
            process['documentType'] = doc_type_match.group(1)
        
        # Extrair arrays
        workflow_match = re.search(r'workflow:\s*\[(.*?)\]', obj_str, re.DOTALL)
        if workflow_match:
            workflow_str = workflow_match.group(1)
            workflow_items = re.findall(r'"([^"]+)"', workflow_str)
            process['workflow'] = workflow_items
        
        entities_match = re.search(r'entities:\s*\[(.*?)\]', obj_str, re.DOTALL)
        if entities_match:
            entities_str = entities_match.group(1)
            entities_items = re.findall(r'"([^"]+)"', entities_str)
            process['entities'] = entities_items
        
        variables_match = re.search(r'variables:\s*\[(.*?)\]', obj_str, re.DOTALL)
        if variables_match:
            variables_str = variables_match.group(1)
            variables_items = re.findall(r'"([^"]+)"', variables_str)
            process['variables'] = variables_items
        
        # Extrair mermaid_diagram
        mermaid_match = re.search(r'mermaid_diagram:\s*`([^`]+)`', obj_str, re.DOTALL)
        if mermaid_match:
            process['mermaid_diagram'] = mermaid_match.group(1).strip()
        
        # Extrair RACI
        raci_match = re.search(r'raci:\s*\[(.*?)\]', obj_str, re.DOTALL)
        if raci_match:
            raci_str = raci_match.group(1)
            raci_objects = []
            raci_obj_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            for raci_obj_match in re.finditer(raci_obj_pattern, raci_str, re.DOTALL):
                raci_obj_str = raci_obj_match.group(0)
                raci_obj = {}
                
                step_match = re.search(r'step:\s*"([^"]+)"', raci_obj_str)
                if step_match:
                    raci_obj['step'] = step_match.group(1)
                
                for field in ['responsible', 'accountable', 'consulted', 'informed']:
                    field_match = re.search(rf'{field}:\s*\[(.*?)\]', raci_obj_str, re.DOTALL)
                    if field_match:
                        field_str = field_match.group(1)
                        field_items = re.findall(r'"([^"]+)"', field_str)
                        raci_obj[field] = field_items
                
                if raci_obj:
                    raci_objects.append(raci_obj)
            
            if raci_objects:
                process['raci'] = raci_objects
        
        if process.get('name'):
            processes.append(process)
    
    return processes


def convert_process_to_db_format(process: Dict[str, Any], creator_id: str) -> Dict[str, Any]:
    """Converte um processo do formato frontend para o formato do banco."""
    
    # Mapear categoria
    category = CATEGORY_MAP.get(process.get('category', ''), 'governanca')
    
    # Mapear tipo de documento
    document_type = DOCUMENT_TYPE_MAP.get(process.get('documentType', 'Manual'), 'manual')
    
    # Mapear status
    status = STATUS_MAP.get(process.get('status', 'rascunho'), 'rascunho')
    
    # Construir conteúdo JSONB
    content = {
        'description': process.get('description', ''),
        'workflow': process.get('workflow', []),
        'entities': process.get('entities', []),
        'variables': process.get('variables', []),
    }
    
    if process.get('mermaid_diagram'):
        content['mermaid_diagram'] = process['mermaid_diagram']
    
    if process.get('raci'):
        content['raci'] = process['raci']
    
    # Construir variáveis aplicadas (objeto vazio com chaves das variáveis)
    variables_applied = {var: None for var in process.get('variables', [])}
    
    return {
        'process': {
            'name': process.get('name', ''),
            'category': category,
            'subcategory': None,  # Não temos no mock
            'document_type': document_type,
            'status': status,
            'creator_id': creator_id,
        },
        'version': {
            'content': content,
            'content_text': process.get('description', ''),
            'entities_involved': process.get('entities', []),
            'variables_applied': variables_applied,
            'created_by': creator_id,
            'status': status,
        }
    }


def get_or_create_system_stakeholder(supabase: Client) -> str:
    """Obtém ou cria stakeholder 'Sistema' para ser o criador dos processos seed."""
    
    # Tentar buscar stakeholder existente
    result = supabase.table('stakeholders').select('id').eq('email', 'sistema@villadelfiori.com').execute()
    
    if result.data:
        return result.data[0]['id']
    
    # Criar novo stakeholder
    # Primeiro, precisamos criar um usuário auth (ou usar um existente)
    # Por enquanto, vamos criar sem auth_user_id (será nullable)
    result = supabase.table('stakeholders').insert({
        'name': 'Sistema',
        'email': 'sistema@villadelfiori.com',
        'type': 'staff',
        'role': 'aprovador',
        'user_role': 'admin',
        'is_active': True,
    }).execute()
    
    if result.data:
        return result.data[0]['id']
    
    raise Exception("Não foi possível criar stakeholder Sistema")


def seed_processes(supabase: Client, processes: List[Dict[str, Any]], creator_id: str) -> Dict[str, int]:
    """Insere processos no banco."""
    
    stats = {
        'total': len(processes),
        'success': 0,
        'errors': 0,
        'skipped': 0,
    }
    
    for i, process in enumerate(processes, 1):
        try:
            # Converter para formato do banco
            db_data = convert_process_to_db_format(process, creator_id)
            
            # Verificar se processo já existe (por nome)
            existing = supabase.table('processes').select('id').eq('name', db_data['process']['name']).execute()
            
            if existing.data:
                print(f"[{i}/{stats['total']}] ⏭️  Processo já existe: {db_data['process']['name']}")
                stats['skipped'] += 1
                continue
            
            # Criar processo
            process_result = supabase.table('processes').insert(db_data['process']).execute()
            
            if not process_result.data:
                print(f"[{i}/{stats['total']}] ❌ Erro ao criar processo: {db_data['process']['name']}")
                stats['errors'] += 1
                continue
            
            process_id = process_result.data[0]['id']
            
            # Criar versão inicial
            version_data = {
                **db_data['version'],
                'process_id': process_id,
                'version_number': 1,
            }
            
            version_result = supabase.table('process_versions').insert(version_data).execute()
            
            if version_result.data:
                print(f"[{i}/{stats['total']}] ✅ Processo criado: {db_data['process']['name']}")
                stats['success'] += 1
            else:
                print(f"[{i}/{stats['total']}] ❌ Erro ao criar versão: {db_data['process']['name']}")
                stats['errors'] += 1
                # Tentar deletar processo criado
                supabase.table('processes').delete().eq('id', process_id).execute()
        
        except Exception as e:
            print(f"[{i}/{stats['total']}] ❌ Erro ao processar: {process.get('name', 'Desconhecido')}: {e}")
            stats['errors'] += 1
    
    return stats


def main():
    """Função principal."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrar processos do mock para Supabase')
    parser.add_argument('--url', help='URL do Supabase', default=os.getenv('SUPABASE_URL'))
    parser.add_argument('--key', help='Service Key do Supabase', default=os.getenv('SUPABASE_SERVICE_KEY'))
    parser.add_argument('--file', help='Caminho do arquivo processes.ts ou processes.json', 
                       default='frontend/src/data/processes.ts')
    parser.add_argument('--json', help='Usar arquivo JSON intermediário', 
                       default='scripts/processes.json')
    parser.add_argument('--dry-run', action='store_true', help='Apenas simular, não inserir dados')
    
    args = parser.parse_args()
    
    if not args.url or not args.key:
        print("Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios")
        print("Configure via variáveis de ambiente ou argumentos --url e --key")
        sys.exit(1)
    
    # Verificar se arquivo existe
    if not os.path.exists(args.file):
        print(f"Erro: Arquivo não encontrado: {args.file}")
        sys.exit(1)
    
    print("🚀 Iniciando migração de processos...")
    print(f"📁 Arquivo: {args.file}")
    print(f"🔗 Supabase URL: {args.url}")
    
    # Criar cliente Supabase
    supabase: Client = create_client(args.url, args.key)
    
    # Parsear processos do arquivo
    print("\n📖 Lendo processos do arquivo...")
    try:
        # Tentar usar JSON primeiro se existir
        if os.path.exists(args.json) and args.file.endswith('.ts'):
            print(f"📄 Usando arquivo JSON: {args.json}")
            processes = parse_processes_from_json(args.json)
        else:
            processes = parse_typescript_array(args.file)
        print(f"✅ {len(processes)} processos encontrados")
    except Exception as e:
        print(f"❌ Erro ao ler arquivo: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    if args.dry_run:
        print("\n🔍 DRY RUN - Apenas simulação")
        for i, process in enumerate(processes[:5], 1):  # Mostrar apenas os 5 primeiros
            print(f"\n{i}. {process.get('name', 'Sem nome')}")
            print(f"   Categoria: {process.get('category', 'N/A')}")
            print(f"   Tipo: {process.get('documentType', 'N/A')}")
        print(f"\n... e mais {len(processes) - 5} processos")
        return
    
    # Obter ou criar stakeholder Sistema
    print("\n👤 Obtendo stakeholder Sistema...")
    try:
        creator_id = get_or_create_system_stakeholder(supabase)
        print(f"✅ Stakeholder ID: {creator_id}")
    except Exception as e:
        print(f"❌ Erro ao obter stakeholder: {e}")
        sys.exit(1)
    
    # Inserir processos
    print(f"\n💾 Inserindo {len(processes)} processos no banco...")
    stats = seed_processes(supabase, processes, creator_id)
    
    # Resumo
    print("\n" + "="*50)
    print("📊 RESUMO")
    print("="*50)
    print(f"Total de processos: {stats['total']}")
    print(f"✅ Criados com sucesso: {stats['success']}")
    print(f"⏭️  Já existiam: {stats['skipped']}")
    print(f"❌ Erros: {stats['errors']}")
    print("="*50)
    
    if stats['errors'] > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()

