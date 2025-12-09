-- Migration: Seed lote 4 (5 processos)
-- Esta migration executa a função seed_single_process para um lote de processos

DO $$
DECLARE
    v_process_id UUID;
BEGIN
    SELECT seed_single_process(
        'Estacionamento de Visitantes',
        'areas_comuns',
        'regulamento',
        'em_revisao',
        'Regulamento de uso das vagas de visitantes, incluindo regras de estacionamento, tempo máximo de permanência e controle de uso.',
        '{"description": "Regulamento de uso das vagas de visitantes, incluindo regras de estacionamento, tempo máximo de permanência e controle de uso.", "workflow": ["1. Solicitação de autorização de estacionamento pelo morador", "2. Verificação de disponibilidade de vagas", "3. Autorização e registro do veículo", "4. Estacionamento na vaga designada", "5. Monitoramento de tempo de permanência", "6. Saída e liberação da vaga"], "entities": ["Moradores", "Visitantes", "Portaria Online"], "variables": ["possui_vagas_visitantes", "limite_vagas_visitantes", "tempo_maximo_estacionamento"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Autorização<br/>(Moradores)\"] --> B[\"Verificação de Vagas<br/>(Portaria Online)\"]\n    B --> C{Disponível?}\n    C -->|Sim| D[\"Autorização e Registro<br/>(Portaria Online)\"]\n    C -->|Não| E[\"Negado<br/>(Portaria Online)\"]\n    D --> F[\"Estacionamento<br/>(Visitantes)\"]\n    F --> G[\"Monitoramento de Tempo<br/>(Portaria Online)\"]\n    G --> H{Excedeu Tempo?}\n    H -->|Sim| I[\"Notificação<br/>(Portaria Online)\"]\n    H -->|Não| J[\"Saída<br/>(Visitantes)\"]\n    I --> J\n    J --> K[\"Liberação da Vaga<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Visitantes", "Portaria Online"]'::jsonb,
        '{"possui_vagas_visitantes": null, "limite_vagas_visitantes": null, "tempo_maximo_estacionamento": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Gestão de Pets',
        'convivencia',
        'regulamento',
        'em_revisao',
        'Regulamento sobre circulação de pets nas áreas comuns, normas de higiene, segurança (focinheira quando necessário) e convivência respeitosa.',
        '{"description": "Regulamento sobre circulação de pets nas áreas comuns, normas de higiene, segurança (focinheira quando necessário) e convivência respeitosa.", "workflow": ["1. Cadastro do pet no sistema do condomínio", "2. Apresentação de documentação (vacinação, etc.)", "3. Orientação sobre regras de circulação", "4. Uso das áreas comuns com pet conforme regras", "5. Limpeza imediata de dejetos", "6. Respeito às regras de segurança e convivência", "7. Revisão periódica de cadastro e documentação"], "entities": ["Moradores", "Pets"], "variables": ["permite_pets", "restricoes_pets"], "mermaid_diagram": "flowchart TD\n    A[\"Cadastro do Pet<br/>(Moradores)\"] --> B[\"Apresentação de Documentação<br/>(Moradores)\"]\n    B --> C[\"Orientação sobre Regras<br/>(Administradora)\"]\n    C --> D[\"Uso das Áreas Comuns<br/>(Moradores)\"]\n    D --> E[\"Limpeza de Dejetos<br/>(Moradores)\"]\n    E --> F[\"Respeito às Regras<br/>(Moradores)\"]\n    F --> G{Revisão Periódica?}\n    G -->|Sim| H[\"Atualização de Cadastro<br/>(Moradores)\"]\n    G -->|Não| D\n    H --> D\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Pets"]'::jsonb,
        '{"permite_pets": null, "restricoes_pets": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Regras de Silêncio',
        'convivencia',
        'regulamento',
        'em_revisao',
        'Regulamento sobre horários de silêncio, regras de convivência e procedimentos em caso de perturbação do sossego.',
        '{"description": "Regulamento sobre horários de silêncio, regras de convivência e procedimentos em caso de perturbação do sossego.", "workflow": ["1. Conhecimento das regras de silêncio pelos moradores", "2. Respeito aos horários estabelecidos", "3. Em caso de perturbação: comunicação ao síndico/portaria", "4. Verificação e orientação ao morador responsável", "5. Aplicação de medidas se necessário", "6. Registro de ocorrência se reincidente"], "entities": ["Moradores", "Síndico", "Portaria Online"], "variables": ["horario_silencio_dias_uteis", "horario_silencio_fds"], "mermaid_diagram": "flowchart TD\n    A[\"Conhecimento das Regras<br/>(Moradores)\"] --> B[\"Respeito aos Horários<br/>(Moradores)\"]\n    B --> C{Perturbação?}\n    C -->|Sim| D[\"Comunicação ao Síndico<br/>(Moradores)\"]\n    C -->|Não| E[\"Convivência Normal<br/>(Moradores)\"]\n    D --> F[\"Verificação<br/>(Síndico)\"]\n    F --> G[\"Orientação<br/>(Síndico)\"]\n    G --> H{Reincidência?}\n    H -->|Sim| I[\"Medidas<br/>(Síndico)\"]\n    H -->|Não| E\n    I --> J[\"Registro de Ocorrência<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Síndico", "Portaria Online"]'::jsonb,
        '{"horario_silencio_dias_uteis": null, "horario_silencio_fds": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Obras Internas',
        'convivencia',
        'regulamento',
        'em_revisao',
        'Procedimento para solicitação, aprovação e execução de obras internas nas unidades, incluindo regras, horários e documentação necessária.',
        '{"description": "Procedimento para solicitação, aprovação e execução de obras internas nas unidades, incluindo regras, horários e documentação necessária.", "workflow": ["1. Solicitação de obra pelo morador", "2. Apresentação de documentação (projeto, ART, etc.)", "3. Aprovação pelo síndico/conselho", "4. Definição de horários e regras de execução", "5. Notificação aos moradores vizinhos", "6. Execução da obra conforme aprovado", "7. Vistoria e aprovação final", "8. Limpeza e organização do espaço comum utilizado"], "entities": ["Moradores", "Síndico", "Conselho Consultivo"], "variables": ["politica_obras", "horario_obras"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Obra<br/>(Moradores)\"] --> B[\"Apresentação de Documentação<br/>(Moradores)\"]\n    B --> C[\"Aprovação pelo Síndico<br/>(Síndico)\"]\n    C --> D{Aprovado?}\n    D -->|Sim| E[\"Definição de Horários<br/>(Síndico)\"]\n    D -->|Não| F[\"Correções<br/>(Moradores)\"]\n    F --> B\n    E --> G[\"Notificação aos Vizinhos<br/>(Síndico)\"]\n    G --> H[\"Execução da Obra<br/>(Moradores)\"]\n    H --> I[\"Vistoria<br/>(Síndico)\"]\n    I --> J{Aprovado?}\n    J -->|Sim| K[\"Limpeza<br/>(Moradores)\"]\n    J -->|Não| L[\"Correções<br/>(Moradores)\"]\n    L --> H\n    K --> M[\"Concluído<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style L fill:#dc2626,stroke:#ef4444,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Síndico", "Conselho Consultivo"]'::jsonb,
        '{"politica_obras": null, "horario_obras": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Assembleias',
        'eventos',
        'manual',
        'em_revisao',
        'Procedimento para organização, convocação e realização de assembleias condominiais, incluindo pauta, quórum e atas.',
        '{"description": "Procedimento para organização, convocação e realização de assembleias condominiais, incluindo pauta, quórum e atas.", "workflow": ["1. Definição de pauta e data pela administradora/síndico", "2. Convocação formal com antecedência mínima", "3. Distribuição de material e documentação", "4. Realização da assembleia", "5. Registro de presença e quórum", "6. Deliberações e votações", "7. Elaboração e aprovação da ata", "8. Distribuição da ata aos moradores"], "entities": ["Síndico", "Conselho Consultivo", "Administradora", "Moradores"], "variables": ["prazo_convocacao", "quorum_minimo"], "mermaid_diagram": "flowchart TD\n    A[\"Definição de Pauta<br/>(Síndico)\"] --> B[\"Convocação Formal<br/>(Administradora)\"]\n    B --> C[\"Distribuição de Material<br/>(Administradora)\"]\n    C --> D[\"Realização da Assembleia<br/>(Síndico)\"]\n    D --> E[\"Registro de Presença<br/>(Administradora)\"]\n    E --> F[\"Verificação de Quórum<br/>(Conselho Consultivo)\"]\n    F --> G{Quórum Atingido?}\n    G -->|Sim| H[\"Deliberações e Votações<br/>(Conselho Consultivo)\"]\n    G -->|Não| I[\"Adiamento<br/>(Síndico)\"]\n    H --> J[\"Elaboração da Ata<br/>(Administradora)\"]\n    J --> K[\"Aprovação da Ata<br/>(Conselho Consultivo)\"]\n    K --> L[\"Distribuição aos Moradores<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff\n    style L fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Síndico", "Conselho Consultivo", "Administradora", "Moradores"]'::jsonb,
        '{"prazo_convocacao": null, "quorum_minimo": null}'::jsonb
    ) INTO v_process_id;
END $$;