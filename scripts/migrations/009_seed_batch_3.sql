-- Migration: Seed lote 3 (5 processos)
-- Esta migration executa a função seed_single_process para um lote de processos

DO $$
DECLARE
    v_process_id UUID;
BEGIN
    SELECT seed_single_process(
        'Escritório Compartilhado',
        'areas_comuns',
        'regulamento',
        'em_revisao',
        'Regulamento de uso do escritório compartilhado (home office), incluindo reservas, horários, regras de uso e manutenção do espaço.',
        '{"description": "Regulamento de uso do escritório compartilhado (home office), incluindo reservas, horários, regras de uso e manutenção do espaço.", "workflow": ["1. Solicitação de reserva pelo morador", "2. Verificação de disponibilidade", "3. Confirmação da reserva", "4. Uso do espaço conforme regras estabelecidas", "5. Limpeza e organização ao término do uso", "6. Registro de uso e feedback se necessário"], "entities": ["Moradores", "Administradora"], "variables": ["horario_escritorio", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C{Disponível?}\n    C -->|Sim| D[\"Confirmação da Reserva<br/>(Administradora)\"]\n    C -->|Não| E[\"Propor Outro Horário<br/>(Administradora)\"]\n    E --> B\n    D --> F[\"Uso do Espaço<br/>(Moradores)\"]\n    F --> G[\"Limpeza e Organização<br/>(Moradores)\"]\n    G --> H[\"Registro de Uso<br/>(Administradora)\"]\n    H --> I[\"Feedback se Necessário<br/>(Moradores)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Administradora"]'::jsonb,
        '{"horario_escritorio": null, "politica_reservas_areas_comuns": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Academia',
        'areas_comuns',
        'regulamento',
        'em_revisao',
        'Regulamento de uso da academia, incluindo horários, regras de segurança, limpeza de equipamentos e reservas quando aplicável.',
        '{"description": "Regulamento de uso da academia, incluindo horários, regras de segurança, limpeza de equipamentos e reservas quando aplicável.", "workflow": ["1. Verificação de horário de funcionamento", "2. Acesso à academia (biometria ou chave)", "3. Uso dos equipamentos conforme regras de segurança", "4. Limpeza dos equipamentos após uso", "5. Organização do espaço", "6. Saída e registro de uso"], "entities": ["Moradores"], "variables": ["horario_academia", "capacidade_maxima"], "mermaid_diagram": "flowchart TD\n    A[\"Verificação de Horário<br/>(Moradores)\"] --> B[\"Acesso à Academia<br/>(Moradores)\"]\n    B --> C[\"Uso dos Equipamentos<br/>(Moradores)\"]\n    C --> D[\"Limpeza dos Equipamentos<br/>(Moradores)\"]\n    D --> E[\"Organização do Espaço<br/>(Moradores)\"]\n    E --> F[\"Saída<br/>(Moradores)\"]\n    F --> G[\"Registro de Uso<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores"]'::jsonb,
        '{"horario_academia": null, "capacidade_maxima": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'SPA - Sala de Massagem',
        'areas_comuns',
        'regulamento',
        'em_revisao',
        'Regulamento de uso da SPA/Sala de Massagem, incluindo reservas, horários, regras de uso, limpeza e manutenção.',
        '{"description": "Regulamento de uso da SPA/Sala de Massagem, incluindo reservas, horários, regras de uso, limpeza e manutenção.", "workflow": ["1. Solicitação de reserva com antecedência", "2. Verificação de disponibilidade e confirmação", "3. Uso do espaço no horário reservado", "4. Limpeza completa após uso", "5. Verificação de equipamentos e reporte de problemas", "6. Encerramento da reserva"], "entities": ["Moradores", "Administradora"], "variables": ["horario_spa", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C[\"Confirmação<br/>(Administradora)\"]\n    C --> D[\"Uso no Horário Reservado<br/>(Moradores)\"]\n    D --> E[\"Limpeza Completa<br/>(Moradores)\"]\n    E --> F[\"Verificação de Equipamentos<br/>(Moradores)\"]\n    F --> G{Problemas?}\n    G -->|Sim| H[\"Reporte de Problemas<br/>(Moradores)\"]\n    G -->|Não| I[\"Encerramento<br/>(Administradora)\"]\n    H --> I\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#dc2626,stroke:#ef4444,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Administradora"]'::jsonb,
        '{"horario_spa": null, "politica_reservas_areas_comuns": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Área de Recreação',
        'areas_comuns',
        'regulamento',
        'em_revisao',
        'Regulamento de uso da área de recreação, incluindo horários, regras de convivência, reservas para eventos e manutenção.',
        '{"description": "Regulamento de uso da área de recreação, incluindo horários, regras de convivência, reservas para eventos e manutenção.", "workflow": ["1. Verificação de disponibilidade ou solicitação de reserva", "2. Uso da área conforme regras estabelecidas", "3. Respeito aos horários e regras de silêncio", "4. Limpeza e organização ao término", "5. Reporte de problemas ou danos", "6. Registro de uso se necessário"], "entities": ["Moradores", "Visitantes"], "variables": ["horario_areas_recreacao", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Verificação de Disponibilidade<br/>(Moradores)\"] --> B{Reserva Necessária?}\n    B -->|Sim| C[\"Solicitação de Reserva<br/>(Moradores)\"]\n    B -->|Não| D[\"Uso da Área<br/>(Moradores)\"]\n    C --> E[\"Confirmação<br/>(Administradora)\"]\n    E --> D\n    D --> F[\"Respeito às Regras<br/>(Moradores)\"]\n    F --> G[\"Limpeza e Organização<br/>(Moradores)\"]\n    G --> H{Problemas ou Danos?}\n    H -->|Sim| I[\"Reporte<br/>(Moradores)\"]\n    H -->|Não| J[\"Registro de Uso<br/>(Administradora)\"]\n    I --> J\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Visitantes"]'::jsonb,
        '{"horario_areas_recreacao": null, "politica_reservas_areas_comuns": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Jardins',
        'areas_comuns',
        'pop',
        'em_revisao',
        'Procedimento para manutenção e cuidado dos jardins, incluindo regas, podas, limpeza e melhorias paisagísticas.',
        '{"description": "Procedimento para manutenção e cuidado dos jardins, incluindo regas, podas, limpeza e melhorias paisagísticas.", "workflow": ["1. Planejamento de manutenção periódica", "2. Execução de serviços (rega, poda, limpeza)", "3. Monitoramento de saúde das plantas", "4. Identificação de necessidades de melhorias", "5. Execução de melhorias paisagísticas quando aprovadas", "6. Registro de serviços e acompanhamento"], "entities": ["Empresa de Jardinagem", "Síndico"], "variables": ["empresa_jardinagem", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Planejamento Periódico<br/>(Empresa de Jardinagem)\"] --> B[\"Execução de Serviços<br/>(Empresa de Jardinagem)\"]\n    B --> C[\"Monitoramento de Saúde<br/>(Empresa de Jardinagem)\"]\n    C --> D{Necessidade de Melhorias?}\n    D -->|Sim| E[\"Aprovação de Melhorias<br/>(Síndico)\"]\n    D -->|Não| F[\"Registro de Serviços<br/>(Empresa de Jardinagem)\"]\n    E --> G[\"Execução de Melhorias<br/>(Empresa de Jardinagem)\"]\n    G --> F\n    F --> H[\"Acompanhamento<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Empresa de Jardinagem", "Síndico"]'::jsonb,
        '{"empresa_jardinagem": null, "frequencia_manutencao": null}'::jsonb
    ) INTO v_process_id;
END $$;