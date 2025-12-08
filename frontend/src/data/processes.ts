import { FileText, Shield, Lock, Wrench, Building2, Users, Calendar, AlertTriangle, LucideIcon } from "lucide-react"
import { RACIEntry } from "@/types/raci"

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
  raci?: RACIEntry[] // Matriz RACI para o processo
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
    A["Identificação da Necessidade<br/>(Síndico)"] --> B["Elaboração do Rascunho<br/>(Administradora)"]
    B --> C["Revisão Interna<br/>(Síndico)"]
    C --> D["Apresentação ao Conselho<br/>(Síndico)"]
    D --> E{Aprovado?}
    E -->|Sim| F["Publicação<br/>(Administradora)"]
    E -->|Não| G["Ajustes<br/>(Administradora)"]
    G --> C
    F --> H["Revisão Periódica<br/>(Conselho Consultivo)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação da necessidade de novo processo ou revisão",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "2. Estruturação do processo (categoria, subcategoria, entidades envolvidas)",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: [],
      },
      {
        step: "3. Definição de variáveis e parâmetros necessários",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: [],
      },
      {
        step: "4. Revisão pelo corpo consultivo (síndico + conselho)",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: ["Administradora"],
      },
      {
        step: "5. Aprovação e publicação do processo",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "6. Revisão periódica conforme ciclo definido",
        responsible: ["Conselho Consultivo"],
        accountable: ["Síndico"],
        consulted: ["Administradora"],
        informed: [],
      },
    ],
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
    documentType: "Regulamento",
    mermaid_diagram: `flowchart TD
    A["Submissão do Processo<br/>(Síndico)"] --> B["Distribuição ao Conselho<br/>(Administradora)"]
    B --> C["Revisão Individual<br/>(Conselho Consultivo)"]
    C --> D["Reunião de Deliberação<br/>(Conselho Consultivo)"]
    D --> E{Votação}
    E -->|Aprovado| F["Comunicação da Decisão<br/>(Conselho Consultivo)"]
    E -->|Rejeitado| G["Ajustes Necessários<br/>(Administradora)"]
    E -->|Ajustes| H["Aplicação de Ajustes<br/>(Administradora)"]
    G --> I["Refazer Processo<br/>(Síndico)"]
    H --> I
    I --> A
    F --> J["Publicação<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Submissão do processo/documento para aprovação",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Distribuição para membros do conselho consultivo",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "3. Revisão individual pelos membros",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: [],
      },
      {
        step: "4. Reunião de deliberação do conselho",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: ["Administradora"],
      },
      {
        step: "5. Votação e decisão (aprovado/rejeitado/ajustes necessários)",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: [],
        informed: ["Síndico", "Administradora"],
      },
      {
        step: "6. Comunicação da decisão e aplicação de ajustes se necessário",
        responsible: ["Administradora"],
        accountable: ["Conselho Consultivo"],
        consulted: [],
        informed: ["Síndico"],
      },
    ],
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
    A["Seleção do Processo<br/>(Síndico)"] --> B["Aplicação de Variáveis<br/>(Administradora)"]
    B --> C["Geração do Documento<br/>(Administradora)"]
    C --> D["Revisão do Documento<br/>(Síndico)"]
    D --> E{Aprovado?}
    E -->|Sim| F["Publicação<br/>(Administradora)"]
    E -->|Não| G["Correções<br/>(Administradora)"]
    G --> D
    F --> H["Distribuição aos Moradores<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Seleção do processo e tipo de documento a gerar",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "2. Aplicação automática de variáveis configuradas",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Geração do documento em formato estruturado",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Revisão do documento gerado",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: [],
      },
      {
        step: "5. Aprovação final pelo síndico",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo", "Administradora"],
      },
      {
        step: "6. Publicação no website ou distribuição aos moradores",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
    ],
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
    documentType: "POP",
    mermaid_diagram: `flowchart TD
    A["Solicitação de Cadastro<br/>(Moradores)"] --> B["Verificação de Identidade<br/>(Portaria Online)"]
    B --> C["Cadastro no Sistema<br/>(Portaria Online)"]
    C --> D["Teste de Funcionamento<br/>(Portaria Online)"]
    D --> E{Ativado?}
    E -->|Sim| F["Orientação de Uso<br/>(Portaria Online)"]
    E -->|Não| G["Correção<br/>(Portaria Online)"]
    G --> D
    F --> H["Monitoramento<br/>(Síndico)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de cadastro biométrico pelo morador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Verificação de identidade e documentação",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Cadastro no sistema biométrico (facial e digital)",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Teste de funcionamento e ativação",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "5. Orientação sobre uso e regras de acesso",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Monitoramento e manutenção do sistema",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Solicitação de Controle<br/>(Moradores)"] --> B["Verificação de Vaga<br/>(Portaria Online)"]
    B --> C["Cadastro no Sistema<br/>(Portaria Online)"]
    C --> D["Entrega e Orientação<br/>(Portaria Online)"]
    D --> E{Uso Normal}
    E -->|Perda| F["Bloqueio Imediato<br/>(Portaria Online)"]
    E -->|Substituição| G["Solicitação de Substituição<br/>(Moradores)"]
    F --> G
    G --> H["Novo Cadastro<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de controle remoto pelo morador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Verificação de vaga e documentação",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Cadastro do controle no sistema",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Entrega e orientação sobre uso",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "5. Em caso de perda: bloqueio imediato do dispositivo",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Substituição mediante solicitação e taxa se aplicável",
        responsible: ["Moradores", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Solicitação<br/>(Moradores)"] --> B{Tipo de Ação}
    B -->|Cadastro| C["Verificação de Autorização<br/>(Portaria Online)"]
    B -->|Bloqueio| D["Verificação de Identidade<br/>(Portaria Online)"]
    B -->|Substituição| E["Verificação e Taxa<br/>(Portaria Online)"]
    C --> F["Execução<br/>(Portaria Online)"]
    D --> F
    E --> F
    F --> G["Registro no Sistema<br/>(Portaria Online)"]
    G --> H["Notificação<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de cadastro/bloqueio/substituição",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Verificação de identidade e autorização",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: ["Administradora"],
        informed: [],
      },
      {
        step: "3. Execução da ação (cadastro/bloqueio/substituição)",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Registro no sistema de ocorrências",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "5. Notificação ao solicitante",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Atualização de documentação e registros",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
    ],
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
    A["Monitoramento Contínuo<br/>(Empresa de Segurança)"] --> B["Gravação<br/>(Empresa de Segurança)"]
    B --> C["Armazenamento<br/>(Empresa de Segurança)"]
    C --> D{Solicitação de Acesso}
    D -->|Sim| E["Verificação de Autorização<br/>(Síndico)"]
    D -->|Não| F["Retenção Periódica<br/>(Empresa de Segurança)"]
    E --> G{Autorizado?}
    G -->|Sim| H["Fornecimento de Gravação<br/>(Empresa de Segurança)"]
    G -->|Não| I["Negado<br/>(Síndico)"]
    H --> J["Registro de Acesso<br/>(Portaria Online)"]
    F --> K["Auditoria Periódica<br/>(Síndico)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Monitoramento contínuo das áreas comuns",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Gravação e armazenamento conforme política de retenção",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Solicitação de acesso às gravações (apenas autorizados)",
        responsible: ["Síndico", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Segurança"],
      },
      {
        step: "4. Verificação de autorização e motivo da solicitação",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Fornecimento de gravação com registro de acesso",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "6. Auditoria periódica de acessos e uso do sistema",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Empresa de Segurança"],
        informed: ["Portaria Online"],
      },
    ],
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
    A["Solicitação pelo Morador<br/>(Moradores)"] --> B["Verificação de Identidade<br/>(Portaria Online)"]
    B --> C["Registro do Visitante<br/>(Portaria Online)"]
    C --> D["Autorização de Acesso<br/>(Portaria Online)"]
    D --> E["Orientação<br/>(Portaria Online)"]
    E --> F["Entrada<br/>(Visitantes)"]
    F --> G["Acompanhamento<br/>(Portaria Online)"]
    G --> H["Saída<br/>(Visitantes)"]
    H --> I["Atualização de Registros<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de autorização pelo morador (presencial ou via app)",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Verificação de identidade do morador solicitante",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Registro do visitante no sistema",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Autorização de acesso e orientação",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores", "Visitantes"],
      },
      {
        step: "5. Acompanhamento e registro de entrada/saída",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Encerramento da visita e atualização de registros",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Identificação do Incidente<br/>(Moradores/Portaria)"] --> B["Registro<br/>(Portaria Online)"]
    B --> C["Classificação<br/>(Síndico)"]
    C --> D["Notificação<br/>(Portaria Online)"]
    D --> E["Investigaçã<br/>(Empresa de Segurança)"]
    E --> F["Coleta de Evidências<br/>(Empresa de Segurança)"]
    F --> G["Análise<br/>(Síndico)"]
    G --> H["Ações Corretivas<br/>(Síndico)"]
    H --> I["Implementação<br/>(Empresa de Segurança)"]
    I --> J["Acompanhamento<br/>(Síndico)"]
    J --> K["Registro no Histórico<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#166534,stroke:#22c55e,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação e registro do incidente",
        responsible: ["Moradores", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Segurança"],
      },
      {
        step: "2. Classificação do incidente (gravidade, tipo)",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Empresa de Segurança"],
        informed: ["Portaria Online"],
      },
      {
        step: "3. Notificação aos responsáveis (síndico, segurança)",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Segurança"],
      },
      {
        step: "4. Investigação e coleta de evidências",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "5. Análise e definição de ações corretivas",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Empresa de Segurança"],
        informed: [],
      },
      {
        step: "6. Implementação de medidas e acompanhamento",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "7. Registro no histórico e lições aprendidas",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Segurança"],
      },
    ],
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
    A["Atendimento via Sistema<br/>(Portaria Online)"] --> B["Verificação de Autorização<br/>(Portaria Online)"]
    B --> C{Tipo de Solicitação}
    C -->|Acesso| D["Processamento de Acesso<br/>(Portaria Online)"]
    C -->|Entrega| E["Processamento de Entrega<br/>(Portaria Online)"]
    C -->|Outro| F["Processamento Específico<br/>(Portaria Online)"]
    D --> G["Registro no Sistema<br/>(Portaria Online)"]
    E --> G
    F --> G
    G --> H["Comunicação<br/>(Portaria Online)"]
    H --> I{Sistema Online?}
    I -->|Não| J["Atuação em Contingência<br/>(Portaria Online)"]
    I -->|Sim| K["Concluído<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style J fill:#dc2626,stroke:#ef4444,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Atendimento de solicitações via sistema/app",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "2. Verificação de autorização e identidade",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Processamento da solicitação (acesso, entrega, etc.)",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Registro no sistema de ocorrências",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Comunicação com morador quando necessário",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Atuação em contingência quando sistema offline",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Execução da Rotina Diária<br/>(Faxineiro)"] --> B["Preenchimento de Checklist<br/>(Faxineiro)"]
    B --> C{Necessidade de Reposição?}
    C -->|Sim| D["Identificação de Materiais<br/>(Faxineiro)"]
    C -->|Não| E{Problemas Estruturais?}
    D --> F["Comunicação ao Síndico<br/>(Faxineiro)"]
    E -->|Sim| G["Reporte de Problemas<br/>(Faxineiro)"]
    E -->|Não| H["Concluído<br/>(Faxineiro)"]
    F --> I["Acompanhamento<br/>(Administradora)"]
    G --> F
    I --> H
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Execução da rotina diária de limpeza",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Preenchimento de checklist semanal/mensal",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "3. Identificação de necessidade de reposição de materiais",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "4. Reporte de problemas estruturais identificados",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "5. Comunicação ao síndico/administradora",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Acompanhamento de correções e melhorias",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Faxineiro"],
      },
    ],
  },
  {
    id: 12,
    name: "Gestão de Fornecedores",
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
    A["Identificação de Necessidade<br/>(Síndico)"] --> B["Pesquisa e Cotação<br/>(Administradora)"]
    B --> C["Avaliação e Seleção<br/>(Síndico)"]
    C --> D["Aprovação pelo Conselho<br/>(Conselho Consultivo)"]
    D --> E{Aprovado?}
    E -->|Sim| F["Contratação e Cadastro<br/>(Administradora)"]
    E -->|Não| G["Buscar Outro Fornecedor<br/>(Administradora)"]
    G --> B
    F --> H["Acompanhamento de Serviços<br/>(Administradora)"]
    H --> I{Avaliação de Desempenho}
    I -->|Bom| J["Renovação<br/>(Administradora)"]
    I -->|Ruim| K["Substituição<br/>(Administradora)"]
    K --> B
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#dc2626,stroke:#ef4444,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style K fill:#dc2626,stroke:#ef4444,color:#fff`,
    raci: [
      {
        step: "1. Identificação de necessidade de serviço",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "2. Pesquisa e cotação de fornecedores",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Avaliação e seleção de fornecedor",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "4. Aprovação pelo conselho consultivo",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: ["Administradora"],
      },
      {
        step: "5. Contratação e cadastro no sistema",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "6. Acompanhamento de serviços e avaliação de desempenho",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "7. Renovação ou substituição conforme necessário",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: [],
      },
    ],
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
    A["Agendamento Preventiva<br/>(Administradora)"] --> B["Notificação aos Moradores<br/>(Administradora)"]
    B --> C["Execução da Manutenção<br/>(Empresa de Manutenção)"]
    C --> D["Registro de Serviços<br/>(Empresa de Manutenção)"]
    D --> E{Problema Identificado?}
    E -->|Sim| F["Chamado Urgente<br/>(Síndico)"]
    E -->|Não| G["Atualização de Documentação<br/>(Administradora)"]
    F --> H["Acompanhamento<br/>(Síndico)"]
    H --> I["Resolução<br/>(Empresa de Manutenção)"]
    I --> G
    G --> J["Histórico Atualizado<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Agendamento de manutenção preventiva (mensal/trimestral)",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção dos Elevadores"],
      },
      {
        step: "2. Notificação prévia aos moradores",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "3. Execução da manutenção pela empresa especializada",
        responsible: ["Empresa de Manutenção dos Elevadores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "4. Registro de serviços realizados",
        responsible: ["Empresa de Manutenção dos Elevadores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "5. Em caso de problema: abertura de chamado urgente",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção dos Elevadores", "Moradores"],
      },
      {
        step: "6. Acompanhamento até resolução",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora", "Moradores"],
      },
      {
        step: "7. Atualização de documentação e histórico",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Agendamento Preventiva<br/>(Administradora)"] --> B["Inspeção e Manutenção<br/>(Empresa de Manutenção)"]
    B --> C["Teste de Funcionamento<br/>(Empresa de Manutenção)"]
    C --> D{Funcionando?}
    D -->|Sim| E["Registro de Serviços<br/>(Empresa de Manutenção)"]
    D -->|Não| F["Chamado Urgente<br/>(Síndico)"]
    E --> G["Comunicação se Necessário<br/>(Administradora)"]
    F --> H["Resolução<br/>(Empresa de Manutenção)"]
    H --> I["Verificação<br/>(Portaria Online)"]
    I --> D
    G --> J["Concluído<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Agendamento de manutenção preventiva",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção"],
      },
      {
        step: "2. Execução de inspeção e manutenção",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "3. Teste de funcionamento",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "4. Registro de serviços e peças substituídas",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "5. Em caso de falha: chamado urgente",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção", "Portaria Online"],
      },
      {
        step: "6. Resolução e verificação de funcionamento",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "7. Comunicação ao síndico e moradores se necessário",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Monitoramento de Estoque<br/>(Faxineiro)"] --> B{Estoque Mínimo?}
    B -->|Sim| C["Identificação de Necessidade<br/>(Faxineiro)"]
    B -->|Não| A
    C --> D["Solicitação de Compra<br/>(Faxineiro)"]
    D --> E["Aprovação<br/>(Síndico)"]
    E --> F["Compra<br/>(Administradora)"]
    F --> G["Recebimento e Conferência<br/>(Faxineiro)"]
    G --> H["Armazenamento<br/>(Faxineiro)"]
    H --> I["Registro no Controle<br/>(Administradora)"]
    I --> A
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Monitoramento de estoque de materiais",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Identificação de necessidade de reposição",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "3. Solicitação de compra ao síndico/administradora",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "4. Aprovação e compra",
        responsible: ["Síndico", "Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Recebimento e conferência",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Armazenamento adequado",
        responsible: ["Faxineiro"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Registro no controle de estoque",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Faxineiro"],
      },
    ],
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
    A["Solicitação de Reserva<br/>(Moradores)"] --> B["Verificação de Disponibilidade<br/>(Administradora)"]
    B --> C{Disponível?}
    C -->|Sim| D["Confirmação da Reserva<br/>(Administradora)"]
    C -->|Não| E["Propor Outro Horário<br/>(Administradora)"]
    E --> B
    D --> F["Uso do Espaço<br/>(Moradores)"]
    F --> G["Limpeza e Organização<br/>(Moradores)"]
    G --> H["Registro de Uso<br/>(Administradora)"]
    H --> I["Feedback se Necessário<br/>(Moradores)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de reserva pelo morador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Verificação de disponibilidade",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Confirmação da reserva",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Uso do espaço conforme regras estabelecidas",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Limpeza e organização ao término do uso",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Registro de uso e feedback se necessário",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Verificação de Horário<br/>(Moradores)"] --> B["Acesso à Academia<br/>(Moradores)"]
    B --> C["Uso dos Equipamentos<br/>(Moradores)"]
    C --> D["Limpeza dos Equipamentos<br/>(Moradores)"]
    D --> E["Organização do Espaço<br/>(Moradores)"]
    E --> F["Saída<br/>(Moradores)"]
    F --> G["Registro de Uso<br/>(Síndico)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Verificação de horário de funcionamento",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Acesso à academia (biometria ou chave)",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Uso dos equipamentos conforme regras de segurança",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Limpeza dos equipamentos após uso",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Organização do espaço",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Saída e registro de uso",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Síndico"],
      },
    ],
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
    A["Solicitação de Reserva<br/>(Moradores)"] --> B["Verificação de Disponibilidade<br/>(Administradora)"]
    B --> C["Confirmação<br/>(Administradora)"]
    C --> D["Uso no Horário Reservado<br/>(Moradores)"]
    D --> E["Limpeza Completa<br/>(Moradores)"]
    E --> F["Verificação de Equipamentos<br/>(Moradores)"]
    F --> G{Problemas?}
    G -->|Sim| H["Reporte de Problemas<br/>(Moradores)"]
    G -->|Não| I["Encerramento<br/>(Administradora)"]
    H --> I
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#166534,stroke:#22c55e,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#dc2626,stroke:#ef4444,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de reserva com antecedência",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Verificação de disponibilidade e confirmação",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "3. Uso do espaço no horário reservado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Limpeza completa após uso",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Verificação de equipamentos e reporte de problemas",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Encerramento da reserva",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Verificação de Disponibilidade<br/>(Moradores)"] --> B{Reserva Necessária?}
    B -->|Sim| C["Solicitação de Reserva<br/>(Moradores)"]
    B -->|Não| D["Uso da Área<br/>(Moradores)"]
    C --> E["Confirmação<br/>(Administradora)"]
    E --> D
    D --> F["Respeito às Regras<br/>(Moradores)"]
    F --> G["Limpeza e Organização<br/>(Moradores)"]
    G --> H{Problemas ou Danos?}
    H -->|Sim| I["Reporte<br/>(Moradores)"]
    H -->|Não| J["Registro de Uso<br/>(Administradora)"]
    I --> J
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Verificação de disponibilidade ou solicitação de reserva",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Uso da área conforme regras estabelecidas",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Respeito aos horários e regras de silêncio",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Limpeza e organização ao término",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Reporte de problemas ou danos",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Registro de uso se necessário",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Planejamento Periódico<br/>(Empresa de Jardinagem)"] --> B["Execução de Serviços<br/>(Empresa de Jardinagem)"]
    B --> C["Monitoramento de Saúde<br/>(Empresa de Jardinagem)"]
    C --> D{Necessidade de Melhorias?}
    D -->|Sim| E["Aprovação de Melhorias<br/>(Síndico)"]
    D -->|Não| F["Registro de Serviços<br/>(Empresa de Jardinagem)"]
    E --> G["Execução de Melhorias<br/>(Empresa de Jardinagem)"]
    G --> F
    F --> H["Acompanhamento<br/>(Síndico)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Planejamento de manutenção periódica",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Execução de serviços (rega, poda, limpeza)",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Monitoramento de saúde das plantas",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Identificação de necessidades de melhorias",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Execução de melhorias paisagísticas quando aprovadas",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Registro de serviços e acompanhamento",
        responsible: ["Empresa de Jardinagem"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Solicitação de Autorização<br/>(Moradores)"] --> B["Verificação de Vagas<br/>(Portaria Online)"]
    B --> C{Disponível?}
    C -->|Sim| D["Autorização e Registro<br/>(Portaria Online)"]
    C -->|Não| E["Negado<br/>(Portaria Online)"]
    D --> F["Estacionamento<br/>(Visitantes)"]
    F --> G["Monitoramento de Tempo<br/>(Portaria Online)"]
    G --> H{Excedeu Tempo?}
    H -->|Sim| I["Notificação<br/>(Portaria Online)"]
    H -->|Não| J["Saída<br/>(Visitantes)"]
    I --> J
    J --> K["Liberação da Vaga<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de autorização de estacionamento pelo morador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "2. Verificação de disponibilidade de vagas",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Autorização e registro do veículo",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Estacionamento na vaga designada",
        responsible: ["Visitantes"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Monitoramento de tempo de permanência",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Saída e liberação da vaga",
        responsible: ["Visitantes", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Conhecimento das Regras<br/>(Moradores)"] --> B["Respeito aos Horários<br/>(Moradores)"]
    B --> C{Perturbação?}
    C -->|Sim| D["Comunicação ao Síndico<br/>(Moradores)"]
    C -->|Não| E["Convivência Normal<br/>(Moradores)"]
    D --> F["Verificação<br/>(Síndico)"]
    F --> G["Orientação<br/>(Síndico)"]
    G --> H{Reincidência?}
    H -->|Sim| I["Medidas<br/>(Síndico)"]
    H -->|Não| E
    I --> J["Registro de Ocorrência<br/>(Portaria Online)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Conhecimento das regras de silêncio pelos moradores",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Respeito aos horários estabelecidos",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Em caso de perturbação: comunicação ao síndico/portaria",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "4. Verificação e orientação ao morador responsável",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "5. Aplicação de medidas se necessário",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "6. Registro de ocorrência se reincidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Solicitação de Obra<br/>(Moradores)"] --> B["Apresentação de Documentação<br/>(Moradores)"]
    B --> C["Aprovação pelo Síndico<br/>(Síndico)"]
    C --> D{Aprovado?}
    D -->|Sim| E["Definição de Horários<br/>(Síndico)"]
    D -->|Não| F["Correções<br/>(Moradores)"]
    F --> B
    E --> G["Notificação aos Vizinhos<br/>(Síndico)"]
    G --> H["Execução da Obra<br/>(Moradores)"]
    H --> I["Vistoria<br/>(Síndico)"]
    I --> J{Aprovado?}
    J -->|Sim| K["Limpeza<br/>(Moradores)"]
    J -->|Não| L["Correções<br/>(Moradores)"]
    L --> H
    K --> M["Concluído<br/>(Síndico)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style L fill:#dc2626,stroke:#ef4444,color:#fff
    style M fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de obra pelo morador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "2. Apresentação de documentação (projeto, ART, etc.)",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Aprovação pelo síndico/conselho",
        responsible: ["Síndico", "Conselho Consultivo"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Definição de horários e regras de execução",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "5. Notificação aos moradores vizinhos",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Execução da obra conforme aprovado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Vistoria e aprovação final",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "8. Limpeza e organização do espaço comum utilizado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Definição de Pauta<br/>(Síndico)"] --> B["Convocação Formal<br/>(Administradora)"]
    B --> C["Distribuição de Material<br/>(Administradora)"]
    C --> D["Realização da Assembleia<br/>(Síndico)"]
    D --> E["Registro de Presença<br/>(Administradora)"]
    E --> F["Verificação de Quórum<br/>(Conselho Consultivo)"]
    F --> G{Quórum Atingido?}
    G -->|Sim| H["Deliberações e Votações<br/>(Conselho Consultivo)"]
    G -->|Não| I["Adiamento<br/>(Síndico)"]
    H --> J["Elaboração da Ata<br/>(Administradora)"]
    J --> K["Aprovação da Ata<br/>(Conselho Consultivo)"]
    K --> L["Distribuição aos Moradores<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff
    style L fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Definição de pauta e data pela administradora/síndico",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "2. Convocação formal com antecedência mínima",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "3. Distribuição de material e documentação",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Realização da assembleia",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Moradores"],
      },
      {
        step: "5. Registro de presença e quórum",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Conselho Consultivo"],
      },
      {
        step: "6. Deliberações e votações",
        responsible: ["Conselho Consultivo"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: ["Moradores"],
      },
      {
        step: "7. Elaboração e aprovação da ata",
        responsible: ["Administradora"],
        accountable: ["Conselho Consultivo"],
        consulted: ["Síndico"],
        informed: [],
      },
      {
        step: "8. Distribuição da ata aos moradores",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
    ],
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
    A["Planejamento Anual<br/>(Síndico)"] --> B["Agendamento com Fornecedores<br/>(Administradora)"]
    B --> C["Comunicação aos Moradores<br/>(Administradora)"]
    C --> D["Preparação do Local<br/>(Administradora)"]
    D --> E["Execução da Manutenção<br/>(Fornecedores)"]
    E --> F["Verificação e Testes<br/>(Síndico)"]
    F --> G{Sucesso?}
    G -->|Sim| H["Comunicação de Conclusão<br/>(Administradora)"]
    G -->|Não| I["Correções<br/>(Fornecedores)"]
    I --> E
    H --> J["Registro no Histórico<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Planejamento anual de manutenções",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: ["Conselho Consultivo"],
        informed: ["Administradora"],
      },
      {
        step: "2. Agendamento com fornecedores",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Fornecedores"],
      },
      {
        step: "3. Comunicação prévia aos moradores afetados",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Preparação do local e equipamentos",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Execução da manutenção",
        responsible: ["Fornecedores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Verificação e testes",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "7. Comunicação de conclusão",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "8. Registro no histórico de manutenções",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Solicitação de Reserva<br/>(Moradores)"] --> B["Verificação de Disponibilidade<br/>(Administradora)"]
    B --> C{Aprovado?}
    C -->|Sim| D["Confirmação<br/>(Administradora)"]
    C -->|Não| E["Negado<br/>(Administradora)"]
    D --> F["Pagamento de Taxa<br/>(Moradores)"]
    F --> G["Uso do Espaço<br/>(Moradores)"]
    G --> H["Limpeza Completa<br/>(Moradores)"]
    H --> I["Vistoria<br/>(Administradora)"]
    I --> J["Liberação<br/>(Administradora)"]
    J --> K["Registro de Uso<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Solicitação de reserva com antecedência",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "2. Verificação de disponibilidade",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Aprovação e confirmação da reserva",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Pagamento de taxa se aplicável",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "5. Uso do espaço no horário reservado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Limpeza completa após o evento",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Vistoria e liberação",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "8. Registro de uso",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Consulta de Disponibilidade<br/>(Moradores)"] --> B["Solicitação de Reserva<br/>(Moradores)"]
    B --> C["Verificação<br/>(Administradora)"]
    C --> D["Confirmação<br/>(Administradora)"]
    D --> E["Uso da Área<br/>(Moradores)"]
    E --> F["Limpeza<br/>(Moradores)"]
    F --> G["Encerramento<br/>(Administradora)"]
    G --> H{Cancelamento?}
    H -->|Sim| I["Comunicação com Antecedência<br/>(Moradores)"]
    H -->|Não| J["Concluído<br/>(Administradora)"]
    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#166534,stroke:#22c55e,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Consulta de disponibilidade no sistema",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Solicitação de reserva",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "3. Verificação e confirmação",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Uso da área no horário reservado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Limpeza e organização",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Encerramento da reserva",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "7. Em caso de cancelamento: comunicação com antecedência",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
    ],
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
    A["Identificação do Incêndio<br/>(Moradores)"] --> B["Acionamento Bombeiros 193<br/>(Moradores/Portaria)"]
    B --> C["Acionamento do Alarme<br/>(Portaria Online)"]
    C --> D["Evacuação Ordenada<br/>(Moradores)"]
    D --> E["Ponto de Encontro<br/>(Síndico)"]
    E --> F["Verificação de Presença<br/>(Síndico)"]
    F --> G["Aguardar Bombeiros<br/>(Todos)"]
    G --> H["Fornecer Informações<br/>(Síndico)"]
    H --> I{Autorização?}
    I -->|Sim| J["Retorno ao Prédio<br/>(Bombeiros)"]
    I -->|Não| G
    J --> K["Registro do Incidente<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style C fill:#dc2626,stroke:#ef4444,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação do incêndio",
        responsible: ["Moradores", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Acionamento imediato dos bombeiros (193)",
        responsible: ["Moradores", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Bombeiros"],
      },
      {
        step: "3. Acionamento do alarme de incêndio",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "4. Evacuação ordenada do prédio",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Direcionamento para ponto de encontro",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "6. Verificação de presença de moradores",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Aguardar chegada dos bombeiros",
        responsible: ["Todos"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Fornecer informações aos bombeiros",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "9. Retorno ao prédio apenas após autorização",
        responsible: ["Bombeiros"],
        accountable: ["Bombeiros"],
        consulted: [],
        informed: ["Síndico", "Moradores"],
      },
      {
        step: "10. Registro do incidente e lições aprendidas",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Identificação do Vazamento<br/>(Moradores)"] --> B["NÃO Acionar Interruptores<br/>(Moradores)"]
    B --> C{Ventilar Seguro?}
    C -->|Sim| D["Ventilar Ambiente<br/>(Moradores)"]
    C -->|Não| E["Evacuar Imediatamente<br/>(Moradores)"]
    D --> E
    E --> F["Acionar Bombeiros 193<br/>(Moradores)"]
    F --> G["Acionar Empresa de Gás<br/>(Síndico)"]
    G --> H["Isolar a Área<br/>(Portaria Online)"]
    H --> I["Aguardar Profissionais<br/>(Todos)"]
    I --> J{Liberação?}
    J -->|Sim| K["Retorno<br/>(Bombeiros)"]
    J -->|Não| I
    K --> L["Verificação e Reparo<br/>(Empresa de Gás)"]
    L --> M["Registro do Incidente<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#dc2626,stroke:#ef4444,color:#fff
    style H fill:#dc2626,stroke:#ef4444,color:#fff
    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff
    style L fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style M fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação do vazamento",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Não acionar interruptores ou equipamentos elétricos",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Ventilar o ambiente se seguro",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Evacuar a área imediatamente",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Acionar bombeiros (193) e empresa de gás",
        responsible: ["Moradores", "Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Bombeiros", "Empresa de Gás"],
      },
      {
        step: "6. Isolar a área",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Aguardar chegada dos profissionais",
        responsible: ["Todos"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Retorno apenas após liberação",
        responsible: ["Bombeiros"],
        accountable: ["Bombeiros"],
        consulted: [],
        informed: ["Síndico", "Moradores"],
      },
      {
        step: "9. Verificação e reparo",
        responsible: ["Empresa de Gás"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "10. Registro do incidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Identificação da Falta<br/>(Moradores)"] --> B{Problema Local ou Geral?}
    B -->|Local| C["Verificação de Disjuntores<br/>(Moradores)"]
    B -->|Geral| D["Comunicação à Portaria<br/>(Moradores)"]
    C --> E{Resolvido?}
    E -->|Sim| F["Verificação de Funcionamento<br/>(Moradores)"]
    E -->|Não| D
    D --> G["Acionamento Concessionária<br/>(Síndico)"]
    G --> H["Comunicação aos Moradores<br/>(Portaria Online)"]
    H --> I["Acompanhamento<br/>(Síndico)"]
    I --> J["Retorno da Energia<br/>(Concessionária)"]
    J --> F
    F --> K["Registro do Incidente<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#dc2626,stroke:#ef4444,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação da falta de energia",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Verificação se é problema local ou geral",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Comunicação à portaria/síndico",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "4. Verificação de disjuntores e sistema elétrico",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Acionamento da concessionária se necessário",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Concessionária de Energia"],
      },
      {
        step: "6. Comunicação aos moradores",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Moradores"],
      },
      {
        step: "7. Acompanhamento até resolução",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "8. Verificação de funcionamento após retorno",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "9. Registro do incidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Identificação de Pessoas Presas<br/>(Moradores)"] --> B["Botão de Emergência<br/>(Pessoas Presas)"]
    B --> C["Comunicação Portaria/Síndico<br/>(Pessoas Presas)"]
    C --> D["Acionamento Empresa Manutenção<br/>(Portaria Online)"]
    D --> E["Tranquilização das Pessoas<br/>(Portaria Online)"]
    E --> F["Acompanhamento<br/>(Síndico)"]
    F --> G["Resgate<br/>(Empresa de Manutenção)"]
    G --> H{Necessita Atendimento Médico?}
    H -->|Sim| I["Acionamento SAMU<br/>(Síndico)"]
    H -->|Não| J["Verificação de Condições<br/>(Síndico)"]
    I --> J
    J --> K["Bloqueio do Elevador<br/>(Portaria Online)"]
    K --> L["Reparo<br/>(Empresa de Manutenção)"]
    L --> M["Registro do Incidente<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style C fill:#dc2626,stroke:#ef4444,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#166534,stroke:#22c55e,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#dc2626,stroke:#ef4444,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#dc2626,stroke:#ef4444,color:#fff
    style L fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style M fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação de pessoas presas no elevador",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Acionamento do botão de emergência",
        responsible: ["Pessoas Presas"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Comunicação com portaria/síndico",
        responsible: ["Pessoas Presas"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "4. Acionamento imediato da empresa de manutenção",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção dos Elevadores"],
      },
      {
        step: "5. Tranquilização das pessoas presas",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Acompanhamento até resgate",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "7. Verificação de condições das pessoas resgatadas",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Acionamento de serviços médicos se necessário",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["SAMU"],
      },
      {
        step: "9. Bloqueio do elevador até reparo",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "10. Registro do incidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    mermaid_diagram: `flowchart TD
    A["Identificação da Ameaça<br/>(Moradores)"] --> B["Acionamento Polícia 190<br/>(Moradores/Portaria)"]
    B --> C["Acionamento Segurança<br/>(Portaria Online)"]
    C --> D{Isolar Área Possível?}
    D -->|Sim| E["Isolamento<br/>(Portaria Online)"]
    D -->|Não| F["Proteção de Evidências<br/>(Portaria Online)"]
    E --> F
    F --> G["Comunicação ao Síndico<br/>(Portaria Online)"]
    G --> H["Aguardar Polícia<br/>(Todos)"]
    H --> I["Fornecer Informações<br/>(Síndico)"]
    I --> J["Acompanhamento do Caso<br/>(Síndico)"]
    J --> K{Reforço Necessário?}
    K -->|Sim| L["Reforço de Segurança<br/>(Empresa de Segurança)"]
    K -->|Não| M["Registro Detalhado<br/>(Portaria Online)"]
    L --> M
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style C fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#dc2626,stroke:#ef4444,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff
    style L fill:#dc2626,stroke:#ef4444,color:#fff
    style M fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação da ameaça",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Acionamento imediato da polícia (190)",
        responsible: ["Moradores", "Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Polícia"],
      },
      {
        step: "3. Acionamento da empresa de segurança",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Segurança"],
      },
      {
        step: "4. Isolamento da área se possível",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "5. Proteção de evidências",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Comunicação ao síndico",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Aguardar chegada da polícia",
        responsible: ["Todos"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Fornecer informações e evidências",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "9. Acompanhamento do caso",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "10. Reforço de medidas de segurança se necessário",
        responsible: ["Empresa de Segurança"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "11. Registro detalhado do incidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Identificação da Emergência<br/>(Moradores)"] --> B["Acionamento SAMU 192<br/>(Moradores)"]
    B --> C{Capacitado para Primeiros Socorros?}
    C -->|Sim| D["Prestação de Primeiros Socorros<br/>(Moradores)"]
    C -->|Não| E["Comunicação Portaria/Síndico<br/>(Moradores)"]
    D --> E
    E --> F["Preparação do Acesso<br/>(Portaria Online)"]
    F --> G["Aguardar SAMU<br/>(Todos)"]
    G --> H["Fornecimento de Informações<br/>(Síndico)"]
    H --> I["Apoio e Acompanhamento<br/>(Síndico)"]
    I --> J["Registro do Incidente<br/>(Portaria Online)"]
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style H fill:#166534,stroke:#22c55e,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style J fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação da emergência médica",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Acionamento imediato do SAMU (192)",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["SAMU"],
      },
      {
        step: "3. Prestação de primeiros socorros se capacitado",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Comunicação à portaria/síndico",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Portaria Online"],
      },
      {
        step: "5. Preparação do acesso para ambulância",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "6. Acompanhamento até chegada do SAMU",
        responsible: ["Todos"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Fornecimento de informações aos paramédicos",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Apoio e acompanhamento conforme necessário",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "9. Registro do incidente",
        responsible: ["Portaria Online"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
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
    A["Identificação do Alagamento<br/>(Moradores)"] --> B["Proteção de Equipamentos Elétricos<br/>(Moradores)"]
    B --> C{Isolar Área Possível?}
    C -->|Sim| D["Isolamento<br/>(Moradores)"]
    C -->|Não| E["Acionamento Drenagem<br/>(Síndico)"]
    D --> E
    E --> F["Comunicação Síndico/Administradora<br/>(Moradores)"]
    F --> G["Documentação Fotográfica<br/>(Síndico)"]
    G --> H["Limpeza e Secagem<br/>(Empresa de Manutenção)"]
    H --> I["Verificação de Danos<br/>(Síndico)"]
    I --> J{Danos Estruturais?}
    J -->|Sim| K["Reparos<br/>(Empresa de Manutenção)"]
    J -->|Não| L["Registro do Incidente<br/>(Administradora)"]
    K --> M["Medidas Preventivas<br/>(Síndico)"]
    M --> L
    style A fill:#dc2626,stroke:#ef4444,color:#fff
    style B fill:#dc2626,stroke:#ef4444,color:#fff
    style D fill:#dc2626,stroke:#ef4444,color:#fff
    style E fill:#dc2626,stroke:#ef4444,color:#fff
    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style G fill:#166534,stroke:#22c55e,color:#fff
    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style I fill:#166534,stroke:#22c55e,color:#fff
    style K fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style L fill:#166534,stroke:#22c55e,color:#fff
    style M fill:#166534,stroke:#22c55e,color:#fff`,
    raci: [
      {
        step: "1. Identificação do alagamento",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "2. Proteção de equipamentos elétricos",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "3. Isolamento da área se possível",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "4. Acionamento de serviços de drenagem se necessário",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Empresa de Manutenção"],
      },
      {
        step: "5. Comunicação ao síndico/administradora",
        responsible: ["Moradores"],
        accountable: ["Síndico"],
        consulted: [],
        informed: ["Administradora"],
      },
      {
        step: "6. Documentação fotográfica do dano",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "7. Limpeza e secagem",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "8. Verificação de danos estruturais",
        responsible: ["Síndico"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "9. Reparos necessários",
        responsible: ["Empresa de Manutenção"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
      {
        step: "10. Registro do incidente e medidas preventivas",
        responsible: ["Administradora"],
        accountable: ["Síndico"],
        consulted: [],
        informed: [],
      },
    ],
  },
]

