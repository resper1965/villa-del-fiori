#!/usr/bin/env python3
"""
Script para gerar e executar seed dos processos restantes em lotes via MCP.
"""

import json
import sys

# Mapeamentos
CATEGORY_MAP = {
    "Governança": "governanca",
    "Acesso e Segurança": "acesso_seguranca",
    "Operação": "operacao",
    "Áreas Comuns": "areas_comuns",
    "Convivência": "convivencia",
    "Eventos": "eventos",
    "Emergências": "emergencias",
}

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

STATUS_MAP = {
    "rascunho": "rascunho",
    "em_revisao": "em_revisao",
    "aprovado": "aprovado",
    "rejeitado": "rejeitado",
}

def escape_sql(text):
    """Escapa texto para SQL."""
    if not text:
        return ""
    return text.replace("'", "''")

def generate_sql_for_process(proc):
    """Gera SQL para um processo."""
    name = escape_sql(proc['name'])
    category = CATEGORY_MAP.get(proc['category'], 'governanca')
    doc_type = DOCUMENT_TYPE_MAP.get(proc.get('documentType', 'Manual'), 'manual')
    status = STATUS_MAP.get(proc.get('status', 'em_revisao'), 'em_revisao')
    description = escape_sql(proc.get('description', ''))
    
    content = {
        'description': proc.get('description', ''),
        'workflow': proc.get('workflow', []),
        'entities': proc.get('entities', []),
        'variables': proc.get('variables', []),
    }
    
    if proc.get('mermaid_diagram'):
        content['mermaid_diagram'] = proc['mermaid_diagram']
    
    if proc.get('raci'):
        content['raci'] = proc['raci']
    
    content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")
    entities_json = json.dumps(proc.get('entities', []), ensure_ascii=False)
    variables = {var: None for var in proc.get('variables', [])}
    variables_json = json.dumps(variables, ensure_ascii=False)
    
    return f"""    SELECT seed_single_process(
        '{name}',
        '{category}',
        '{doc_type}',
        '{status}',
        '{description}',
        '{content_json}'::jsonb,
        '{entities_json}'::jsonb,
        '{variables_json}'::jsonb
    ) INTO v_process_id;"""

def main():
    # Ler processos
    with open('scripts/processes.json', 'r', encoding='utf-8') as f:
        processes = json.load(f)
    
    # Processos restantes (pular os 5 primeiros)
    remaining = processes[5:]
    
    # Dividir em lotes de 5 processos
    batch_size = 5
    batches = []
    for i in range(0, len(remaining), batch_size):
        batch = remaining[i:i+batch_size]
        batches.append(batch)
    
    print(f"📊 Total: {len(processes)} processos")
    print(f"✅ Já inseridos: 5 processos")
    print(f"⏳ Restam: {len(remaining)} processos")
    print(f"📦 Lotes: {len(batches)} lotes de até {batch_size} processos cada\n")
    
    # Gerar SQL para cada lote
    for batch_num, batch in enumerate(batches, 1):
        migration_num = 8 + batch_num
        migration_name = f"009_seed_batch_{batch_num}"
        
        sql_parts = [
            f"-- Migration: Seed lote {batch_num} ({len(batch)} processos)",
            "-- Esta migration executa a função seed_single_process para um lote de processos",
            "",
            "DO $$",
            "DECLARE",
            "    v_process_id UUID;",
            "BEGIN"
        ]
        
        for proc in batch:
            sql_parts.append(generate_sql_for_process(proc))
        
        sql_parts.append("END $$;")
        
        sql = '\n'.join(sql_parts)
        
        # Salvar arquivo
        filename = f'scripts/migrations/{migration_name}.sql'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(sql)
        
        print(f"✅ Lote {batch_num}: {len(batch)} processos → {filename}")
        print(f"   Processos: {', '.join([p['name'][:30] + '...' if len(p['name']) > 30 else p['name'] for p in batch])}")
    
    print(f"\n💡 Execute as migrations via MCP do Supabase:")
    print(f"   mcp_supabase_Sindico_Virtual_apply_migration")

if __name__ == '__main__':
    import os
    os.makedirs('scripts/migrations', exist_ok=True)
    main()

