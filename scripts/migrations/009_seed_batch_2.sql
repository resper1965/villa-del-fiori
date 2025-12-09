-- Migration: Seed lote 2 (5 processos)
-- Esta migration executa a função seed_single_process para um lote de processos

DO $$
DECLARE
    v_process_id UUID;
BEGIN
    SELECT seed_single_process(
        'Rotina de Limpeza (Faxineiro)',
        'operacao',
        'pop',
        'em_revisao',
        'Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.',
        '{"description": "Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.", "workflow": ["1. Execução da rotina diária de limpeza", "2. Preenchimento de checklist semanal/mensal", "3. Identificação de necessidade de reposição de materiais", "4. Reporte de problemas estruturais identificados", "5. Comunicação ao síndico/administradora", "6. Acompanhamento de correções e melhorias"], "entities": ["Faxineiro", "Síndico", "Administradora"], "variables": ["areas_comuns", "frequencia_limpeza"], "mermaid_diagram": "flowchart TD\n    A[\"Execução da Rotina Diária<br/>(Faxineiro)\"] --> B[\"Preenchimento de Checklist<br/>(Faxineiro)\"]\n    B --> C{Necessidade de Reposição?}\n    C -->|Sim| D[\"Identificação de Materiais<br/>(Faxineiro)\"]\n    C -->|Não| E{Problemas Estruturais?}\n    D --> F[\"Comunicação ao Síndico<br/>(Faxineiro)\"]\n    E -->|Sim| G[\"Reporte de Problemas<br/>(Faxineiro)\"]\n    E -->|Não| H[\"Concluído<br/>(Faxineiro)\"]\n    F --> I[\"Acompanhamento<br/>(Administradora)\"]\n    G --> F\n    I --> H\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Faxineiro", "Síndico", "Administradora"]'::jsonb,
        '{"areas_comuns": null, "frequencia_limpeza": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Gestão de Fornecedores',
        'operacao',
        'manual',
        'em_revisao',
        'Processo para cadastro, avaliação, contratação e acompanhamento de fornecedores do condomínio (jardinagem, dedetização, manutenção, etc.).',
        '{"description": "Processo para cadastro, avaliação, contratação e acompanhamento de fornecedores do condomínio (jardinagem, dedetização, manutenção, etc.).", "workflow": ["1. Identificação de necessidade de serviço", "2. Pesquisa e cotação de fornecedores", "3. Avaliação e seleção de fornecedor", "4. Aprovação pelo conselho consultivo", "5. Contratação e cadastro no sistema", "6. Acompanhamento de serviços e avaliação de desempenho", "7. Renovação ou substituição conforme necessário"], "entities": ["Síndico", "Conselho Consultivo", "Administradora", "Fornecedores"], "variables": ["empresa_jardinagem", "empresa_dedetizacao"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação de Necessidade<br/>(Síndico)\"] --> B[\"Pesquisa e Cotação<br/>(Administradora)\"]\n    B --> C[\"Avaliação e Seleção<br/>(Síndico)\"]\n    C --> D[\"Aprovação pelo Conselho<br/>(Conselho Consultivo)\"]\n    D --> E{Aprovado?}\n    E -->|Sim| F[\"Contratação e Cadastro<br/>(Administradora)\"]\n    E -->|Não| G[\"Buscar Outro Fornecedor<br/>(Administradora)\"]\n    G --> B\n    F --> H[\"Acompanhamento de Serviços<br/>(Administradora)\"]\n    H --> I{Avaliação de Desempenho}\n    I -->|Bom| J[\"Renovação<br/>(Administradora)\"]\n    I -->|Ruim| K[\"Substituição<br/>(Administradora)\"]\n    K --> B\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#dc2626,stroke:#ef4444,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#dc2626,stroke:#ef4444,color:#fff"}'::jsonb,
        '["Síndico", "Conselho Consultivo", "Administradora", "Fornecedores"]'::jsonb,
        '{"empresa_jardinagem": null, "empresa_dedetizacao": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Manutenção de Elevadores',
        'operacao',
        'pop',
        'em_revisao',
        'Procedimento para manutenção preventiva e corretiva dos elevadores, incluindo agendamento, execução, registro e comunicação de problemas.',
        '{"description": "Procedimento para manutenção preventiva e corretiva dos elevadores, incluindo agendamento, execução, registro e comunicação de problemas.", "workflow": ["1. Agendamento de manutenção preventiva (mensal/trimestral)", "2. Notificação prévia aos moradores", "3. Execução da manutenção pela empresa especializada", "4. Registro de serviços realizados", "5. Em caso de problema: abertura de chamado urgente", "6. Acompanhamento até resolução", "7. Atualização de documentação e histórico"], "entities": ["Empresa de Manutenção dos Elevadores", "Síndico", "Moradores"], "variables": ["empresa_elevador", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Agendamento Preventiva<br/>(Administradora)\"] --> B[\"Notificação aos Moradores<br/>(Administradora)\"]\n    B --> C[\"Execução da Manutenção<br/>(Empresa de Manutenção)\"]\n    C --> D[\"Registro de Serviços<br/>(Empresa de Manutenção)\"]\n    D --> E{Problema Identificado?}\n    E -->|Sim| F[\"Chamado Urgente<br/>(Síndico)\"]\n    E -->|Não| G[\"Atualização de Documentação<br/>(Administradora)\"]\n    F --> H[\"Acompanhamento<br/>(Síndico)\"]\n    H --> I[\"Resolução<br/>(Empresa de Manutenção)\"]\n    I --> G\n    G --> J[\"Histórico Atualizado<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Empresa de Manutenção dos Elevadores", "Síndico", "Moradores"]'::jsonb,
        '{"empresa_elevador": null, "frequencia_manutencao": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Manutenção do Portão Automático',
        'operacao',
        'pop',
        'em_revisao',
        'Procedimento para manutenção preventiva e corretiva do portão automático da garagem, garantindo funcionamento adequado e segurança.',
        '{"description": "Procedimento para manutenção preventiva e corretiva do portão automático da garagem, garantindo funcionamento adequado e segurança.", "workflow": ["1. Agendamento de manutenção preventiva", "2. Execução de inspeção e manutenção", "3. Teste de funcionamento", "4. Registro de serviços e peças substituídas", "5. Em caso de falha: chamado urgente", "6. Resolução e verificação de funcionamento", "7. Comunicação ao síndico e moradores se necessário"], "entities": ["Empresa de Manutenção", "Síndico", "Portaria Online"], "variables": ["empresa_portao", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Agendamento Preventiva<br/>(Administradora)\"] --> B[\"Inspeção e Manutenção<br/>(Empresa de Manutenção)\"]\n    B --> C[\"Teste de Funcionamento<br/>(Empresa de Manutenção)\"]\n    C --> D{Funcionando?}\n    D -->|Sim| E[\"Registro de Serviços<br/>(Empresa de Manutenção)\"]\n    D -->|Não| F[\"Chamado Urgente<br/>(Síndico)\"]\n    E --> G[\"Comunicação se Necessário<br/>(Administradora)\"]\n    F --> H[\"Resolução<br/>(Empresa de Manutenção)\"]\n    H --> I[\"Verificação<br/>(Portaria Online)\"]\n    I --> D\n    G --> J[\"Concluído<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Empresa de Manutenção", "Síndico", "Portaria Online"]'::jsonb,
        '{"empresa_portao": null, "frequencia_manutencao": null}'::jsonb
    ) INTO v_process_id;
    SELECT seed_single_process(
        'Gestão de Materiais',
        'operacao',
        'manual',
        'em_revisao',
        'Processo para controle de estoque, compra e reposição de materiais de limpeza, manutenção e operação do condomínio.',
        '{"description": "Processo para controle de estoque, compra e reposição de materiais de limpeza, manutenção e operação do condomínio.", "workflow": ["1. Monitoramento de estoque de materiais", "2. Identificação de necessidade de reposição", "3. Solicitação de compra ao síndico/administradora", "4. Aprovação e compra", "5. Recebimento e conferência", "6. Armazenamento adequado", "7. Registro no controle de estoque"], "entities": ["Faxineiro", "Síndico", "Administradora"], "variables": ["estoque_minimo", "fornecedor_materiais"], "mermaid_diagram": "flowchart TD\n    A[\"Monitoramento de Estoque<br/>(Faxineiro)\"] --> B{Estoque Mínimo?}\n    B -->|Sim| C[\"Identificação de Necessidade<br/>(Faxineiro)\"]\n    B -->|Não| A\n    C --> D[\"Solicitação de Compra<br/>(Faxineiro)\"]\n    D --> E[\"Aprovação<br/>(Síndico)\"]\n    E --> F[\"Compra<br/>(Administradora)\"]\n    F --> G[\"Recebimento e Conferência<br/>(Faxineiro)\"]\n    G --> H[\"Armazenamento<br/>(Faxineiro)\"]\n    H --> I[\"Registro no Controle<br/>(Administradora)\"]\n    I --> A\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
        '["Faxineiro", "Síndico", "Administradora"]'::jsonb,
        '{"estoque_minimo": null, "fornecedor_materiais": null}'::jsonb
    ) INTO v_process_id;
END $$;