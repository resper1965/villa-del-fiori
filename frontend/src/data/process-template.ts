/**
 * TEMPLATE PARA CRIAÇÃO DE PROCESSOS
 * 
 * Este arquivo serve como template e documentação para criar novos processos
 * no sistema de gestão condominial.
 * 
 * ESTRUTURA COMPLETA DE UM PROCESSO:
 * - Todos os campos são obrigatórios, exceto os marcados com "?"
 * - O diagrama Mermaid deve incluir responsáveis em cada nó
 * - A matriz RACI deve ter uma entrada para cada etapa do workflow
 */

import { FileText, Shield, Lock, Wrench, Building2, Users, Calendar, AlertTriangle, LucideIcon } from "lucide-react"
import { RACIEntry } from "@/types/raci"

// ============================================================================
// INTERFACE DO PROCESSO
// ============================================================================

export interface Process {
  id: number                          // ID único sequencial do processo
  name: string                        // Nome do processo (ex: "Gestão de Pets")
  category: string                    // Categoria: "Governança", "Acesso e Segurança", "Operação", "Áreas Comuns", "Convivência", "Eventos", "Emergências"
  icon: LucideIcon                    // Ícone do Lucide React (FileText, Shield, Lock, Wrench, Building2, Users, Calendar, AlertTriangle)
  status: string                      // Status: "em_revisao", "aprovado", "rejeitado", "rascunho"
  description: string                 // Descrição detalhada do processo (2-3 frases)
  workflow: string[]                  // Array de strings com as etapas numeradas do workflow
  entities: string[]                  // Array com as entidades envolvidas (ex: ["Síndico", "Moradores", "Portaria Online"])
  variables: string[]                 // Array com variáveis do sistema usadas (ex: ["horario_academia", "capacidade_maxima"])
  documentType: string                // Tipo de documento: "Manual", "POP", "Regulamento", "Formulário", "Procedimento de Emergência"
  mermaid_diagram?: string            // Diagrama Mermaid com responsáveis indicados
  raci?: RACIEntry[]                  // Matriz RACI para cada etapa do workflow
}

// ============================================================================
// TEMPLATE COMPLETO DE UM PROCESSO
// ============================================================================

export const processTemplate: Process = {
  // ID: Número único sequencial (incrementar para cada novo processo)
  id: 0,
  
  // NOME: Nome descritivo e claro do processo
  name: "Nome do Processo",
  
  // CATEGORIA: Uma das categorias predefinidas
  // - "Governança": Processos administrativos e de gestão
  // - "Acesso e Segurança": Controle de acesso, segurança, câmeras
  // - "Operação": Operações do dia a dia (limpeza, manutenção, fornecedores)
  // - "Áreas Comuns": Uso de áreas compartilhadas (academia, SPA, escritório)
  // - "Convivência": Regras de convivência (pets, silêncio, obras)
  // - "Eventos": Assembleias, festas, reservas
  // - "Emergências": Procedimentos de emergência
  category: "Governança",
  
  // ÍCONE: Escolher um ícone apropriado do Lucide React
  // - FileText: Documentos, manuais, processos administrativos
  // - Shield: Segurança, proteção
  // - Lock: Acesso, controle
  // - Wrench: Operação, manutenção
  // - Building2: Áreas comuns, infraestrutura
  // - Users: Convivência, pessoas
  // - Calendar: Eventos, agendamentos
  // - AlertTriangle: Emergências, alertas
  icon: FileText,
  
  // STATUS: Status atual do processo
  // - "em_revisao": Aguardando aprovação
  // - "aprovado": Processo aprovado e ativo
  // - "rejeitado": Processo rejeitado
  // - "rascunho": Em elaboração
  status: "em_revisao",
  
  // DESCRIÇÃO: Descrição detalhada do processo (2-3 frases)
  // Deve explicar: o que é, para que serve, principais objetivos
  description: "Descrição detalhada do processo. Explica o que é, para que serve e quais são os principais objetivos. Deve ter 2-3 frases completas.",
  
  // WORKFLOW: Array com as etapas do processo numeradas
  // Cada etapa deve ser uma string clara e descritiva
  // Formato: "N. Descrição da etapa"
  workflow: [
    "1. Primeira etapa do processo",
    "2. Segunda etapa do processo",
    "3. Terceira etapa do processo",
    // ... adicionar mais etapas conforme necessário
  ],
  
  // ENTIDADES: Array com as entidades envolvidas no processo
  // Entidades comuns: "Síndico", "Conselho Consultivo", "Administradora", 
  // "Moradores", "Portaria Online", "Faxineiro", "Empresa de Manutenção", etc.
  entities: ["Síndico", "Moradores"],
  
  // VARIÁVEIS: Array com as variáveis do sistema usadas no processo
  // Variáveis são parâmetros configuráveis (ex: horários, limites, contatos)
  // Formato: nome_da_variavel (snake_case)
  variables: ["variavel_exemplo"],
  
  // TIPO DE DOCUMENTO: Tipo de documento gerado
  // - "Manual": Manual de procedimentos
  // - "POP": Procedimento Operacional Padrão
  // - "Regulamento": Regulamento interno
  // - "Formulário": Formulário de registro
  // - "Procedimento de Emergência": Procedimento de emergência
  documentType: "Manual",
  
  // DIAGRAMA MERMAID: Diagrama de fluxo em formato Mermaid
  // IMPORTANTE: Cada nó deve incluir o responsável entre <br/> e parênteses
  // Formato: A["Nome da Atividade<br/>(Responsável)"]
  // Cores aplicadas:
  // - Azul (#1e3a8a): Responsáveis pela execução
  // - Verde (#166534): Aprovadores/validação
  // - Vermelho (#dc2626): Urgente/emergência/negado
  mermaid_diagram: `flowchart TD
    A["Primeira Atividade<br/>(Responsável)"] --> B["Segunda Atividade<br/>(Responsável)"]
    B --> C{Decisão?}
    C -->|Sim| D["Atividade se Sim<br/>(Responsável)"]
    C -->|Não| E["Atividade se Não<br/>(Responsável)"]
    D --> F["Atividade Final<br/>(Responsável)"]
    E --> F
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff`,
  
  // MATRIZ RACI: Array com uma entrada para cada etapa do workflow
  // Cada entrada define as responsabilidades RACI para aquela etapa
  // R = Responsible (Responsável): Quem executa a tarefa
  // A = Accountable (Aprovador): Quem aprova/decide (sempre 1 pessoa)
  // C = Consulted (Consultado): Quem é consultado antes da execução
  // I = Informed (Informado): Quem é informado após a execução
  raci: [
    {
      step: "1. Primeira etapa do processo",  // Deve corresponder exatamente ao workflow
      responsible: ["Entidade que executa"],   // R: Quem faz
      accountable: ["Entidade que aprova"],    // A: Quem aprova (geralmente Síndico)
      consulted: ["Entidade consultada"],      // C: Quem é consultado (pode ser vazio [])
      informed: ["Entidade informada"],        // I: Quem é informado (pode ser vazio [])
    },
    {
      step: "2. Segunda etapa do processo",
      responsible: ["Entidade que executa"],
      accountable: ["Entidade que aprova"],
      consulted: [],
      informed: [],
    },
    // ... adicionar uma entrada RACI para cada etapa do workflow
  ],
}

