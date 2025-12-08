import { FileText, Shield, Lock, Wrench, Building2, Users, Calendar, AlertTriangle, LucideIcon } from "lucide-react"

export interface Process {
  id: number
  name: string
  category: string
  icon: LucideIcon
  status: string
  description: string
  workflow: string[]
  entities: string[]
  variables: string[]
  documentType: string
  mermaid_diagram?: string
}

export const processesData: Process[] = [
  // Governança
  {
    id: 1,
    name: "Definição e Revisão de Processos",
    category: "Governança",
    icon: FileText,
    status: "em_revisao",
    description: "Processo para definir, estruturar e revisar periodicamente todos os processos operacionais, administrativos e de convivência do condomínio. Garante que os processos estejam atualizados, completos e alinhados com as necessidades do condomínio.",
    workflow: [
      "1. Identificação da necessidade de novo processo ou revisão",
      "2. Estruturação do processo (categoria, subcategoria, entidades envolvidas)",
      "3. Definição de variáveis e parâmetros necessários",
      "4. Revisão pelo corpo consultivo (síndico + conselho)",
      "5. Aprovação e publicação do processo",
      "6. Revisão periódica conforme ciclo definido"
    ],
    entities: ["Síndico", "Conselho Consultivo", "Administradora"],
    variables: ["ciclo_revisao", "responsavel_revisao"],
    documentType: "Manual",
    mermaid_diagram: `flowchart TD
    A[Identificação da Necessidade] --> B[Elaboração do Rascunho]
    B --> C[Revisão Interna]
    C --> D[Apresentação ao Conselho]
    D --> E{Aprovado?}
    E -->|Sim| F[Publicação]
    E -->|Não| G[Ajustes]
    G --> C
    F --> H[Revisão Periódica]`
  },
  {
    id: 2,
    name: "Aprovação do Conselho Consultivo",
    category: "Governança",
    icon: FileText,
    status: "em_revisao",
    description: "Workflow de aprovação formal de processos e documentos pelo conselho consultivo. Define critérios, prazos e responsabilidades para aprovação de processos condominiais.",
    workflow: [
      "1. Submissão do processo/documento para aprovação",
      "2. Distribuição para membros do conselho consultivo",
      "3. Revisão individual pelos membros",
      "4. Reunião de deliberação do conselho",
      "5. Votação e decisão (aprovado/rejeitado/ajustes necessários)",
      "6. Comunicação da decisão e aplicação de ajustes se necessário"
    ],
    entities: ["Síndico", "Conselho Consultivo", "Administradora"],
    variables: ["prazo_aprovacao", "quorum_minimo"],
    documentType: "Regulamento"
  },
  {
    id: 3,
    name: "Emissão de Documentos Formais",
    category: "Governança",
    icon: FileText,
    status: "em_revisao",
    description: "Processo para gerar e emitir documentos oficiais (POPs, manuais, regulamentos, avisos, comunicados) baseados nos processos aprovados, aplicando variáveis configuradas e em formato pronto para publicação.",
    workflow: [
      "1. Seleção do processo e tipo de documento a gerar",
      "2. Aplicação automática de variáveis configuradas",
      "3. Geração do documento em formato estruturado",
      "4. Revisão do documento gerado",
      "5. Aprovação final pelo síndico",
      "6. Publicação no website ou distribuição aos moradores"
    ],
    entities: ["Síndico", "Conselho Consultivo", "Administradora"],
    variables: ["nome_sindico", "contato_sindico", "administradora_nome"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Seleção do Processo] --> B[Aplicação de Variáveis]
    B --> C[Geração do Documento]
    C --> D[Revisão do Documento]
    D --> E{Aprovado?}
    E -->|Sim| F[Publicação]
    E -->|Não| G[Correções]
    G --> D
    F --> H[Distribuição aos Moradores]`
  },
  
  // Acesso e Segurança
  {
    id: 4,
    name: "Uso de Biometria (Entradas Sociais)",
    category: "Acesso e Segurança",
    icon: Lock,
    status: "em_revisao",
    description: "Procedimento para cadastro, uso e gestão do sistema de biometria facial e digital nas entradas sociais do condomínio. Define regras de acesso, cadastro de moradores e visitantes autorizados.",
    workflow: [
      "1. Solicitação de cadastro biométrico pelo morador",
      "2. Verificação de identidade e documentação",
      "3. Cadastro no sistema biométrico (facial e digital)",
      "4. Teste de funcionamento e ativação",
      "5. Orientação sobre uso e regras de acesso",
      "6. Monitoramento e manutenção do sistema"
    ],
    entities: ["Moradores", "Portaria Online", "Sistema de Biometria"],
    variables: ["tipo_acesso_portas", "horario_funcionamento"],
    documentType: "POP"
  },
  {
    id: 5,
    name: "Uso de Controle Remoto (Garagem)",
    category: "Acesso e Segurança",
    icon: Lock,
    status: "em_revisao",
    description: "Procedimento para uso, cadastro e substituição de controles remotos da garagem. Define regras de distribuição, bloqueio em caso de perda e substituição de dispositivos.",
    workflow: [
      "1. Solicitação de controle remoto pelo morador",
      "2. Verificação de vaga e documentação",
      "3. Cadastro do controle no sistema",
      "4. Entrega e orientação sobre uso",
      "5. Em caso de perda: bloqueio imediato do dispositivo",
      "6. Substituição mediante solicitação e taxa se aplicável"
    ],
    entities: ["Moradores", "Portaria Online", "Sistema de Portão"],
    variables: ["tipo_abertura_portao", "vagas_por_unidade"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Controle] --> B[Verificação de Vaga]
    B --> C[Cadastro no Sistema]
    C --> D[Entrega e Orientação]
    D --> E{Uso Normal}
    E -->|Perda| F[Bloqueio Imediato]
    E -->|Substituição| G[Solicitação de Substituição]
    F --> G
    G --> H[Novo Cadastro]`
  },
  {
    id: 6,
    name: "Cadastro, Bloqueio e Substituição",
    category: "Acesso e Segurança",
    icon: Lock,
    status: "em_revisao",
    description: "Processo unificado para gerenciar cadastros de acesso (biometria, controles remotos), bloqueio de dispositivos em caso de perda ou término de contrato, e substituição de dispositivos.",
    workflow: [
      "1. Solicitação de cadastro/bloqueio/substituição",
      "2. Verificação de identidade e autorização",
      "3. Execução da ação (cadastro/bloqueio/substituição)",
      "4. Registro no sistema de ocorrências",
      "5. Notificação ao solicitante",
      "6. Atualização de documentação e registros"
    ],
    entities: ["Moradores", "Portaria Online", "Administradora"],
    variables: ["politica_substituicao_controle_remoto"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Solicitação] --> B{Tipo de Ação}
    B -->|Cadastro| C[Verificação de Autorização]
    B -->|Bloqueio| D[Verificação de Identidade]
    B -->|Substituição| E[Verificação e Taxa]
    C --> F[Execução]
    D --> F
    E --> F
    F --> G[Registro no Sistema]
    G --> H[Notificação]`
  },
  {
    id: 7,
    name: "Câmeras: Uso, Privacidade e Auditoria",
    category: "Acesso e Segurança",
    icon: Shield,
    status: "em_revisao",
    description: "Regulamento sobre uso do sistema de câmeras de segurança (CFTV), políticas de privacidade, acesso às gravações e procedimentos de auditoria. Garante segurança respeitando privacidade dos moradores.",
    workflow: [
      "1. Monitoramento contínuo das áreas comuns",
      "2. Gravação e armazenamento conforme política de retenção",
      "3. Solicitação de acesso às gravações (apenas autorizados)",
      "4. Verificação de autorização e motivo da solicitação",
      "5. Fornecimento de gravação com registro de acesso",
      "6. Auditoria periódica de acessos e uso do sistema"
    ],
    entities: ["Síndico", "Empresa de Segurança", "Portaria Online"],
    variables: ["retencao_gravacoes", "areas_monitoradas"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Monitoramento Contínuo] --> B[Gravação]
    B --> C[Armazenamento]
    C --> D{Solicitação de Acesso}
    D -->|Sim| E[Verificação de Autorização]
    D -->|Não| F[Retenção Periódica]
    E --> G{Autorizado?}
    G -->|Sim| H[Fornecimento de Gravação]
    G -->|Não| I[Negado]
    H --> J[Registro de Acesso]
    F --> K[Auditoria Periódica]`
  },
  {
    id: 8,
    name: "Acesso de Visitantes",
    category: "Acesso e Segurança",
    icon: Lock,
    status: "em_revisao",
    description: "Procedimento para autorização e controle de acesso de visitantes ao condomínio. Define regras de autorização, registro e acompanhamento de visitantes.",
    workflow: [
      "1. Solicitação de autorização pelo morador (presencial ou via app)",
      "2. Verificação de identidade do morador solicitante",
      "3. Registro do visitante no sistema",
      "4. Autorização de acesso e orientação",
      "5. Acompanhamento e registro de entrada/saída",
      "6. Encerramento da visita e atualização de registros"
    ],
    entities: ["Moradores", "Visitantes", "Portaria Online"],
    variables: ["portaria_funcionamento", "horario_visitas"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Solicitação pelo Morador] --> B[Verificação de Identidade]
    B --> C[Registro do Visitante]
    C --> D[Autorização de Acesso]
    D --> E[Orientação]
    E --> F[Entrada]
    F --> G[Acompanhamento]
    G --> H[Saída]
    H --> I[Atualização de Registros]`
  },
  {
    id: 9,
    name: "Relatórios de Incidentes",
    category: "Acesso e Segurança",
    icon: Shield,
    status: "em_revisao",
    description: "Processo para registro, análise e acompanhamento de incidentes de segurança no condomínio. Garante rastreabilidade e ações corretivas adequadas.",
    workflow: [
      "1. Identificação e registro do incidente",
      "2. Classificação do incidente (gravidade, tipo)",
      "3. Notificação aos responsáveis (síndico, segurança)",
      "4. Investigação e coleta de evidências",
      "5. Análise e definição de ações corretivas",
      "6. Implementação de medidas e acompanhamento",
      "7. Registro no histórico e lições aprendidas"
    ],
    entities: ["Síndico", "Empresa de Segurança", "Portaria Online", "Moradores"],
    variables: ["telefone_policia", "telefone_bombeiros"],
    documentType: "Formulário",
    mermaid_diagram: `flowchart TD
    A[Identificação do Incidente] --> B[Registro]
    B --> C[Classificação]
    C --> D[Notificação]
    D --> E[Investigação]
    E --> F[Coleta de Evidências]
    F --> G[Análise]
    G --> H[Ações Corretivas]
    H --> I[Implementação]
    I --> J[Acompanhamento]
    J --> K[Registro no Histórico]`
  },
  
  // Operação
  {
    id: 10,
    name: "Portaria Online",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento operacional para funcionamento da portaria online, incluindo autorização de moradores, controle de visitantes, controle de entregas e comunicação de incidentes.",
    workflow: [
      "1. Atendimento de solicitações via sistema/app",
      "2. Verificação de autorização e identidade",
      "3. Processamento da solicitação (acesso, entrega, etc.)",
      "4. Registro no sistema de ocorrências",
      "5. Comunicação com morador quando necessário",
      "6. Atuação em contingência quando sistema offline"
    ],
    entities: ["Portaria Online", "Moradores", "Visitantes", "Entregadores"],
    variables: ["portaria_online_contato", "portaria_funcionamento"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Atendimento via Sistema] --> B[Verificação de Autorização]
    B --> C{Tipo de Solicitação}
    C -->|Acesso| D[Processamento de Acesso]
    C -->|Entrega| E[Processamento de Entrega]
    C -->|Outro| F[Processamento Específico]
    D --> G[Registro no Sistema]
    E --> G
    F --> G
    G --> H[Comunicação]
    H --> I{Sistema Online?}
    I -->|Não| J[Atuação em Contingência]
    I -->|Sim| K[Concluído]`
  },
  {
    id: 11,
    name: "Rotina de Limpeza (Faxineiro)",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.",
    workflow: [
      "1. Execução da rotina diária de limpeza",
      "2. Preenchimento de checklist semanal/mensal",
      "3. Identificação de necessidade de reposição de materiais",
      "4. Reporte de problemas estruturais identificados",
      "5. Comunicação ao síndico/administradora",
      "6. Acompanhamento de correções e melhorias"
    ],
    entities: ["Portaria Online", "Moradores", "Visitantes", "Entregadores"],
    variables: ["portaria_online_contato", "portaria_funcionamento"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Atendimento via Sistema] --> B[Verificação de Autorização]
    B --> C{Tipo de Solicitação}
    C -->|Acesso| D[Processamento de Acesso]
    C -->|Entrega| E[Processamento de Entrega]
    C -->|Outro| F[Processamento Específico]
    D --> G[Registro no Sistema]
    E --> G
    F --> G
    G --> H[Comunicação]
    H --> I{Sistema Online?}
    I -->|Não| J[Atuação em Contingência]
    I -->|Sim| K[Concluído]`
  },
  {
    id: 11,
    name: "Rotina de Limpeza (Faxineiro)",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.",
    workflow: [
      "1. Execução da rotina diária de limpeza",
      "2. Preenchimento de checklist semanal/mensal",
      "3. Identificação de necessidade de reposição de materiais",
      "4. Reporte de problemas estruturais identificados",
      "5. Comunicação ao síndico/administradora",
      "6. Acompanhamento de correções e melhorias"
    ],
    entities: ["Faxineiro", "Síndico", "Administradora"],
    variables: ["areas_comuns", "frequencia_limpeza"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Execução da Rotina Diária] --> B[Preenchimento de Checklist]
    B --> C{Necessidade de Reposição?}
    C -->|Sim| D[Identificação de Materiais]
    C -->|Não| E{Problemas Estruturais?}
    D --> F[Comunicação ao Síndico]
    E -->|Sim| G[Reporte de Problemas]
    E -->|Não| H[Concluído]
    F --> I[Acompanhamento]
    G --> F
    I --> H`
  },
  {
    id: 12,
    name: "Rotina de Limpeza (Faxineiro)",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.",
    workflow: [
      "1. Execução da rotina diária de limpeza",
      "2. Preenchimento de checklist semanal/mensal",
      "3. Identificação de necessidade de reposição de materiais",
      "4. Reporte de problemas estruturais identificados",
      "5. Comunicação ao síndico/administradora",
      "6. Acompanhamento de correções e melhorias"
    ],
    entities: ["Faxineiro", "Síndico", "Administradora"],
    variables: ["areas_comuns", "frequencia_limpeza"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Execução da Rotina Diária] --> B[Preenchimento de Checklist]
    B --> C{Necessidade de Reposição?}
    C -->|Sim| D[Identificação de Materiais]
    C -->|Não| E{Problemas Estruturais?}
    D --> F[Comunicação ao Síndico]
    E -->|Sim| G[Reporte de Problemas]
    E -->|Não| H[Concluído]
    F --> I[Acompanhamento]
    G --> F
    I --> H`
  },
  {
    id: 12,
    name: "Gestão de Fornecedores",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Processo para cadastro, avaliação, contratação e acompanhamento de fornecedores do condomínio (jardinagem, dedetização, manutenção, etc.).",
    workflow: [
      "1. Identificação de necessidade de serviço",
      "2. Pesquisa e cotação de fornecedores",
      "3. Avaliação e seleção de fornecedor",
      "4. Aprovação pelo conselho consultivo",
      "5. Contratação e cadastro no sistema",
      "6. Acompanhamento de serviços e avaliação de desempenho",
      "7. Renovação ou substituição conforme necessário"
    ],
    entities: ["Síndico", "Conselho Consultivo", "Administradora", "Fornecedores"],
    variables: ["empresa_jardinagem", "empresa_dedetizacao"],
    documentType: "Manual",
    mermaid_diagram: `flowchart TD
    A[Identificação de Necessidade] --> B[Pesquisa e Cotação]
    B --> C[Avaliação e Seleção]
    C --> D[Aprovação pelo Conselho]
    D --> E{Aprovado?}
    E -->|Sim| F[Contratação e Cadastro]
    E -->|Não| G[Buscar Outro Fornecedor]
    G --> B
    F --> H[Acompanhamento de Serviços]
    H --> I{Avaliação de Desempenho}
    I -->|Bom| J[Renovação]
    I -->|Ruim| K[Substituição]
    K --> B`
  },
  {
    id: 13,
    name: "Manutenção de Elevadores",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento para manutenção preventiva e corretiva dos elevadores, incluindo agendamento, execução, registro e comunicação de problemas.",
    workflow: [
      "1. Agendamento de manutenção preventiva (mensal/trimestral)",
      "2. Notificação prévia aos moradores",
      "3. Execução da manutenção pela empresa especializada",
      "4. Registro de serviços realizados",
      "5. Em caso de problema: abertura de chamado urgente",
      "6. Acompanhamento até resolução",
      "7. Atualização de documentação e histórico"
    ],
    entities: ["Empresa de Manutenção dos Elevadores", "Síndico", "Moradores"],
    variables: ["empresa_elevador", "frequencia_manutencao"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Agendamento Preventiva] --> B[Notificação aos Moradores]
    B --> C[Execução da Manutenção]
    C --> D[Registro de Serviços]
    D --> E{Problema Identificado?}
    E -->|Sim| F[Chamado Urgente]
    E -->|Não| G[Atualização de Documentação]
    F --> H[Acompanhamento]
    H --> I[Resolução]
    I --> G
    G --> J[Histórico Atualizado]`
  },
  {
    id: 14,
    name: "Manutenção do Portão Automático",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Procedimento para manutenção preventiva e corretiva do portão automático da garagem, garantindo funcionamento adequado e segurança.",
    workflow: [
      "1. Agendamento de manutenção preventiva",
      "2. Execução de inspeção e manutenção",
      "3. Teste de funcionamento",
      "4. Registro de serviços e peças substituídas",
      "5. Em caso de falha: chamado urgente",
      "6. Resolução e verificação de funcionamento",
      "7. Comunicação ao síndico e moradores se necessário"
    ],
    entities: ["Empresa de Manutenção", "Síndico", "Portaria Online"],
    variables: ["empresa_portao", "frequencia_manutencao"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Agendamento Preventiva] --> B[Inspeção e Manutenção]
    B --> C[Teste de Funcionamento]
    C --> D{Funcionando?}
    D -->|Sim| E[Registro de Serviços]
    D -->|Não| F[Chamado Urgente]
    E --> G[Comunicação se Necessário]
    F --> H[Resolução]
    H --> I[Verificação]
    I --> D
    G --> J[Concluído]`
  },
  {
    id: 15,
    name: "Gestão de Materiais",
    category: "Operação",
    icon: Wrench,
    status: "em_revisao",
    description: "Processo para controle de estoque, compra e reposição de materiais de limpeza, manutenção e operação do condomínio.",
    workflow: [
      "1. Monitoramento de estoque de materiais",
      "2. Identificação de necessidade de reposição",
      "3. Solicitação de compra ao síndico/administradora",
      "4. Aprovação e compra",
      "5. Recebimento e conferência",
      "6. Armazenamento adequado",
      "7. Registro no controle de estoque"
    ],
    entities: ["Faxineiro", "Síndico", "Administradora"],
    variables: ["estoque_minimo", "fornecedor_materiais"],
    documentType: "Manual",
    mermaid_diagram: `flowchart TD
    A[Monitoramento de Estoque] --> B{Estoque Mínimo?}
    B -->|Sim| C[Identificação de Necessidade]
    B -->|Não| A
    C --> D[Solicitação de Compra]
    D --> E[Aprovação]
    E --> F[Compra]
    F --> G[Recebimento e Conferência]
    G --> H[Armazenamento]
    H --> I[Registro no Controle]
    I --> A`
  },
  
  // Áreas Comuns
  {
    id: 16,
    name: "Escritório Compartilhado",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Regulamento de uso do escritório compartilhado (home office), incluindo reservas, horários, regras de uso e manutenção do espaço.",
    workflow: [
      "1. Solicitação de reserva pelo morador",
      "2. Verificação de disponibilidade",
      "3. Confirmação da reserva",
      "4. Uso do espaço conforme regras estabelecidas",
      "5. Limpeza e organização ao término do uso",
      "6. Registro de uso e feedback se necessário"
    ],
    entities: ["Moradores", "Administradora"],
    variables: ["horario_escritorio", "politica_reservas_areas_comuns"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Reserva] --> B[Verificação de Disponibilidade]
    B --> C{Disponível?}
    C -->|Sim| D[Confirmação da Reserva]
    C -->|Não| E[Propor Outro Horário]
    E --> B
    D --> F[Uso do Espaço]
    F --> G[Limpeza e Organização]
    G --> H[Registro de Uso]
    H --> I[Feedback se Necessário]`
  },
  {
    id: 17,
    name: "Academia",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Regulamento de uso da academia, incluindo horários, regras de segurança, limpeza de equipamentos e reservas quando aplicável.",
    workflow: [
      "1. Verificação de horário de funcionamento",
      "2. Acesso à academia (biometria ou chave)",
      "3. Uso dos equipamentos conforme regras de segurança",
      "4. Limpeza dos equipamentos após uso",
      "5. Organização do espaço",
      "6. Saída e registro de uso"
    ],
    entities: ["Moradores"],
    variables: ["horario_academia", "capacidade_maxima"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Verificação de Horário] --> B[Acesso à Academia]
    B --> C[Uso dos Equipamentos]
    C --> D[Limpeza dos Equipamentos]
    D --> E[Organização do Espaço]
    E --> F[Saída]
    F --> G[Registro de Uso]`
  },
  {
    id: 18,
    name: "SPA - Sala de Massagem",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Regulamento de uso da SPA/Sala de Massagem, incluindo reservas, horários, regras de uso, limpeza e manutenção.",
    workflow: [
      "1. Solicitação de reserva com antecedência",
      "2. Verificação de disponibilidade e confirmação",
      "3. Uso do espaço no horário reservado",
      "4. Limpeza completa após uso",
      "5. Verificação de equipamentos e reporte de problemas",
      "6. Encerramento da reserva"
    ],
    entities: ["Moradores", "Administradora"],
    variables: ["horario_spa", "politica_reservas_areas_comuns"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Reserva] --> B[Verificação de Disponibilidade]
    B --> C[Confirmação]
    C --> D[Uso no Horário Reservado]
    D --> E[Limpeza Completa]
    E --> F[Verificação de Equipamentos]
    F --> G{Problemas?}
    G -->|Sim| H[Reporte de Problemas]
    G -->|Não| I[Encerramento]
    H --> I`
  },
  {
    id: 19,
    name: "Área de Recreação",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Regulamento de uso da área de recreação, incluindo horários, regras de convivência, reservas para eventos e manutenção.",
    workflow: [
      "1. Verificação de disponibilidade ou solicitação de reserva",
      "2. Uso da área conforme regras estabelecidas",
      "3. Respeito aos horários e regras de silêncio",
      "4. Limpeza e organização ao término",
      "5. Reporte de problemas ou danos",
      "6. Registro de uso se necessário"
    ],
    entities: ["Moradores", "Visitantes"],
    variables: ["horario_areas_recreacao", "politica_reservas_areas_comuns"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Verificação de Disponibilidade] --> B{Reserva Necessária?}
    B -->|Sim| C[Solicitação de Reserva]
    B -->|Não| D[Uso da Área]
    C --> E[Confirmação]
    E --> D
    D --> F[Respeito às Regras]
    F --> G[Limpeza e Organização]
    G --> H{Problemas ou Danos?}
    H -->|Sim| I[Reporte]
    H -->|Não| J[Registro de Uso]
    I --> J`
  },
  {
    id: 20,
    name: "Jardins",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Procedimento para manutenção e cuidado dos jardins, incluindo regas, podas, limpeza e melhorias paisagísticas.",
    workflow: [
      "1. Planejamento de manutenção periódica",
      "2. Execução de serviços (rega, poda, limpeza)",
      "3. Monitoramento de saúde das plantas",
      "4. Identificação de necessidades de melhorias",
      "5. Execução de melhorias paisagísticas quando aprovadas",
      "6. Registro de serviços e acompanhamento"
    ],
    entities: ["Empresa de Jardinagem", "Síndico"],
    variables: ["empresa_jardinagem", "frequencia_manutencao"],
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A[Planejamento Periódico] --> B[Execução de Serviços]
    B --> C[Monitoramento de Saúde]
    C --> D{Necessidade de Melhorias?}
    D -->|Sim| E[Aprovação de Melhorias]
    D -->|Não| F[Registro de Serviços]
    E --> G[Execução de Melhorias]
    G --> F
    F --> H[Acompanhamento]`
  },
  {
    id: 21,
    name: "Estacionamento de Visitantes",
    category: "Áreas Comuns",
    icon: Building2,
    status: "em_revisao",
    description: "Regulamento de uso das vagas de visitantes, incluindo regras de estacionamento, tempo máximo de permanência e controle de uso.",
    workflow: [
      "1. Solicitação de autorização de estacionamento pelo morador",
      "2. Verificação de disponibilidade de vagas",
      "3. Autorização e registro do veículo",
      "4. Estacionamento na vaga designada",
      "5. Monitoramento de tempo de permanência",
      "6. Saída e liberação da vaga"
    ],
    entities: ["Moradores", "Visitantes", "Portaria Online"],
    variables: ["possui_vagas_visitantes", "limite_vagas_visitantes", "tempo_maximo_estacionamento"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Autorização] --> B[Verificação de Vagas]
    B --> C{Disponível?}
    C -->|Sim| D[Autorização e Registro]
    C -->|Não| E[Negado]
    D --> F[Estacionamento]
    F --> G[Monitoramento de Tempo]
    G --> H{Excedeu Tempo?}
    H -->|Sim| I[Notificação]
    H -->|Não| J[Saída]
    I --> J
    J --> K[Liberação da Vaga]`
  },
  
  // Convivência
  {
    id: 22,
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
    A[Cadastro do Pet] --> B[Apresentação de Documentação]
    B --> C[Orientação sobre Regras]
    C --> D[Uso das Áreas Comuns]
    D --> E[Limpeza de Dejetos]
    E --> F[Respeito às Regras]
    F --> G{Revisão Periódica?}
    G -->|Sim| H[Atualização de Cadastro]
    G -->|Não| D
    H --> D`
  },
  {
    id: 23,
    name: "Regras de Silêncio",
    category: "Convivência",
    icon: Users,
    status: "em_revisao",
    description: "Regulamento sobre horários de silêncio, regras de convivência e procedimentos em caso de perturbação do sossego.",
    workflow: [
      "1. Conhecimento das regras de silêncio pelos moradores",
      "2. Respeito aos horários estabelecidos",
      "3. Em caso de perturbação: comunicação ao síndico/portaria",
      "4. Verificação e orientação ao morador responsável",
      "5. Aplicação de medidas se necessário",
      "6. Registro de ocorrência se reincidente"
    ],
    entities: ["Moradores", "Síndico", "Portaria Online"],
    variables: ["horario_silencio_dias_uteis", "horario_silencio_fds"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Conhecimento das Regras] --> B[Respeito aos Horários]
    B --> C{Perturbação?}
    C -->|Sim| D[Comunicação ao Síndico]
    C -->|Não| E[Convivência Normal]
    D --> F[Verificação]
    F --> G[Orientação]
    G --> H{Reincidência?}
    H -->|Sim| I[Medidas]
    H -->|Não| E
    I --> J[Registro de Ocorrência]`
  },
  {
    id: 24,
    name: "Obras Internas",
    category: "Convivência",
    icon: Users,
    status: "em_revisao",
    description: "Procedimento para solicitação, aprovação e execução de obras internas nas unidades, incluindo regras, horários e documentação necessária.",
    workflow: [
      "1. Solicitação de obra pelo morador",
      "2. Apresentação de documentação (projeto, ART, etc.)",
      "3. Aprovação pelo síndico/conselho",
      "4. Definição de horários e regras de execução",
      "5. Notificação aos moradores vizinhos",
      "6. Execução da obra conforme aprovado",
      "7. Vistoria e aprovação final",
      "8. Limpeza e organização do espaço comum utilizado"
    ],
    entities: ["Moradores", "Síndico", "Conselho Consultivo"],
    variables: ["politica_obras", "horario_obras"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Obra] --> B[Apresentação de Documentação]
    B --> C[Aprovação pelo Síndico]
    C --> D{Aprovado?}
    D -->|Sim| E[Definição de Horários]
    D -->|Não| F[Correções]
    F --> B
    E --> G[Notificação aos Vizinhos]
    G --> H[Execução da Obra]
    H --> I[Vistoria]
    I --> J{Aprovado?}
    J -->|Sim| K[Limpeza]
    J -->|Não| L[Correções]
    L --> H
    K --> M[Concluído]`
  },
  
  // Eventos
  {
    id: 25,
    name: "Assembleias",
    category: "Eventos",
    icon: Calendar,
    status: "em_revisao",
    description: "Procedimento para organização, convocação e realização de assembleias condominiais, incluindo pauta, quórum e atas.",
    workflow: [
      "1. Definição de pauta e data pela administradora/síndico",
      "2. Convocação formal com antecedência mínima",
      "3. Distribuição de material e documentação",
      "4. Realização da assembleia",
      "5. Registro de presença e quórum",
      "6. Deliberações e votações",
      "7. Elaboração e aprovação da ata",
      "8. Distribuição da ata aos moradores"
    ],
    entities: ["Síndico", "Conselho Consultivo", "Administradora", "Moradores"],
    variables: ["prazo_convocacao", "quorum_minimo"],
    documentType: "Manual",
    mermaid_diagram: `flowchart TD
    A[Definição de Pauta] --> B[Convocacao Formal]
    B --> C[Distribuição de Material]
    C --> D[Realização da Assembleia]
    D --> E[Registro de Presença]
    E --> F[Verificação de Quórum]
    F --> G{Quórum Atingido?}
    G -->|Sim| H[Deliberações e Votações]
    G -->|Não| I[Adiamento]
    H --> J[Elaboração da Ata]
    J --> K[Aprovação da Ata]
    K --> L[Distribuição aos Moradores]`
  },
  {
    id: 26,
    name: "Manutenções Programadas",
    category: "Eventos",
    icon: Calendar,
    status: "em_revisao",
    description: "Processo para planejamento, comunicação e execução de manutenções programadas que afetam áreas comuns ou unidades.",
    workflow: [
      "1. Planejamento anual de manutenções",
      "2. Agendamento com fornecedores",
      "3. Comunicação prévia aos moradores afetados",
      "4. Preparação do local e equipamentos",
      "5. Execução da manutenção",
      "6. Verificação e testes",
      "7. Comunicação de conclusão",
      "8. Registro no histórico de manutenções"
    ],
    entities: ["Síndico", "Fornecedores", "Moradores"],
    variables: ["calendario_manutencoes"],
    documentType: "Manual",
    mermaid_diagram: `flowchart TD
    A[Planejamento Anual] --> B[Agendamento com Fornecedores]
    B --> C[Comunicação aos Moradores]
    C --> D[Preparação do Local]
    D --> E[Execução da Manutenção]
    E --> F[Verificação e Testes]
    F --> G{Sucesso?}
    G -->|Sim| H[Comunicação de Conclusão]
    G -->|Não| I[Correções]
    I --> E
    H --> J[Registro no Histórico]`
  },
  {
    id: 27,
    name: "Festas e Reuniões Privadas",
    category: "Eventos",
    icon: Calendar,
    status: "em_revisao",
    description: "Regulamento para reserva e uso de áreas comuns para festas e reuniões privadas de moradores, incluindo regras, horários e limpeza.",
    workflow: [
      "1. Solicitação de reserva com antecedência",
      "2. Verificação de disponibilidade",
      "3. Aprovação e confirmação da reserva",
      "4. Pagamento de taxa se aplicável",
      "5. Uso do espaço no horário reservado",
      "6. Limpeza completa após o evento",
      "7. Vistoria e liberação",
      "8. Registro de uso"
    ],
    entities: ["Moradores", "Administradora"],
    variables: ["politica_eventos", "horario_eventos"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Solicitação de Reserva] --> B[Verificação de Disponibilidade]
    B --> C{Aprovado?}
    C -->|Sim| D[Confirmação]
    C -->|Não| E[Negado]
    D --> F[Pagamento de Taxa]
    F --> G[Uso do Espaço]
    G --> H[Limpeza Completa]
    H --> I[Vistoria]
    I --> J[Liberação]
    J --> K[Registro de Uso]`
  },
  {
    id: 28,
    name: "Reservas de Áreas",
    category: "Eventos",
    icon: Calendar,
    status: "em_revisao",
    description: "Processo unificado para reserva de áreas comuns (escritório, SPA, área de recreação) incluindo sistema de reservas, regras e cancelamentos.",
    workflow: [
      "1. Consulta de disponibilidade no sistema",
      "2. Solicitação de reserva",
      "3. Verificação e confirmação",
      "4. Uso da área no horário reservado",
      "5. Limpeza e organização",
      "6. Encerramento da reserva",
      "7. Em caso de cancelamento: comunicação com antecedência"
    ],
    entities: ["Moradores", "Administradora"],
    variables: ["politica_reservas_areas_comuns", "prazo_cancelamento"],
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A[Consulta de Disponibilidade] --> B[Solicitação de Reserva]
    B --> C[Verificação]
    C --> D[Confirmação]
    D --> E[Uso da Área]
    E --> F[Limpeza]
    F --> G[Encerramento]
    G --> H{Cancelamento?}
    H -->|Sim| I[Comunicação com Antecedência]
    H -->|Não| J[Concluído]`
  },
  
  // Emergências
  {
    id: 29,
    name: "Incêndio",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações de incêndio ou princípio de incêndio, incluindo evacuação, acionamento de bombeiros e ponto de encontro.",
    workflow: [
      "1. Identificação do incêndio",
      "2. Acionamento imediato dos bombeiros (193)",
      "3. Acionamento do alarme de incêndio",
      "4. Evacuação ordenada do prédio",
      "5. Direcionamento para ponto de encontro",
      "6. Verificação de presença de moradores",
      "7. Aguardar chegada dos bombeiros",
      "8. Fornecer informações aos bombeiros",
      "9. Retorno ao prédio apenas após autorização",
      "10. Registro do incidente e lições aprendidas"
    ],
    entities: ["Moradores", "Bombeiros", "Síndico", "Portaria Online"],
    variables: ["telefone_bombeiros", "ponto_encontro_incendio"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação do Incêndio] --> B[Acionamento Bombeiros 193]
    B --> C[Acionamento do Alarme]
    C --> D[Evacuação Ordenada]
    D --> E[Ponto de Encontro]
    E --> F[Verificação de Presença]
    F --> G[Aguardar Bombeiros]
    G --> H[Fornecer Informações]
    H --> I{Autorização?}
    I -->|Sim| J[Retorno ao Prédio]
    I -->|Não| G
    J --> K[Registro do Incidente]`
  },
  {
    id: 30,
    name: "Vazamento de Gás",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações de vazamento de gás, incluindo segurança, evacuação e acionamento de serviços especializados.",
    workflow: [
      "1. Identificação do vazamento",
      "2. Não acionar interruptores ou equipamentos elétricos",
      "3. Ventilar o ambiente se seguro",
      "4. Evacuar a área imediatamente",
      "5. Acionar bombeiros (193) e empresa de gás",
      "6. Isolar a área",
      "7. Aguardar chegada dos profissionais",
      "8. Retorno apenas após liberação",
      "9. Verificação e reparo",
      "10. Registro do incidente"
    ],
    entities: ["Moradores", "Bombeiros", "Empresa de Gás", "Síndico"],
    variables: ["telefone_bombeiros", "empresa_gas"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação do Vazamento] --> B[NÃO Acionar Interruptores]
    B --> C{Ventilar Seguro?}
    C -->|Sim| D[Ventilar Ambiente]
    C -->|Não| E[Evacuar Imediatamente]
    D --> E
    E --> F[Acionar Bombeiros 193]
    F --> G[Acionar Empresa de Gás]
    G --> H[Isolar a Área]
    H --> I[Aguardar Profissionais]
    I --> J{Liberação?}
    J -->|Sim| K[Retorno]
    J -->|Não| I
    K --> L[Verificação e Reparo]
    L --> M[Registro do Incidente]`
  },
  {
    id: 31,
    name: "Falta de Energia",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento para situações de falta de energia elétrica, incluindo verificação, comunicação e acionamento de serviços.",
    workflow: [
      "1. Identificação da falta de energia",
      "2. Verificação se é problema local ou geral",
      "3. Comunicação à portaria/síndico",
      "4. Verificação de disjuntores e sistema elétrico",
      "5. Acionamento da concessionária se necessário",
      "6. Comunicação aos moradores",
      "7. Acompanhamento até resolução",
      "8. Verificação de funcionamento após retorno",
      "9. Registro do incidente"
    ],
    entities: ["Moradores", "Síndico", "Concessionária de Energia", "Portaria Online"],
    variables: ["telefone_concessionaria"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação da Falta] --> B{Problema Local ou Geral?}
    B -->|Local| C[Verificação de Disjuntores]
    B -->|Geral| D[Comunicação à Portaria]
    C --> E{Resolvido?}
    E -->|Sim| F[Verificação de Funcionamento]
    E -->|Não| D
    D --> G[Acionamento Concessionária]
    G --> H[Comunicação aos Moradores]
    H --> I[Acompanhamento]
    I --> J[Retorno da Energia]
    J --> F
    F --> K[Registro do Incidente]`
  },
  {
    id: 32,
    name: "Elevador Preso",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações de pessoas presas no elevador, incluindo acionamento de socorro e resgate.",
    workflow: [
      "1. Identificação de pessoas presas no elevador",
      "2. Acionamento do botão de emergência",
      "3. Comunicação com portaria/síndico",
      "4. Acionamento imediato da empresa de manutenção",
      "5. Tranquilização das pessoas presas",
      "6. Acompanhamento até resgate",
      "7. Verificação de condições das pessoas resgatadas",
      "8. Acionamento de serviços médicos se necessário",
      "9. Bloqueio do elevador até reparo",
      "10. Registro do incidente"
    ],
    entities: ["Moradores", "Empresa de Manutenção dos Elevadores", "Síndico", "Portaria Online"],
    variables: ["empresa_elevador", "telefone_samu"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação de Pessoas Presas] --> B[Botão de Emergência]
    B --> C[Comunicação Portaria/Síndico]
    C --> D[Acionamento Empresa Manutenção]
    D --> E[Tranquilização das Pessoas]
    E --> F[Acompanhamento]
    F --> G[Resgate]
    G --> H{Necessita Atendimento Médico?}
    H -->|Sim| I[Acionamento SAMU]
    H -->|Não| J[Verificação de Condições]
    I --> J
    J --> K[Bloqueio do Elevador]
    K --> L[Reparo]
    L --> M[Registro do Incidente]`
  },
  {
    id: 33,
    name: "Ameaça à Segurança",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações de ameaça à segurança (roubo, agressão, invasão), incluindo acionamento de polícia e medidas de segurança.",
    workflow: [
      "1. Identificação da ameaça",
      "2. Acionamento imediato da polícia (190)",
      "3. Acionamento da empresa de segurança",
      "4. Isolamento da área se possível",
      "5. Proteção de evidências",
      "6. Comunicação ao síndico",
      "7. Aguardar chegada da polícia",
      "8. Fornecer informações e evidências",
      "9. Acompanhamento do caso",
      "10. Reforço de medidas de segurança se necessário",
      "11. Registro detalhado do incidente"
    ],
    entities: ["Moradores", "Polícia", "Empresa de Segurança", "Síndico", "Portaria Online"],
    variables: ["telefone_policia", "empresa_seguranca_rua"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: 
  },
  {
    id: 34,
    name: "Emergências Médicas",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações médicas urgentes, incluindo acionamento de SAMU, primeiros socorros e apoio.",
    workflow: [
      "1. Identificação da emergência médica",
      "2. Acionamento imediato do SAMU (192)",
      "3. Prestação de primeiros socorros se capacitado",
      "4. Comunicação à portaria/síndico",
      "5. Preparação do acesso para ambulância",
      "6. Acompanhamento até chegada do SAMU",
      "7. Fornecimento de informações aos paramédicos",
      "8. Apoio e acompanhamento conforme necessário",
      "9. Registro do incidente"
    ],
    entities: ["Moradores", "SAMU", "Síndico", "Portaria Online"],
    variables: ["telefone_samu", "ponto_encontro_ambulancia"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação da Emergência] --> B[Acionamento SAMU 192]
    B --> C{Capacitado para Primeiros Socorros?}
    C -->|Sim| D[Prestação de Primeiros Socorros]
    C -->|Não| E[Comunicação Portaria/Síndico]
    D --> E
    E --> F[Preparação do Acesso]
    F --> G[Aguardar SAMU]
    G --> H[Fornecimento de Informações]
    H --> I[Apoio e Acompanhamento]
    I --> J[Registro do Incidente]`
  },
  {
    id: 35,
    name: "Alagamentos",
    category: "Emergências",
    icon: AlertTriangle,
    status: "em_revisao",
    description: "Procedimento de emergência para situações de alagamento, incluindo proteção de equipamentos, drenagem e acionamento de serviços.",
    workflow: [
      "1. Identificação do alagamento",
      "2. Proteção de equipamentos elétricos",
      "3. Isolamento da área se possível",
      "4. Acionamento de serviços de drenagem se necessário",
      "5. Comunicação ao síndico/administradora",
      "6. Documentação fotográfica do dano",
      "7. Limpeza e secagem",
      "8. Verificação de danos estruturais",
      "9. Reparos necessários",
      "10. Registro do incidente e medidas preventivas"
    ],
    entities: ["Moradores", "Síndico", "Administradora", "Empresa de Manutenção"],
    variables: ["telefone_emergencia"],
    documentType: "Procedimento de Emergência",
    mermaid_diagram: `flowchart TD
    A[Identificação do Alagamento] --> B[Proteção de Equipamentos Elétricos]
    B --> C{Isolar Área Possível?}
    C -->|Sim| D[Isolamento]
    C -->|Não| E[Acionamento Drenagem]
    D --> E
    E --> F[Comunicação Síndico/Administradora]
    F --> G[Documentação Fotográfica]
    G --> H[Limpeza e Secagem]
    H --> I[Verificação de Danos]
    I --> J{Danos Estruturais?}
    J -->|Sim| K[Reparos]
    J -->|Não| L[Registro do Incidente]
    K --> M[Medidas Preventivas]
    M --> L`
  },
]

