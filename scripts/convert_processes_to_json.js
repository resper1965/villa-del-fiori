#!/usr/bin/env node
/**
 * Script Node.js para converter processes.ts para JSON
 * 
 * Uso: node scripts/convert_processes_to_json.js
 * 
 * Gera: scripts/processes.json
 */

const fs = require('fs');
const path = require('path');

// Ler o arquivo TypeScript
const tsFile = path.join(__dirname, '../frontend/src/data/processes.ts');
const content = fs.readFileSync(tsFile, 'utf-8');

// Extrair o array processesData usando regex mais robusto
// Procurar pelo início do array e encontrar o fechamento correspondente
const startMatch = content.indexOf('export const processesData: Process[] = [');
if (startMatch === -1) {
  console.error('❌ Não foi possível encontrar processesData no arquivo');
  process.exit(1);
}

// Encontrar o início do conteúdo do array (após o [)
let arrayStart = content.indexOf('[', startMatch) + 1;

// Encontrar o fechamento correspondente do array
let depth = 1;
let i = arrayStart;
let inString = false;
let stringChar = null;

while (i < content.length && depth > 0) {
  const char = content[i];
  const prevChar = i > 0 ? content[i - 1] : '';

  // Tratar strings
  if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
    if (!inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar) {
      inString = false;
      stringChar = null;
    }
  } else if (!inString) {
    if (char === '[') depth++;
    else if (char === ']') depth--;
  }

  i++;
}

if (depth !== 0) {
  console.error('❌ Erro ao encontrar fechamento do array');
  process.exit(1);
}

const arrayContent = content.substring(arrayStart, i - 1);

// Função para extrair objetos do array
function extractObjects(str) {
  const objects = [];
  let depth = 0;
  let current = '';
  let inString = false;
  let stringChar = null;
  let i = 0;

  while (i < str.length) {
    const char = str[i];
    const prevChar = i > 0 ? str[i - 1] : '';

    // Tratar strings
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
      current += char;
      i++;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          current = '';
        }
        depth++;
        current += char;
      } else if (char === '}') {
        current += char;
        depth--;
        if (depth === 0) {
          // Objeto completo
          try {
            // Converter para objeto JavaScript válido
            // Substituir propriedades TypeScript por JavaScript
            let objStr = current.trim();
            
            // Remover comentários
            objStr = objStr.replace(/\/\/.*$/gm, '');
            
            // Converter para objeto JavaScript
            // Usar Function para avaliar (mais seguro que eval)
            const obj = new Function('return ' + objStr)();
            objects.push(obj);
          } catch (e) {
            console.warn('⚠️  Erro ao processar objeto:', e.message);
          }
          current = '';
        }
      } else {
        current += char;
      }
    } else {
      current += char;
    }

    i++;
  }

  return objects;
}

// Extrair objetos
console.log('📖 Extraindo processos...');
const processes = extractObjects(arrayContent);

if (processes.length === 0) {
  console.error('❌ Nenhum processo encontrado');
  process.exit(1);
}

console.log(`✅ ${processes.length} processos extraídos`);

// Salvar como JSON
const outputFile = path.join(__dirname, 'processes.json');
fs.writeFileSync(outputFile, JSON.stringify(processes, null, 2), 'utf-8');

console.log(`💾 JSON salvo em: ${outputFile}`);
console.log(`📊 Total: ${processes.length} processos`);

