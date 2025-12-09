-- Migration: Seed lote 1 (5 processos)
-- Esta migration executa a função seed_single_process para um lote de processos

DO $$
DECLARE
    v_process_id UUID;
BEGIN
    SELECT seed_single_process(
        'Cadastro, Bloqueio e Substituição',
        'acesso_seguranca',
        'pop',
        'em_revisao',
        'Processo unificado para gerenciar cadastros de acesso (biometria, controles remotos), bloqueio de dispositivos em caso de perda ou término de contrato, e substituição de dispositivos.',
        '{"description": "Processo unificado para gerenciar cadastros de acesso (biometria, controles remotos), bloqueio de dispositivos em caso de perda ou término de contrato, e substituição de dispositivos.", "workflow": ["1. Solicitação de cadastro/bloqueio/substituição", "2. Verificação de identidade e autorização", "3. Execução da ação (cadastro/bloqueio/substituição)", "4. Registro no sistema de ocorrências", "5. Notificação ao solicitante", "6. Atualização de documentação e registros"], "entities": ["Moradores", "Portaria Online", "Administradora"], "variables": ["politica_substituicao_controle_remoto"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação<br/>(Moradores)\"] --> B{Tipo de Ação}\n    B -->|Cadastro| C[\"Verificação de Autorização<br/>(Portaria Online)\"]\n    B -->|Bloqueio| D[\"Verificação de Identidade<br/>(Portaria Online)\"]\n    B -->|Substituição| E[\"Verificação e Taxa<br/>(Portaria Online)\"]\n    C --> F[\"Execução<br/>(Portaria Online)\"]\n    D --> F\n    E --> F\n    F --> G[\"Registro no Sistema<br/>(Portaria Online)\"]\n    G --> H[\"Notificação<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Portaria Online", "Administradora"]'::jsonb,
        '{"politica_substituicao_controle_remoto": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Câmeras: Uso, Privacidade e Auditoria',
        'acesso_seguranca',
        'regulamento',
        'em_revisao',
        'Regulamento sobre uso do sistema de câmeras de segurança (CFTV), políticas de privacidade, acesso às gravações e procedimentos de auditoria. Garante segurança respeitando privacidade dos moradores.',
        '{"description": "Regulamento sobre uso do sistema de câmeras de segurança (CFTV), políticas de privacidade, acesso às gravações e procedimentos de auditoria. Garante segurança respeitando privacidade dos moradores.", "workflow": ["1. Monitoramento contínuo das áreas comuns", "2. Gravação e armazenamento conforme política de retenção", "3. Solicitação de acesso às gravações (apenas autorizados)", "4. Verificação de autorização e motivo da solicitação", "5. Fornecimento de gravação com registro de acesso", "6. Auditoria periódica de acessos e uso do sistema"], "entities": ["Síndico", "Empresa de Segurança", "Portaria Online"], "variables": ["retencao_gravacoes", "areas_monitoradas"], "mermaid_diagram": "flowchart TD\n    A[\"Monitoramento Contínuo<br/>(Empresa de Segurança)\"] --> B[\"Gravação<br/>(Empresa de Segurança)\"]\n    B --> C[\"Armazenamento<br/>(Empresa de Segurança)\"]\n    C --> D{Solicitação de Acesso}\n    D -->|Sim| E[\"Verificação de Autorização<br/>(Síndico)\"]\n    D -->|Não| F[\"Retenção Periódica<br/>(Empresa de Segurança)\"]\n    E --> G{Autorizado?}\n    G -->|Sim| H[\"Fornecimento de Gravação<br/>(Empresa de Segurança)\"]\n    G -->|Não| I[\"Negado<br/>(Síndico)\"]\n    H --> J[\"Registro de Acesso<br/>(Portaria Online)\"]\n    F --> K[\"Auditoria Periódica<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Síndico", "Empresa de Segurança", "Portaria Online"]'::jsonb,
        '{"retencao_gravacoes": null, "areas_monitoradas": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Acesso de Visitantes',
        'acesso_seguranca',
        'pop',
        'em_revisao',
        'Procedimento para autorização e controle de acesso de visitantes ao condomínio. Define regras de autorização, registro e acompanhamento de visitantes.',
        '{"description": "Procedimento para autorização e controle de acesso de visitantes ao condomínio. Define regras de autorização, registro e acompanhamento de visitantes.", "workflow": ["1. Solicitação de autorização pelo morador (presencial ou via app)", "2. Verificação de identidade do morador solicitante", "3. Registro do visitante no sistema", "4. Autorização de acesso e orientação", "5. Acompanhamento e registro de entrada/saída", "6. Encerramento da visita e atualização de registros"], "entities": ["Moradores", "Visitantes", "Portaria Online"], "variables": ["portaria_funcionamento", "horario_visitas"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação pelo Morador<br/>(Moradores)\"] --> B[\"Verificação de Identidade<br/>(Portaria Online)\"]\n    B --> C[\"Registro do Visitante<br/>(Portaria Online)\"]\n    C --> D[\"Autorização de Acesso<br/>(Portaria Online)\"]\n    D --> E[\"Orientação<br/>(Portaria Online)\"]\n    E --> F[\"Entrada<br/>(Visitantes)\"]\n    F --> G[\"Acompanhamento<br/>(Portaria Online)\"]\n    G --> H[\"Saída<br/>(Visitantes)\"]\n    H --> I[\"Atualização de Registros<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Visitantes", "Portaria Online"]'::jsonb,
        '{"portaria_funcionamento": null, "horario_visitas": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Relatórios de Incidentes',
        'acesso_seguranca',
        'formulario',
        'em_revisao',
        'Processo para registro, análise e acompanhamento de incidentes de segurança no condomínio. Garante rastreabilidade e ações corretivas adequadas.',
        '{"description": "Processo para registro, análise e acompanhamento de incidentes de segurança no condomínio. Garante rastreabilidade e ações corretivas adequadas.", "workflow": ["1. Identificação e registro do incidente", "2. Classificação do incidente (gravidade, tipo)", "3. Notificação aos responsáveis (síndico, segurança)", "4. Investigação e coleta de evidências", "5. Análise e definição de ações corretivas", "6. Implementação de medidas e acompanhamento", "7. Registro no histórico e lições aprendidas"], "entities": ["Síndico", "Empresa de Segurança", "Portaria Online", "Moradores"], "variables": ["telefone_policia", "telefone_bombeiros"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Incidente<br/>(Moradores/Portaria)\"] --> B[\"Registro<br/>(Portaria Online)\"]\n    B --> C[\"Classificação<br/>(Síndico)\"]\n    C --> D[\"Notificação<br/>(Portaria Online)\"]\n    D --> E[\"Investigaçã<br/>(Empresa de Segurança)\"]\n    E --> F[\"Coleta de Evidências<br/>(Empresa de Segurança)\"]\n    F --> G[\"Análise<br/>(Síndico)\"]\n    G --> H[\"Ações Corretivas<br/>(Síndico)\"]\n    H --> I[\"Implementação<br/>(Empresa de Segurança)\"]\n    I --> J[\"Acompanhamento<br/>(Síndico)\"]\n    J --> K[\"Registro no Histórico<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Síndico", "Empresa de Segurança", "Portaria Online", "Moradores"]'::jsonb,
        '{"telefone_policia": null, "telefone_bombeiros": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Portaria Online',
        'operacao',
        'pop',
        'em_revisao',
        'Procedimento operacional para funcionamento da portaria online, incluindo autorização de moradores, controle de visitantes, controle de entregas e comunicação de incidentes.',
        '{"description": "Procedimento operacional para funcionamento da portaria online, incluindo autorização de moradores, controle de visitantes, controle de entregas e comunicação de incidentes.", "workflow": ["1. Atendimento de solicitações via sistema/app", "2. Verificação de autorização e identidade", "3. Processamento da solicitação (acesso, entrega, etc.)", "4. Registro no sistema de ocorrências", "5. Comunicação com morador quando necessário", "6. Atuação em contingência quando sistema offline"], "entities": ["Portaria Online", "Moradores", "Visitantes", "Entregadores"], "variables": ["portaria_online_contato", "portaria_funcionamento"], "mermaid_diagram": "flowchart TD\n    A[\"Atendimento via Sistema<br/>(Portaria Online)\"] --> B[\"Verificação de Autorização<br/>(Portaria Online)\"]\n    B --> C{Tipo de Solicitação}\n    C -->|Acesso| D[\"Processamento de Acesso<br/>(Portaria Online)\"]\n    C -->|Entrega| E[\"Processamento de Entrega<br/>(Portaria Online)\"]\n    C -->|Outro| F[\"Processamento Específico<br/>(Portaria Online)\"]\n    D --> G[\"Registro no Sistema<br/>(Portaria Online)\"]\n    E --> G\n    F --> G\n    G --> H[\"Comunicação<br/>(Portaria Online)\"]\n    H --> I{Sistema Online?}\n    I -->|Não| J[\"Atuação em Contingência<br/>(Portaria Online)\"]\n    I -->|Sim| K[\"Concluído<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#dc2626,stroke:#ef4444,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Portaria Online", "Moradores", "Visitantes", "Entregadores"]'::jsonb,
        '{"portaria_online_contato": null, "portaria_funcionamento": null}'::jsonb
    ) INTO v_process_id;
END $$;