// ============================================================================
// EXEMPLO COMPLETO DE PROCESSO
// ============================================================================

export const processExample: Process = {
  id: 1,
  name: "Gestão de Pets",
  category: "Convivência",
  icon: Users,
  status: "em_revisao",
  description: "Regulamento sobre circulação de pets nas áreas comuns, normas de higiene, segurança (focinheira quando necessário) e convivência respeitosa.",
  workflow: [
    "1. Cadastro do pet no sistema do condomínio",
    "2. Apresentação de documentação (vacinação, etc.)",
    "3. Orientação sobre regras de circulação",
    "4. Uso das áreas comuns com pet conforme regras",
    "5. Limpeza imediata de dejetos",
    "6. Respeito às regras de segurança e convivência",
    "7. Revisão periódica de cadastro e documentação"
  ],
  entities: ["Moradores", "Pets"],
  variables: ["permite_pets", "restricoes_pets"],
  documentType: "Regulamento",
  mermaid_diagram: `flowchart TD
    A["Cadastro do Pet<br/>(Moradores)"] --> B["Apresentação de Documentação<br/>(Moradores)"]
    B --> C["Orientação sobre Regras<br/>(Administradora)"]
    C --> D["Uso das Áreas Comuns<br/>(Moradores)"]
    D --> E["Limpeza de Dejetos<br/>(Moradores)"]
    E --> F["Respeito às Regras<br/>(Moradores)"]
    F --> G{Revisão Periódica?}
    G -->|Sim| H["Atualização de Cadastro<br/>(Moradores)"]
    G -->|Não| D
    H --> D
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#166534,stroke:#22c55e,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
  raci: [
    {
      step: "1. Cadastro do pet no sistema do condomínio",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: ["Administradora"],
    },
    {
      step: "2. Apresentação de documentação (vacinação, etc.)",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: ["Administradora"],
    },
    {
      step: "3. Orientação sobre regras de circulação",
      responsible: ["Administradora"],
      accountable: ["Síndico"],
      consulted: [],
      informed: ["Moradores"],
    },
    {
      step: "4. Uso das áreas comuns com pet conforme regras",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: [],
    },
    {
      step: "5. Limpeza imediata de dejetos",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: [],
    },
    {
      step: "6. Respeito às regras de segurança e convivência",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: [],
    },
    {
      step: "7. Revisão periódica de cadastro e documentação",
      responsible: ["Moradores"],
      accountable: ["Síndico"],
      consulted: [],
      informed: ["Administradora"],
    },
  ],
}

// ============================================================================
// GUIA DE CORES PARA DIAGRAMAS MERMAID
// ============================================================================

/**
 * CORES PADRÃO PARA DIAGRAMAS MERMAID:
 * 
 * AZUL (Responsáveis pela execução):
 *   fill:#1e3a8a,stroke:#3b82f6,color:#fff
 *   Usar para: atividades de execução, ações normais
 * 
 * VERDE (Aprovadores/Validação):
 *   fill:#166534,stroke:#22c55e,color:#fff
 *   Usar para: aprovações, validações, conclusões
 * 
 * VERMELHO (Urgente/Emergência/Negado):
 *   fill:#dc2626,stroke:#ef4444,color:#fff
 *   Usar para: emergências, negações, ações urgentes
 * 
 * EXEMPLO DE APLICAÇÃO:
 *   style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
 *   style B fill:#166534,stroke:#22c55e,color:#fff
 *   style C fill:#dc2626,stroke:#ef4444,color:#fff
 */

// ============================================================================
// ENTIDADES COMUNS DO SISTEMA
// ============================================================================

/**
 * ENTIDADES DISPONÍVEIS:
 * 
 * Governança:
 *   - "Síndico"
 *   - "Conselho Consultivo"
 *   - "Administradora"
 * 
 * Operação:
 *   - "Portaria Online"
 *   - "Faxineiro"
 *   - "Empresa de Manutenção"
 *   - "Empresa de Manutenção dos Elevadores"
 *   - "Empresa de Jardinagem"
 *   - "Fornecedores"
 * 
 * Pessoas:
 *   - "Moradores"
 *   - "Visitantes"
 *   - "Entregadores"
 * 
 * Segurança:
 *   - "Empresa de Segurança"
 *   - "Bombeiros"
 *   - "Polícia"
 *   - "SAMU"
 * 
 * Serviços:
 *   - "Concessionária de Energia"
 *   - "Empresa de Gás"
 */

// ============================================================================
// VARIÁVEIS COMUNS DO SISTEMA
// ============================================================================

/**
 * VARIÁVEIS DISPONÍVEIS (snake_case):
 * 
 * Horários:
 *   - "horario_silencio_dias_uteis"
 *   - "horario_silencio_fds"
 *   - "horario_academia"
 *   - "horario_spa"
 *   - "horario_escritorio"
 *   - "horario_areas_recreacao"
 *   - "horario_obras"
 *   - "horario_eventos"
 * 
 * Contatos:
 *   - "telefone_bombeiros"
 *   - "telefone_policia"
 *   - "telefone_samu"
 *   - "telefone_portaria"
 *   - "portaria_online_contato"
 *   - "telefone_concessionaria"
 * 
 * Configurações:
 *   - "permite_pets"
 *   - "restricoes_pets"
 *   - "politica_eventos"
 *   - "politica_obras"
 *   - "politica_reservas_areas_comuns"
 *   - "politica_substituicao_controle_remoto"
 *   - "vagas_por_unidade"
 *   - "limite_vagas_visitantes"
 *   - "capacidade_maxima"
 * 
 * Empresas:
 *   - "empresa_jardinagem"
 *   - "empresa_dedetizacao"
 *   - "empresa_elevador"
 *   - "empresa_portao"
 *   - "empresa_seguranca_rua"
 *   - "empresa_gas"
 */

// ============================================================================
// CHECKLIST PARA CRIAÇÃO DE PROCESSO
// ============================================================================

/**
 * CHECKLIST ANTES DE ADICIONAR UM NOVO PROCESSO:
 * 
 * [ ] ID único e sequencial
 * [ ] Nome descritivo e claro
 * [ ] Categoria correta selecionada
 * [ ] Ícone apropriado escolhido
 * [ ] Status definido (geralmente "em_revisao")
 * [ ] Descrição completa (2-3 frases)
 * [ ] Workflow com todas as etapas numeradas
 * [ ] Entidades envolvidas listadas
 * [ ] Variáveis do sistema identificadas
 * [ ] Tipo de documento correto
 * [ ] Diagrama Mermaid criado com:
 *     [ ] Responsáveis indicados em cada nó (<br/>(Responsável))
 *     [ ] Cores aplicadas (azul/verde/vermelho)
 *     [ ] Fluxo lógico correto
 * [ ] Matriz RACI completa:
 *     [ ] Uma entrada para cada etapa do workflow
 *     [ ] Responsáveis (R) definidos
 *     [ ] Aprovadores (A) definidos (geralmente Síndico)
 *     [ ] Consultados (C) definidos (pode ser vazio)
 *     [ ] Informados (I) definidos (pode ser vazio)
 * [ ] Testado visualmente no sistema
 */

