-- Migration: Seed lote 5 (5 processos)
-- Esta migration executa a função seed_single_process para um lote de processos

DO $$
DECLARE
    v_process_id UUID;
BEGIN
    SELECT seed_single_process(
        'Manutenções Programadas',
        'eventos',
        'manual',
        'em_revisao',
        'Processo para planejamento, comunicação e execução de manutenções programadas que afetam áreas comuns ou unidades.',
        '{"description": "Processo para planejamento, comunicação e execução de manutenções programadas que afetam áreas comuns ou unidades.", "workflow": ["1. Planejamento anual de manutenções", "2. Agendamento com fornecedores", "3. Comunicação prévia aos moradores afetados", "4. Preparação do local e equipamentos", "5. Execução da manutenção", "6. Verificação e testes", "7. Comunicação de conclusão", "8. Registro no histórico de manutenções"], "entities": ["Síndico", "Fornecedores", "Moradores"], "variables": ["calendario_manutencoes"], "mermaid_diagram": "flowchart TD\n    A[\"Planejamento Anual<br/>(Síndico)\"] --> B[\"Agendamento com Fornecedores<br/>(Administradora)\"]\n    B --> C[\"Comunicação aos Moradores<br/>(Administradora)\"]\n    C --> D[\"Preparação do Local<br/>(Administradora)\"]\n    D --> E[\"Execução da Manutenção<br/>(Fornecedores)\"]\n    E --> F[\"Verificação e Testes<br/>(Síndico)\"]\n    F --> G{Sucesso?}\n    G -->|Sim| H[\"Comunicação de Conclusão<br/>(Administradora)\"]\n    G -->|Não| I[\"Correções<br/>(Fornecedores)\"]\n    I --> E\n    H --> J[\"Registro no Histórico<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Síndico", "Fornecedores", "Moradores"]'::jsonb,
        '{"calendario_manutencoes": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Festas e Reuniões Privadas',
        'eventos',
        'regulamento',
        'em_revisao',
        'Regulamento para reserva e uso de áreas comuns para festas e reuniões privadas de moradores, incluindo regras, horários e limpeza.',
        '{"description": "Regulamento para reserva e uso de áreas comuns para festas e reuniões privadas de moradores, incluindo regras, horários e limpeza.", "workflow": ["1. Solicitação de reserva com antecedência", "2. Verificação de disponibilidade", "3. Aprovação e confirmação da reserva", "4. Pagamento de taxa se aplicável", "5. Uso do espaço no horário reservado", "6. Limpeza completa após o evento", "7. Vistoria e liberação", "8. Registro de uso"], "entities": ["Moradores", "Administradora"], "variables": ["politica_eventos", "horario_eventos"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C{Aprovado?}\n    C -->|Sim| D[\"Confirmação<br/>(Administradora)\"]\n    C -->|Não| E[\"Negado<br/>(Administradora)\"]\n    D --> F[\"Pagamento de Taxa<br/>(Moradores)\"]\n    F --> G[\"Uso do Espaço<br/>(Moradores)\"]\n    G --> H[\"Limpeza Completa<br/>(Moradores)\"]\n    H --> I[\"Vistoria<br/>(Administradora)\"]\n    I --> J[\"Liberação<br/>(Administradora)\"]\n    J --> K[\"Registro de Uso<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Administradora"]'::jsonb,
        '{"politica_eventos": null, "horario_eventos": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Reservas de Áreas',
        'eventos',
        'regulamento',
        'em_revisao',
        'Processo unificado para reserva de áreas comuns (escritório, SPA, área de recreação) incluindo sistema de reservas, regras e cancelamentos.',
        '{"description": "Processo unificado para reserva de áreas comuns (escritório, SPA, área de recreação) incluindo sistema de reservas, regras e cancelamentos.", "workflow": ["1. Consulta de disponibilidade no sistema", "2. Solicitação de reserva", "3. Verificação e confirmação", "4. Uso da área no horário reservado", "5. Limpeza e organização", "6. Encerramento da reserva", "7. Em caso de cancelamento: comunicação com antecedência"], "entities": ["Moradores", "Administradora"], "variables": ["politica_reservas_areas_comuns", "prazo_cancelamento"], "mermaid_diagram": "flowchart TD\n    A[\"Consulta de Disponibilidade<br/>(Moradores)\"] --> B[\"Solicitação de Reserva<br/>(Moradores)\"]\n    B --> C[\"Verificação<br/>(Administradora)\"]\n    C --> D[\"Confirmação<br/>(Administradora)\"]\n    D --> E[\"Uso da Área<br/>(Moradores)\"]\n    E --> F[\"Limpeza<br/>(Moradores)\"]\n    F --> G[\"Encerramento<br/>(Administradora)\"]\n    G --> H{Cancelamento?}\n    H -->|Sim| I[\"Comunicação com Antecedência<br/>(Moradores)\"]\n    H -->|Não| J[\"Concluído<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Administradora"]'::jsonb,
        '{"politica_reservas_areas_comuns": null, "prazo_cancelamento": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Incêndio',
        'emergencias',
        'manual',
        'em_revisao',
        'Procedimento de emergência para situações de incêndio ou princípio de incêndio, incluindo evacuação, acionamento de bombeiros e ponto de encontro.',
        '{"description": "Procedimento de emergência para situações de incêndio ou princípio de incêndio, incluindo evacuação, acionamento de bombeiros e ponto de encontro.", "workflow": ["1. Identificação do incêndio", "2. Acionamento imediato dos bombeiros (193)", "3. Acionamento do alarme de incêndio", "4. Evacuação ordenada do prédio", "5. Direcionamento para ponto de encontro", "6. Verificação de presença de moradores", "7. Aguardar chegada dos bombeiros", "8. Fornecer informações aos bombeiros", "9. Retorno ao prédio apenas após autorização", "10. Registro do incidente e lições aprendidas"], "entities": ["Moradores", "Bombeiros", "Síndico", "Portaria Online"], "variables": ["telefone_bombeiros", "ponto_encontro_incendio"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Incêndio<br/>(Moradores)\"] --> B[\"Acionamento Bombeiros 193<br/>(Moradores/Portaria)\"]\n    B --> C[\"Acionamento do Alarme<br/>(Portaria Online)\"]\n    C --> D[\"Evacuação Ordenada<br/>(Moradores)\"]\n    D --> E[\"Ponto de Encontro<br/>(Síndico)\"]\n    E --> F[\"Verificação de Presença<br/>(Síndico)\"]\n    F --> G[\"Aguardar Bombeiros<br/>(Todos)\"]\n    G --> H[\"Fornecer Informações<br/>(Síndico)\"]\n    H --> I{Autorização?}\n    I -->|Sim| J[\"Retorno ao Prédio<br/>(Bombeiros)\"]\n    I -->|Não| G\n    J --> K[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style C fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Bombeiros", "Síndico", "Portaria Online"]'::jsonb,
        '{"telefone_bombeiros": null, "ponto_encontro_incendio": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Vazamento de Gás',
        'emergencias',
        'manual',
        'em_revisao',
        'Procedimento de emergência para situações de vazamento de gás, incluindo segurança, evacuação e acionamento de serviços especializados.',
        '{"description": "Procedimento de emergência para situações de vazamento de gás, incluindo segurança, evacuação e acionamento de serviços especializados.", "workflow": ["1. Identificação do vazamento", "2. Não acionar interruptores ou equipamentos elétricos", "3. Ventilar o ambiente se seguro", "4. Evacuar a área imediatamente", "5. Acionar bombeiros (193) e empresa de gás", "6. Isolar a área", "7. Aguardar chegada dos profissionais", "8. Retorno apenas após liberação", "9. Verificação e reparo", "10. Registro do incidente"], "entities": ["Moradores", "Bombeiros", "Empresa de Gás", "Síndico"], "variables": ["telefone_bombeiros", "empresa_gas"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Vazamento<br/>(Moradores)\"] --> B[\"NÃO Acionar Interruptores<br/>(Moradores)\"]\n    B --> C{Ventilar Seguro?}\n    C -->|Sim| D[\"Ventilar Ambiente<br/>(Moradores)\"]\n    C -->|Não| E[\"Evacuar Imediatamente<br/>(Moradores)\"]\n    D --> E\n    E --> F[\"Acionar Bombeiros 193<br/>(Moradores)\"]\n    F --> G[\"Acionar Empresa de Gás<br/>(Síndico)\"]\n    G --> H[\"Isolar a Área<br/>(Portaria Online)\"]\n    H --> I[\"Aguardar Profissionais<br/>(Todos)\"]\n    I --> J{Liberação?}\n    J -->|Sim| K[\"Retorno<br/>(Bombeiros)\"]\n    J -->|Não| I\n    K --> L[\"Verificação e Reparo<br/>(Empresa de Gás)\"]\n    L --> M[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#dc2626,stroke:#ef4444,color:#fff\n    style H fill:#dc2626,stroke:#ef4444,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff\n    style L fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Moradores", "Bombeiros", "Empresa de Gás", "Síndico"]'::jsonb,
        '{"telefone_bombeiros": null, "empresa_gas": null}'::jsonb
    ) INTO v_process_id;
END $$;