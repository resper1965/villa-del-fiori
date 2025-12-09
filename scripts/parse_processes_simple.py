#!/usr/bin/env python3
"""
Script simples para extrair processos do TypeScript e converter para JSON.
Usa uma abordagem mais direta: extrai objetos usando regex e processa manualmente.
"""

import re
import json
import sys
from pathlib import Path

def extract_processes_from_ts(file_path: str) -> list:
    """Extrai processos do arquivo TypeScript."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    processes = []
    
    # Encontrar todos os objetos que começam com { id: número
    # Usar regex para encontrar blocos de objetos
    pattern = r'\{\s*id:\s*\d+,[\s\S]*?\}(?=\s*(?:\{|$|,))'
    matches = re.finditer(pattern, content)
    
    for match in matches:
        obj_str = match.group(0).rstrip(',').strip()
        process = {}
        
        # Extrair campos básicos
        fields = {
            'name': r'name:\s*"([^"]+)"',
            'category': r'category:\s*"([^"]+)"',
            'status': r'status:\s*"([^"]+)"',
            'description': r'description:\s*"([^"]+)"',
            'documentType': r'documentType:\s*"([^"]+)"',
        }
        
        for field, pattern_field in fields.items():
            m = re.search(pattern_field, obj_str)
            if m:
                process[field] = m.group(1)
        
        # Extrair arrays (workflow, entities, variables)
        for array_field in ['workflow', 'entities', 'variables']:
            array_pattern = rf'{array_field}:\s*\[(.*?)\]'
            m = re.search(array_pattern, obj_str, re.DOTALL)
            if m:
                array_str = m.group(1)
                items = re.findall(r'"([^"]+)"', array_str)
                process[array_field] = items
        
        # Extrair mermaid_diagram (template strings)
        mermaid_pattern = r'mermaid_diagram:\s*`([^`]+)`'
        m = re.search(mermaid_pattern, obj_str, re.DOTALL)
        if m:
            process['mermaid_diagram'] = m.group(1).strip()
        
        # Extrair RACI
        raci_pattern = r'raci:\s*\[(.*?)\]'
        m = re.search(raci_pattern, obj_str, re.DOTALL)
        if m:
            raci_str = m.group(1)
            raci_objects = []
            
            # Encontrar objetos RACI individuais
            raci_obj_pattern = r'\{\s*step:\s*"([^"]+)"[\s\S]*?\}'
            for raci_match in re.finditer(raci_obj_pattern, raci_str, re.DOTALL):
                raci_obj_str = raci_match.group(0)
                raci_obj = {}
                
                step_m = re.search(r'step:\s*"([^"]+)"', raci_obj_str)
                if step_m:
                    raci_obj['step'] = step_m.group(1)
                
                for field in ['responsible', 'accountable', 'consulted', 'informed']:
                    field_pattern = rf'{field}:\s*\[(.*?)\]'
                    field_m = re.search(field_pattern, raci_obj_str, re.DOTALL)
                    if field_m:
                        field_str = field_m.group(1)
                        field_items = re.findall(r'"([^"]+)"', field_str)
                        raci_obj[field] = field_items
                
                if raci_obj:
                    raci_objects.append(raci_obj)
            
            if raci_objects:
                process['raci'] = raci_objects
        
        if process.get('name'):
            processes.append(process)
    
    return processes

def main():
    input_file = 'frontend/src/data/processes.ts'
    output_file = 'scripts/processes.json'
    
    if not Path(input_file).exists():
        print(f'❌ Arquivo não encontrado: {input_file}')
        sys.exit(1)
    
    print(f'📖 Lendo {input_file}...')
    processes = extract_processes_from_ts(input_file)
    
    if not processes:
        print('❌ Nenhum processo encontrado')
        sys.exit(1)
    
    print(f'✅ {len(processes)} processos extraídos')
    
    # Salvar JSON
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processes, f, indent=2, ensure_ascii=False)
    
    print(f'💾 JSON salvo em: {output_file}')
    print(f'📊 Total: {len(processes)} processos')
    
    # Mostrar alguns exemplos
    print('\n📋 Primeiros 3 processos:')
    for i, p in enumerate(processes[:3], 1):
        print(f'  {i}. {p.get("name", "Sem nome")} ({p.get("category", "N/A")})')

if __name__ == '__main__':
    main()

