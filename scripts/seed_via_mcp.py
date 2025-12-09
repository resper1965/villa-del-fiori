#!/usr/bin/env python3
"""
Script para executar seed de processos via MCP do Supabase.
Lê o arquivo SQL e executa em lotes.
"""

import json
import sys
from pathlib import Path

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
    
    return f"""SELECT seed_single_process(
    '{name}',
    '{category}',
    '{doc_type}',
    '{status}',
    '{description}',
    '{content_json}'::jsonb,
    '{entities_json}'::jsonb,
    '{variables_json}'::jsonb
);"""

def main():
    # Ler processos
    with open('scripts/processes.json', 'r', encoding='utf-8') as f:
        processes = json.load(f)
    
    # Pular os 3 primeiros (já inseridos)
    remaining = processes[3:]
    
    print(f"📊 Total: {len(processes)} processos")
    print(f"✅ Já inseridos: 3")
    print(f"⏳ Restam: {len(remaining)} processos")
    print(f"\n💡 Execute o SQL abaixo via MCP do Supabase:")
    print("="*70)
    
    # Gerar SQL para todos os processos restantes
    sql_statements = []
    for proc in remaining:
        sql_statements.append(generate_sql_for_process(proc))
    
    # Salvar em arquivo
    output_file = 'scripts/seed_remaining_processes.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('-- Seed dos processos restantes (32 processos)\n')
        f.write('-- Execute via MCP: mcp_supabase_Sindico_Virtual_execute_sql\n\n')
        f.write('\n'.join(sql_statements))
    
    print(f"\n✅ SQL gerado em: {output_file}")
    print(f"📏 {len(sql_statements)} statements SQL")
    print(f"\n💡 Para executar, use o MCP do Supabase com o conteúdo do arquivo")

if __name__ == '__main__':
    main()

