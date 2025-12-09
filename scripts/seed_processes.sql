
-- Obter ou criar stakeholder Sistema
DO $$
DECLARE
    v_creator_id UUID;
BEGIN
    -- Tentar buscar existente
    SELECT id INTO v_creator_id 
    FROM public.stakeholders 
    WHERE email = 'sistema@villadelfiori.com'
    LIMIT 1;
    
    -- Se não existir, criar
    IF v_creator_id IS NULL THEN
        INSERT INTO public.stakeholders (
            name, email, type, role, user_role, is_active
        ) VALUES (
            'Sistema', 'sistema@villadelfiori.com',
            'staff'::stakeholdertype,
            'aprovador'::stakeholderrole,
            'admin'::userrole,
            true
        ) RETURNING id INTO v_creator_id;
    END IF;
    
    -- Criar variável de sessão (usando temp table)
    CREATE TEMP TABLE IF NOT EXISTS seed_creator_id (id UUID);
    DELETE FROM seed_creator_id;
    INSERT INTO seed_creator_id VALUES (v_creator_id);
END $$;


-- Processo 1: Definição e Revisão de Processos
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Definição e Revisão de Processos';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Definição e Revisão de Processos',
            'governanca'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para definir, estruturar e revisar periodicamente todos os processos operacionais, administrativos e de convivência do condomínio. Garante que os processos estejam atualizados, completos e alinhados com as necessidades do condomínio.", "workflow": ["1. Identificação da necessidade de novo processo ou revisão", "2. Estruturação do processo (categoria, subcategoria, entidades envolvidas)", "3. Definição de variáveis e parâmetros necessários", "4. Revisão pelo corpo consultivo (síndico + conselho)", "5. Aprovação e publicação do processo", "6. Revisão periódica conforme ciclo definido"], "entities": ["Síndico", "Conselho Consultivo", "Administradora"], "variables": ["ciclo_revisao", "responsavel_revisao"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação da Necessidade<br/>(Síndico)\"] --> B[\"Elaboração do Rascunho<br/>(Administradora)\"]\n    B --> C[\"Revisão Interna<br/>(Síndico)\"]\n    C --> D[\"Apresentação ao Conselho<br/>(Síndico)\"]\n    D --> E{Aprovado?}\n    E -->|Sim| F[\"Publicação<br/>(Administradora)\"]\n    E -->|Não| G[\"Ajustes<br/>(Administradora)\"]\n    G --> C\n    F --> H[\"Revisão Periódica<br/>(Conselho Consultivo)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo para definir, estruturar e revisar periodicamente todos os processos operacionais, administrativos e de convivência do condomínio. Garante que os processos estejam atualizados, completos e alinhados com as necessidades do condomínio.',
            '["Síndico", "Conselho Consultivo", "Administradora"]'::jsonb,
            '{"ciclo_revisao": null, "responsavel_revisao": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 2: Aprovação do Conselho Consultivo
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Aprovação do Conselho Consultivo';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Aprovação do Conselho Consultivo',
            'governanca'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Workflow de aprovação formal de processos e documentos pelo conselho consultivo. Define critérios, prazos e responsabilidades para aprovação de processos condominiais.", "workflow": ["1. Submissão do processo/documento para aprovação", "2. Distribuição para membros do conselho consultivo", "3. Revisão individual pelos membros", "4. Reunião de deliberação do conselho", "5. Votação e decisão (aprovado/rejeitado/ajustes necessários)", "6. Comunicação da decisão e aplicação de ajustes se necessário"], "entities": ["Síndico", "Conselho Consultivo", "Administradora"], "variables": ["prazo_aprovacao", "quorum_minimo"], "mermaid_diagram": "flowchart TD\n    A[\"Submissão do Processo<br/>(Síndico)\"] --> B[\"Distribuição ao Conselho<br/>(Administradora)\"]\n    B --> C[\"Revisão Individual<br/>(Conselho Consultivo)\"]\n    C --> D[\"Reunião de Deliberação<br/>(Conselho Consultivo)\"]\n    D --> E{Votação}\n    E -->|Aprovado| F[\"Comunicação da Decisão<br/>(Conselho Consultivo)\"]\n    E -->|Rejeitado| G[\"Ajustes Necessários<br/>(Administradora)\"]\n    E -->|Ajustes| H[\"Aplicação de Ajustes<br/>(Administradora)\"]\n    G --> I[\"Refazer Processo<br/>(Síndico)\"]\n    H --> I\n    I --> A\n    F --> J[\"Publicação<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Workflow de aprovação formal de processos e documentos pelo conselho consultivo. Define critérios, prazos e responsabilidades para aprovação de processos condominiais.',
            '["Síndico", "Conselho Consultivo", "Administradora"]'::jsonb,
            '{"prazo_aprovacao": null, "quorum_minimo": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 3: Emissão de Documentos Formais
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Emissão de Documentos Formais';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Emissão de Documentos Formais',
            'governanca'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para gerar e emitir documentos oficiais (POPs, manuais, regulamentos, avisos, comunicados) baseados nos processos aprovados, aplicando variáveis configuradas e em formato pronto para publicação.", "workflow": ["1. Seleção do processo e tipo de documento a gerar", "2. Aplicação automática de variáveis configuradas", "3. Geração do documento em formato estruturado", "4. Revisão do documento gerado", "5. Aprovação final pelo síndico", "6. Publicação no website ou distribuição aos moradores"], "entities": ["Síndico", "Conselho Consultivo", "Administradora"], "variables": ["nome_sindico", "contato_sindico", "administradora_nome"], "mermaid_diagram": "flowchart TD\n    A[\"Seleção do Processo<br/>(Síndico)\"] --> B[\"Aplicação de Variáveis<br/>(Administradora)\"]\n    B --> C[\"Geração do Documento<br/>(Administradora)\"]\n    C --> D[\"Revisão do Documento<br/>(Síndico)\"]\n    D --> E{Aprovado?}\n    E -->|Sim| F[\"Publicação<br/>(Administradora)\"]\n    E -->|Não| G[\"Correções<br/>(Administradora)\"]\n    G --> D\n    F --> H[\"Distribuição aos Moradores<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo para gerar e emitir documentos oficiais (POPs, manuais, regulamentos, avisos, comunicados) baseados nos processos aprovados, aplicando variáveis configuradas e em formato pronto para publicação.',
            '["Síndico", "Conselho Consultivo", "Administradora"]'::jsonb,
            '{"nome_sindico": null, "contato_sindico": null, "administradora_nome": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 4: Uso de Biometria (Entradas Sociais)
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Uso de Biometria (Entradas Sociais)';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Uso de Biometria (Entradas Sociais)',
            'acesso_seguranca'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para cadastro, uso e gestão do sistema de biometria facial e digital nas entradas sociais do condomínio. Define regras de acesso, cadastro de moradores e visitantes autorizados.", "workflow": ["1. Solicitação de cadastro biométrico pelo morador", "2. Verificação de identidade e documentação", "3. Cadastro no sistema biométrico (facial e digital)", "4. Teste de funcionamento e ativação", "5. Orientação sobre uso e regras de acesso", "6. Monitoramento e manutenção do sistema"], "entities": ["Moradores", "Portaria Online", "Sistema de Biometria"], "variables": ["tipo_acesso_portas", "horario_funcionamento"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Cadastro<br/>(Moradores)\"] --> B[\"Verificação de Identidade<br/>(Portaria Online)\"]\n    B --> C[\"Cadastro no Sistema<br/>(Portaria Online)\"]\n    C --> D[\"Teste de Funcionamento<br/>(Portaria Online)\"]\n    D --> E{Ativado?}\n    E -->|Sim| F[\"Orientação de Uso<br/>(Portaria Online)\"]\n    E -->|Não| G[\"Correção<br/>(Portaria Online)\"]\n    G --> D\n    F --> H[\"Monitoramento<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para cadastro, uso e gestão do sistema de biometria facial e digital nas entradas sociais do condomínio. Define regras de acesso, cadastro de moradores e visitantes autorizados.',
            '["Moradores", "Portaria Online", "Sistema de Biometria"]'::jsonb,
            '{"tipo_acesso_portas": null, "horario_funcionamento": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 5: Uso de Controle Remoto (Garagem)
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Uso de Controle Remoto (Garagem)';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Uso de Controle Remoto (Garagem)',
            'acesso_seguranca'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para uso, cadastro e substituição de controles remotos da garagem. Define regras de distribuição, bloqueio em caso de perda e substituição de dispositivos.", "workflow": ["1. Solicitação de controle remoto pelo morador", "2. Verificação de vaga e documentação", "3. Cadastro do controle no sistema", "4. Entrega e orientação sobre uso", "5. Em caso de perda: bloqueio imediato do dispositivo", "6. Substituição mediante solicitação e taxa se aplicável"], "entities": ["Moradores", "Portaria Online", "Sistema de Portão"], "variables": ["tipo_abertura_portao", "vagas_por_unidade"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Controle<br/>(Moradores)\"] --> B[\"Verificação de Vaga<br/>(Portaria Online)\"]\n    B --> C[\"Cadastro no Sistema<br/>(Portaria Online)\"]\n    C --> D[\"Entrega e Orientação<br/>(Portaria Online)\"]\n    D --> E{Uso Normal}\n    E -->|Perda| F[\"Bloqueio Imediato<br/>(Portaria Online)\"]\n    E -->|Substituição| G[\"Solicitação de Substituição<br/>(Moradores)\"]\n    F --> G\n    G --> H[\"Novo Cadastro<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff"}'::jsonb,
            'Procedimento para uso, cadastro e substituição de controles remotos da garagem. Define regras de distribuição, bloqueio em caso de perda e substituição de dispositivos.',
            '["Moradores", "Portaria Online", "Sistema de Portão"]'::jsonb,
            '{"tipo_abertura_portao": null, "vagas_por_unidade": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 6: Cadastro, Bloqueio e Substituição
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Cadastro, Bloqueio e Substituição';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Cadastro, Bloqueio e Substituição',
            'acesso_seguranca'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo unificado para gerenciar cadastros de acesso (biometria, controles remotos), bloqueio de dispositivos em caso de perda ou término de contrato, e substituição de dispositivos.", "workflow": ["1. Solicitação de cadastro/bloqueio/substituição", "2. Verificação de identidade e autorização", "3. Execução da ação (cadastro/bloqueio/substituição)", "4. Registro no sistema de ocorrências", "5. Notificação ao solicitante", "6. Atualização de documentação e registros"], "entities": ["Moradores", "Portaria Online", "Administradora"], "variables": ["politica_substituicao_controle_remoto"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação<br/>(Moradores)\"] --> B{Tipo de Ação}\n    B -->|Cadastro| C[\"Verificação de Autorização<br/>(Portaria Online)\"]\n    B -->|Bloqueio| D[\"Verificação de Identidade<br/>(Portaria Online)\"]\n    B -->|Substituição| E[\"Verificação e Taxa<br/>(Portaria Online)\"]\n    C --> F[\"Execução<br/>(Portaria Online)\"]\n    D --> F\n    E --> F\n    F --> G[\"Registro no Sistema<br/>(Portaria Online)\"]\n    G --> H[\"Notificação<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo unificado para gerenciar cadastros de acesso (biometria, controles remotos), bloqueio de dispositivos em caso de perda ou término de contrato, e substituição de dispositivos.',
            '["Moradores", "Portaria Online", "Administradora"]'::jsonb,
            '{"politica_substituicao_controle_remoto": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 7: Câmeras: Uso, Privacidade e Auditoria
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Câmeras: Uso, Privacidade e Auditoria';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Câmeras: Uso, Privacidade e Auditoria',
            'acesso_seguranca'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento sobre uso do sistema de câmeras de segurança (CFTV), políticas de privacidade, acesso às gravações e procedimentos de auditoria. Garante segurança respeitando privacidade dos moradores.", "workflow": ["1. Monitoramento contínuo das áreas comuns", "2. Gravação e armazenamento conforme política de retenção", "3. Solicitação de acesso às gravações (apenas autorizados)", "4. Verificação de autorização e motivo da solicitação", "5. Fornecimento de gravação com registro de acesso", "6. Auditoria periódica de acessos e uso do sistema"], "entities": ["Síndico", "Empresa de Segurança", "Portaria Online"], "variables": ["retencao_gravacoes", "areas_monitoradas"], "mermaid_diagram": "flowchart TD\n    A[\"Monitoramento Contínuo<br/>(Empresa de Segurança)\"] --> B[\"Gravação<br/>(Empresa de Segurança)\"]\n    B --> C[\"Armazenamento<br/>(Empresa de Segurança)\"]\n    C --> D{Solicitação de Acesso}\n    D -->|Sim| E[\"Verificação de Autorização<br/>(Síndico)\"]\n    D -->|Não| F[\"Retenção Periódica<br/>(Empresa de Segurança)\"]\n    E --> G{Autorizado?}\n    G -->|Sim| H[\"Fornecimento de Gravação<br/>(Empresa de Segurança)\"]\n    G -->|Não| I[\"Negado<br/>(Síndico)\"]\n    H --> J[\"Registro de Acesso<br/>(Portaria Online)\"]\n    F --> K[\"Auditoria Periódica<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento sobre uso do sistema de câmeras de segurança (CFTV), políticas de privacidade, acesso às gravações e procedimentos de auditoria. Garante segurança respeitando privacidade dos moradores.',
            '["Síndico", "Empresa de Segurança", "Portaria Online"]'::jsonb,
            '{"retencao_gravacoes": null, "areas_monitoradas": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 8: Acesso de Visitantes
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Acesso de Visitantes';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Acesso de Visitantes',
            'acesso_seguranca'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para autorização e controle de acesso de visitantes ao condomínio. Define regras de autorização, registro e acompanhamento de visitantes.", "workflow": ["1. Solicitação de autorização pelo morador (presencial ou via app)", "2. Verificação de identidade do morador solicitante", "3. Registro do visitante no sistema", "4. Autorização de acesso e orientação", "5. Acompanhamento e registro de entrada/saída", "6. Encerramento da visita e atualização de registros"], "entities": ["Moradores", "Visitantes", "Portaria Online"], "variables": ["portaria_funcionamento", "horario_visitas"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação pelo Morador<br/>(Moradores)\"] --> B[\"Verificação de Identidade<br/>(Portaria Online)\"]\n    B --> C[\"Registro do Visitante<br/>(Portaria Online)\"]\n    C --> D[\"Autorização de Acesso<br/>(Portaria Online)\"]\n    D --> E[\"Orientação<br/>(Portaria Online)\"]\n    E --> F[\"Entrada<br/>(Visitantes)\"]\n    F --> G[\"Acompanhamento<br/>(Portaria Online)\"]\n    G --> H[\"Saída<br/>(Visitantes)\"]\n    H --> I[\"Atualização de Registros<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para autorização e controle de acesso de visitantes ao condomínio. Define regras de autorização, registro e acompanhamento de visitantes.',
            '["Moradores", "Visitantes", "Portaria Online"]'::jsonb,
            '{"portaria_funcionamento": null, "horario_visitas": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 9: Relatórios de Incidentes
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Relatórios de Incidentes';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Relatórios de Incidentes',
            'acesso_seguranca'::processcategory,
            NULL,
            'formulario'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para registro, análise e acompanhamento de incidentes de segurança no condomínio. Garante rastreabilidade e ações corretivas adequadas.", "workflow": ["1. Identificação e registro do incidente", "2. Classificação do incidente (gravidade, tipo)", "3. Notificação aos responsáveis (síndico, segurança)", "4. Investigação e coleta de evidências", "5. Análise e definição de ações corretivas", "6. Implementação de medidas e acompanhamento", "7. Registro no histórico e lições aprendidas"], "entities": ["Síndico", "Empresa de Segurança", "Portaria Online", "Moradores"], "variables": ["telefone_policia", "telefone_bombeiros"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Incidente<br/>(Moradores/Portaria)\"] --> B[\"Registro<br/>(Portaria Online)\"]\n    B --> C[\"Classificação<br/>(Síndico)\"]\n    C --> D[\"Notificação<br/>(Portaria Online)\"]\n    D --> E[\"Investigaçã<br/>(Empresa de Segurança)\"]\n    E --> F[\"Coleta de Evidências<br/>(Empresa de Segurança)\"]\n    F --> G[\"Análise<br/>(Síndico)\"]\n    G --> H[\"Ações Corretivas<br/>(Síndico)\"]\n    H --> I[\"Implementação<br/>(Empresa de Segurança)\"]\n    I --> J[\"Acompanhamento<br/>(Síndico)\"]\n    J --> K[\"Registro no Histórico<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo para registro, análise e acompanhamento de incidentes de segurança no condomínio. Garante rastreabilidade e ações corretivas adequadas.',
            '["Síndico", "Empresa de Segurança", "Portaria Online", "Moradores"]'::jsonb,
            '{"telefone_policia": null, "telefone_bombeiros": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 10: Portaria Online
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Portaria Online';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Portaria Online',
            'operacao'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento operacional para funcionamento da portaria online, incluindo autorização de moradores, controle de visitantes, controle de entregas e comunicação de incidentes.", "workflow": ["1. Atendimento de solicitações via sistema/app", "2. Verificação de autorização e identidade", "3. Processamento da solicitação (acesso, entrega, etc.)", "4. Registro no sistema de ocorrências", "5. Comunicação com morador quando necessário", "6. Atuação em contingência quando sistema offline"], "entities": ["Portaria Online", "Moradores", "Visitantes", "Entregadores"], "variables": ["portaria_online_contato", "portaria_funcionamento"], "mermaid_diagram": "flowchart TD\n    A[\"Atendimento via Sistema<br/>(Portaria Online)\"] --> B[\"Verificação de Autorização<br/>(Portaria Online)\"]\n    B --> C{Tipo de Solicitação}\n    C -->|Acesso| D[\"Processamento de Acesso<br/>(Portaria Online)\"]\n    C -->|Entrega| E[\"Processamento de Entrega<br/>(Portaria Online)\"]\n    C -->|Outro| F[\"Processamento Específico<br/>(Portaria Online)\"]\n    D --> G[\"Registro no Sistema<br/>(Portaria Online)\"]\n    E --> G\n    F --> G\n    G --> H[\"Comunicação<br/>(Portaria Online)\"]\n    H --> I{Sistema Online?}\n    I -->|Não| J[\"Atuação em Contingência<br/>(Portaria Online)\"]\n    I -->|Sim| K[\"Concluído<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#dc2626,stroke:#ef4444,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento operacional para funcionamento da portaria online, incluindo autorização de moradores, controle de visitantes, controle de entregas e comunicação de incidentes.',
            '["Portaria Online", "Moradores", "Visitantes", "Entregadores"]'::jsonb,
            '{"portaria_online_contato": null, "portaria_funcionamento": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 11: Rotina de Limpeza (Faxineiro)
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Rotina de Limpeza (Faxineiro)';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Rotina de Limpeza (Faxineiro)',
            'operacao'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.", "workflow": ["1. Execução da rotina diária de limpeza", "2. Preenchimento de checklist semanal/mensal", "3. Identificação de necessidade de reposição de materiais", "4. Reporte de problemas estruturais identificados", "5. Comunicação ao síndico/administradora", "6. Acompanhamento de correções e melhorias"], "entities": ["Faxineiro", "Síndico", "Administradora"], "variables": ["areas_comuns", "frequencia_limpeza"], "mermaid_diagram": "flowchart TD\n    A[\"Execução da Rotina Diária<br/>(Faxineiro)\"] --> B[\"Preenchimento de Checklist<br/>(Faxineiro)\"]\n    B --> C{Necessidade de Reposição?}\n    C -->|Sim| D[\"Identificação de Materiais<br/>(Faxineiro)\"]\n    C -->|Não| E{Problemas Estruturais?}\n    D --> F[\"Comunicação ao Síndico<br/>(Faxineiro)\"]\n    E -->|Sim| G[\"Reporte de Problemas<br/>(Faxineiro)\"]\n    E -->|Não| H[\"Concluído<br/>(Faxineiro)\"]\n    F --> I[\"Acompanhamento<br/>(Administradora)\"]\n    G --> F\n    I --> H\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento operacional padrão para rotina de limpeza das áreas comuns do condomínio, incluindo checklist semanal/mensal, reposição de materiais e reporte de problemas estruturais.',
            '["Faxineiro", "Síndico", "Administradora"]'::jsonb,
            '{"areas_comuns": null, "frequencia_limpeza": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 12: Gestão de Fornecedores
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Gestão de Fornecedores';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Gestão de Fornecedores',
            'operacao'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para cadastro, avaliação, contratação e acompanhamento de fornecedores do condomínio (jardinagem, dedetização, manutenção, etc.).", "workflow": ["1. Identificação de necessidade de serviço", "2. Pesquisa e cotação de fornecedores", "3. Avaliação e seleção de fornecedor", "4. Aprovação pelo conselho consultivo", "5. Contratação e cadastro no sistema", "6. Acompanhamento de serviços e avaliação de desempenho", "7. Renovação ou substituição conforme necessário"], "entities": ["Síndico", "Conselho Consultivo", "Administradora", "Fornecedores"], "variables": ["empresa_jardinagem", "empresa_dedetizacao"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação de Necessidade<br/>(Síndico)\"] --> B[\"Pesquisa e Cotação<br/>(Administradora)\"]\n    B --> C[\"Avaliação e Seleção<br/>(Síndico)\"]\n    C --> D[\"Aprovação pelo Conselho<br/>(Conselho Consultivo)\"]\n    D --> E{Aprovado?}\n    E -->|Sim| F[\"Contratação e Cadastro<br/>(Administradora)\"]\n    E -->|Não| G[\"Buscar Outro Fornecedor<br/>(Administradora)\"]\n    G --> B\n    F --> H[\"Acompanhamento de Serviços<br/>(Administradora)\"]\n    H --> I{Avaliação de Desempenho}\n    I -->|Bom| J[\"Renovação<br/>(Administradora)\"]\n    I -->|Ruim| K[\"Substituição<br/>(Administradora)\"]\n    K --> B\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#dc2626,stroke:#ef4444,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#dc2626,stroke:#ef4444,color:#fff"}'::jsonb,
            'Processo para cadastro, avaliação, contratação e acompanhamento de fornecedores do condomínio (jardinagem, dedetização, manutenção, etc.).',
            '["Síndico", "Conselho Consultivo", "Administradora", "Fornecedores"]'::jsonb,
            '{"empresa_jardinagem": null, "empresa_dedetizacao": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 13: Manutenção de Elevadores
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Manutenção de Elevadores';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Manutenção de Elevadores',
            'operacao'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para manutenção preventiva e corretiva dos elevadores, incluindo agendamento, execução, registro e comunicação de problemas.", "workflow": ["1. Agendamento de manutenção preventiva (mensal/trimestral)", "2. Notificação prévia aos moradores", "3. Execução da manutenção pela empresa especializada", "4. Registro de serviços realizados", "5. Em caso de problema: abertura de chamado urgente", "6. Acompanhamento até resolução", "7. Atualização de documentação e histórico"], "entities": ["Empresa de Manutenção dos Elevadores", "Síndico", "Moradores"], "variables": ["empresa_elevador", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Agendamento Preventiva<br/>(Administradora)\"] --> B[\"Notificação aos Moradores<br/>(Administradora)\"]\n    B --> C[\"Execução da Manutenção<br/>(Empresa de Manutenção)\"]\n    C --> D[\"Registro de Serviços<br/>(Empresa de Manutenção)\"]\n    D --> E{Problema Identificado?}\n    E -->|Sim| F[\"Chamado Urgente<br/>(Síndico)\"]\n    E -->|Não| G[\"Atualização de Documentação<br/>(Administradora)\"]\n    F --> H[\"Acompanhamento<br/>(Síndico)\"]\n    H --> I[\"Resolução<br/>(Empresa de Manutenção)\"]\n    I --> G\n    G --> J[\"Histórico Atualizado<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para manutenção preventiva e corretiva dos elevadores, incluindo agendamento, execução, registro e comunicação de problemas.',
            '["Empresa de Manutenção dos Elevadores", "Síndico", "Moradores"]'::jsonb,
            '{"empresa_elevador": null, "frequencia_manutencao": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 14: Manutenção do Portão Automático
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Manutenção do Portão Automático';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Manutenção do Portão Automático',
            'operacao'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para manutenção preventiva e corretiva do portão automático da garagem, garantindo funcionamento adequado e segurança.", "workflow": ["1. Agendamento de manutenção preventiva", "2. Execução de inspeção e manutenção", "3. Teste de funcionamento", "4. Registro de serviços e peças substituídas", "5. Em caso de falha: chamado urgente", "6. Resolução e verificação de funcionamento", "7. Comunicação ao síndico e moradores se necessário"], "entities": ["Empresa de Manutenção", "Síndico", "Portaria Online"], "variables": ["empresa_portao", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Agendamento Preventiva<br/>(Administradora)\"] --> B[\"Inspeção e Manutenção<br/>(Empresa de Manutenção)\"]\n    B --> C[\"Teste de Funcionamento<br/>(Empresa de Manutenção)\"]\n    C --> D{Funcionando?}\n    D -->|Sim| E[\"Registro de Serviços<br/>(Empresa de Manutenção)\"]\n    D -->|Não| F[\"Chamado Urgente<br/>(Síndico)\"]\n    E --> G[\"Comunicação se Necessário<br/>(Administradora)\"]\n    F --> H[\"Resolução<br/>(Empresa de Manutenção)\"]\n    H --> I[\"Verificação<br/>(Portaria Online)\"]\n    I --> D\n    G --> J[\"Concluído<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para manutenção preventiva e corretiva do portão automático da garagem, garantindo funcionamento adequado e segurança.',
            '["Empresa de Manutenção", "Síndico", "Portaria Online"]'::jsonb,
            '{"empresa_portao": null, "frequencia_manutencao": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 15: Gestão de Materiais
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Gestão de Materiais';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Gestão de Materiais',
            'operacao'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para controle de estoque, compra e reposição de materiais de limpeza, manutenção e operação do condomínio.", "workflow": ["1. Monitoramento de estoque de materiais", "2. Identificação de necessidade de reposição", "3. Solicitação de compra ao síndico/administradora", "4. Aprovação e compra", "5. Recebimento e conferência", "6. Armazenamento adequado", "7. Registro no controle de estoque"], "entities": ["Faxineiro", "Síndico", "Administradora"], "variables": ["estoque_minimo", "fornecedor_materiais"], "mermaid_diagram": "flowchart TD\n    A[\"Monitoramento de Estoque<br/>(Faxineiro)\"] --> B{Estoque Mínimo?}\n    B -->|Sim| C[\"Identificação de Necessidade<br/>(Faxineiro)\"]\n    B -->|Não| A\n    C --> D[\"Solicitação de Compra<br/>(Faxineiro)\"]\n    D --> E[\"Aprovação<br/>(Síndico)\"]\n    E --> F[\"Compra<br/>(Administradora)\"]\n    F --> G[\"Recebimento e Conferência<br/>(Faxineiro)\"]\n    G --> H[\"Armazenamento<br/>(Faxineiro)\"]\n    H --> I[\"Registro no Controle<br/>(Administradora)\"]\n    I --> A\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo para controle de estoque, compra e reposição de materiais de limpeza, manutenção e operação do condomínio.',
            '["Faxineiro", "Síndico", "Administradora"]'::jsonb,
            '{"estoque_minimo": null, "fornecedor_materiais": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 16: Escritório Compartilhado
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Escritório Compartilhado';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Escritório Compartilhado',
            'areas_comuns'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento de uso do escritório compartilhado (home office), incluindo reservas, horários, regras de uso e manutenção do espaço.", "workflow": ["1. Solicitação de reserva pelo morador", "2. Verificação de disponibilidade", "3. Confirmação da reserva", "4. Uso do espaço conforme regras estabelecidas", "5. Limpeza e organização ao término do uso", "6. Registro de uso e feedback se necessário"], "entities": ["Moradores", "Administradora"], "variables": ["horario_escritorio", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C{Disponível?}\n    C -->|Sim| D[\"Confirmação da Reserva<br/>(Administradora)\"]\n    C -->|Não| E[\"Propor Outro Horário<br/>(Administradora)\"]\n    E --> B\n    D --> F[\"Uso do Espaço<br/>(Moradores)\"]\n    F --> G[\"Limpeza e Organização<br/>(Moradores)\"]\n    G --> H[\"Registro de Uso<br/>(Administradora)\"]\n    H --> I[\"Feedback se Necessário<br/>(Moradores)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento de uso do escritório compartilhado (home office), incluindo reservas, horários, regras de uso e manutenção do espaço.',
            '["Moradores", "Administradora"]'::jsonb,
            '{"horario_escritorio": null, "politica_reservas_areas_comuns": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 17: Academia
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Academia';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Academia',
            'areas_comuns'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento de uso da academia, incluindo horários, regras de segurança, limpeza de equipamentos e reservas quando aplicável.", "workflow": ["1. Verificação de horário de funcionamento", "2. Acesso à academia (biometria ou chave)", "3. Uso dos equipamentos conforme regras de segurança", "4. Limpeza dos equipamentos após uso", "5. Organização do espaço", "6. Saída e registro de uso"], "entities": ["Moradores"], "variables": ["horario_academia", "capacidade_maxima"], "mermaid_diagram": "flowchart TD\n    A[\"Verificação de Horário<br/>(Moradores)\"] --> B[\"Acesso à Academia<br/>(Moradores)\"]\n    B --> C[\"Uso dos Equipamentos<br/>(Moradores)\"]\n    C --> D[\"Limpeza dos Equipamentos<br/>(Moradores)\"]\n    D --> E[\"Organização do Espaço<br/>(Moradores)\"]\n    E --> F[\"Saída<br/>(Moradores)\"]\n    F --> G[\"Registro de Uso<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento de uso da academia, incluindo horários, regras de segurança, limpeza de equipamentos e reservas quando aplicável.',
            '["Moradores"]'::jsonb,
            '{"horario_academia": null, "capacidade_maxima": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 18: SPA - Sala de Massagem
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'SPA - Sala de Massagem';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'SPA - Sala de Massagem',
            'areas_comuns'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento de uso da SPA/Sala de Massagem, incluindo reservas, horários, regras de uso, limpeza e manutenção.", "workflow": ["1. Solicitação de reserva com antecedência", "2. Verificação de disponibilidade e confirmação", "3. Uso do espaço no horário reservado", "4. Limpeza completa após uso", "5. Verificação de equipamentos e reporte de problemas", "6. Encerramento da reserva"], "entities": ["Moradores", "Administradora"], "variables": ["horario_spa", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C[\"Confirmação<br/>(Administradora)\"]\n    C --> D[\"Uso no Horário Reservado<br/>(Moradores)\"]\n    D --> E[\"Limpeza Completa<br/>(Moradores)\"]\n    E --> F[\"Verificação de Equipamentos<br/>(Moradores)\"]\n    F --> G{Problemas?}\n    G -->|Sim| H[\"Reporte de Problemas<br/>(Moradores)\"]\n    G -->|Não| I[\"Encerramento<br/>(Administradora)\"]\n    H --> I\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#dc2626,stroke:#ef4444,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento de uso da SPA/Sala de Massagem, incluindo reservas, horários, regras de uso, limpeza e manutenção.',
            '["Moradores", "Administradora"]'::jsonb,
            '{"horario_spa": null, "politica_reservas_areas_comuns": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 19: Área de Recreação
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Área de Recreação';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Área de Recreação',
            'areas_comuns'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento de uso da área de recreação, incluindo horários, regras de convivência, reservas para eventos e manutenção.", "workflow": ["1. Verificação de disponibilidade ou solicitação de reserva", "2. Uso da área conforme regras estabelecidas", "3. Respeito aos horários e regras de silêncio", "4. Limpeza e organização ao término", "5. Reporte de problemas ou danos", "6. Registro de uso se necessário"], "entities": ["Moradores", "Visitantes"], "variables": ["horario_areas_recreacao", "politica_reservas_areas_comuns"], "mermaid_diagram": "flowchart TD\n    A[\"Verificação de Disponibilidade<br/>(Moradores)\"] --> B{Reserva Necessária?}\n    B -->|Sim| C[\"Solicitação de Reserva<br/>(Moradores)\"]\n    B -->|Não| D[\"Uso da Área<br/>(Moradores)\"]\n    C --> E[\"Confirmação<br/>(Administradora)\"]\n    E --> D\n    D --> F[\"Respeito às Regras<br/>(Moradores)\"]\n    F --> G[\"Limpeza e Organização<br/>(Moradores)\"]\n    G --> H{Problemas ou Danos?}\n    H -->|Sim| I[\"Reporte<br/>(Moradores)\"]\n    H -->|Não| J[\"Registro de Uso<br/>(Administradora)\"]\n    I --> J\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento de uso da área de recreação, incluindo horários, regras de convivência, reservas para eventos e manutenção.',
            '["Moradores", "Visitantes"]'::jsonb,
            '{"horario_areas_recreacao": null, "politica_reservas_areas_comuns": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 20: Jardins
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Jardins';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Jardins',
            'areas_comuns'::processcategory,
            NULL,
            'pop'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para manutenção e cuidado dos jardins, incluindo regas, podas, limpeza e melhorias paisagísticas.", "workflow": ["1. Planejamento de manutenção periódica", "2. Execução de serviços (rega, poda, limpeza)", "3. Monitoramento de saúde das plantas", "4. Identificação de necessidades de melhorias", "5. Execução de melhorias paisagísticas quando aprovadas", "6. Registro de serviços e acompanhamento"], "entities": ["Empresa de Jardinagem", "Síndico"], "variables": ["empresa_jardinagem", "frequencia_manutencao"], "mermaid_diagram": "flowchart TD\n    A[\"Planejamento Periódico<br/>(Empresa de Jardinagem)\"] --> B[\"Execução de Serviços<br/>(Empresa de Jardinagem)\"]\n    B --> C[\"Monitoramento de Saúde<br/>(Empresa de Jardinagem)\"]\n    C --> D{Necessidade de Melhorias?}\n    D -->|Sim| E[\"Aprovação de Melhorias<br/>(Síndico)\"]\n    D -->|Não| F[\"Registro de Serviços<br/>(Empresa de Jardinagem)\"]\n    E --> G[\"Execução de Melhorias<br/>(Empresa de Jardinagem)\"]\n    G --> F\n    F --> H[\"Acompanhamento<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para manutenção e cuidado dos jardins, incluindo regas, podas, limpeza e melhorias paisagísticas.',
            '["Empresa de Jardinagem", "Síndico"]'::jsonb,
            '{"empresa_jardinagem": null, "frequencia_manutencao": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 21: Estacionamento de Visitantes
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Estacionamento de Visitantes';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Estacionamento de Visitantes',
            'areas_comuns'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento de uso das vagas de visitantes, incluindo regras de estacionamento, tempo máximo de permanência e controle de uso.", "workflow": ["1. Solicitação de autorização de estacionamento pelo morador", "2. Verificação de disponibilidade de vagas", "3. Autorização e registro do veículo", "4. Estacionamento na vaga designada", "5. Monitoramento de tempo de permanência", "6. Saída e liberação da vaga"], "entities": ["Moradores", "Visitantes", "Portaria Online"], "variables": ["possui_vagas_visitantes", "limite_vagas_visitantes", "tempo_maximo_estacionamento"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Autorização<br/>(Moradores)\"] --> B[\"Verificação de Vagas<br/>(Portaria Online)\"]\n    B --> C{Disponível?}\n    C -->|Sim| D[\"Autorização e Registro<br/>(Portaria Online)\"]\n    C -->|Não| E[\"Negado<br/>(Portaria Online)\"]\n    D --> F[\"Estacionamento<br/>(Visitantes)\"]\n    F --> G[\"Monitoramento de Tempo<br/>(Portaria Online)\"]\n    G --> H{Excedeu Tempo?}\n    H -->|Sim| I[\"Notificação<br/>(Portaria Online)\"]\n    H -->|Não| J[\"Saída<br/>(Visitantes)\"]\n    I --> J\n    J --> K[\"Liberação da Vaga<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento de uso das vagas de visitantes, incluindo regras de estacionamento, tempo máximo de permanência e controle de uso.',
            '["Moradores", "Visitantes", "Portaria Online"]'::jsonb,
            '{"possui_vagas_visitantes": null, "limite_vagas_visitantes": null, "tempo_maximo_estacionamento": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 22: Gestão de Pets
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Gestão de Pets';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Gestão de Pets',
            'convivencia'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento sobre circulação de pets nas áreas comuns, normas de higiene, segurança (focinheira quando necessário) e convivência respeitosa.", "workflow": ["1. Cadastro do pet no sistema do condomínio", "2. Apresentação de documentação (vacinação, etc.)", "3. Orientação sobre regras de circulação", "4. Uso das áreas comuns com pet conforme regras", "5. Limpeza imediata de dejetos", "6. Respeito às regras de segurança e convivência", "7. Revisão periódica de cadastro e documentação"], "entities": ["Moradores", "Pets"], "variables": ["permite_pets", "restricoes_pets"], "mermaid_diagram": "flowchart TD\n    A[\"Cadastro do Pet<br/>(Moradores)\"] --> B[\"Apresentação de Documentação<br/>(Moradores)\"]\n    B --> C[\"Orientação sobre Regras<br/>(Administradora)\"]\n    C --> D[\"Uso das Áreas Comuns<br/>(Moradores)\"]\n    D --> E[\"Limpeza de Dejetos<br/>(Moradores)\"]\n    E --> F[\"Respeito às Regras<br/>(Moradores)\"]\n    F --> G{Revisão Periódica?}\n    G -->|Sim| H[\"Atualização de Cadastro<br/>(Moradores)\"]\n    G -->|Não| D\n    H --> D\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento sobre circulação de pets nas áreas comuns, normas de higiene, segurança (focinheira quando necessário) e convivência respeitosa.',
            '["Moradores", "Pets"]'::jsonb,
            '{"permite_pets": null, "restricoes_pets": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 23: Regras de Silêncio
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Regras de Silêncio';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Regras de Silêncio',
            'convivencia'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento sobre horários de silêncio, regras de convivência e procedimentos em caso de perturbação do sossego.", "workflow": ["1. Conhecimento das regras de silêncio pelos moradores", "2. Respeito aos horários estabelecidos", "3. Em caso de perturbação: comunicação ao síndico/portaria", "4. Verificação e orientação ao morador responsável", "5. Aplicação de medidas se necessário", "6. Registro de ocorrência se reincidente"], "entities": ["Moradores", "Síndico", "Portaria Online"], "variables": ["horario_silencio_dias_uteis", "horario_silencio_fds"], "mermaid_diagram": "flowchart TD\n    A[\"Conhecimento das Regras<br/>(Moradores)\"] --> B[\"Respeito aos Horários<br/>(Moradores)\"]\n    B --> C{Perturbação?}\n    C -->|Sim| D[\"Comunicação ao Síndico<br/>(Moradores)\"]\n    C -->|Não| E[\"Convivência Normal<br/>(Moradores)\"]\n    D --> F[\"Verificação<br/>(Síndico)\"]\n    F --> G[\"Orientação<br/>(Síndico)\"]\n    G --> H{Reincidência?}\n    H -->|Sim| I[\"Medidas<br/>(Síndico)\"]\n    H -->|Não| E\n    I --> J[\"Registro de Ocorrência<br/>(Portaria Online)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento sobre horários de silêncio, regras de convivência e procedimentos em caso de perturbação do sossego.',
            '["Moradores", "Síndico", "Portaria Online"]'::jsonb,
            '{"horario_silencio_dias_uteis": null, "horario_silencio_fds": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 24: Obras Internas
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Obras Internas';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Obras Internas',
            'convivencia'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para solicitação, aprovação e execução de obras internas nas unidades, incluindo regras, horários e documentação necessária.", "workflow": ["1. Solicitação de obra pelo morador", "2. Apresentação de documentação (projeto, ART, etc.)", "3. Aprovação pelo síndico/conselho", "4. Definição de horários e regras de execução", "5. Notificação aos moradores vizinhos", "6. Execução da obra conforme aprovado", "7. Vistoria e aprovação final", "8. Limpeza e organização do espaço comum utilizado"], "entities": ["Moradores", "Síndico", "Conselho Consultivo"], "variables": ["politica_obras", "horario_obras"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Obra<br/>(Moradores)\"] --> B[\"Apresentação de Documentação<br/>(Moradores)\"]\n    B --> C[\"Aprovação pelo Síndico<br/>(Síndico)\"]\n    C --> D{Aprovado?}\n    D -->|Sim| E[\"Definição de Horários<br/>(Síndico)\"]\n    D -->|Não| F[\"Correções<br/>(Moradores)\"]\n    F --> B\n    E --> G[\"Notificação aos Vizinhos<br/>(Síndico)\"]\n    G --> H[\"Execução da Obra<br/>(Moradores)\"]\n    H --> I[\"Vistoria<br/>(Síndico)\"]\n    I --> J{Aprovado?}\n    J -->|Sim| K[\"Limpeza<br/>(Moradores)\"]\n    J -->|Não| L[\"Correções<br/>(Moradores)\"]\n    L --> H\n    K --> M[\"Concluído<br/>(Síndico)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style L fill:#dc2626,stroke:#ef4444,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para solicitação, aprovação e execução de obras internas nas unidades, incluindo regras, horários e documentação necessária.',
            '["Moradores", "Síndico", "Conselho Consultivo"]'::jsonb,
            '{"politica_obras": null, "horario_obras": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 25: Assembleias
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Assembleias';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Assembleias',
            'eventos'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para organização, convocação e realização de assembleias condominiais, incluindo pauta, quórum e atas.", "workflow": ["1. Definição de pauta e data pela administradora/síndico", "2. Convocação formal com antecedência mínima", "3. Distribuição de material e documentação", "4. Realização da assembleia", "5. Registro de presença e quórum", "6. Deliberações e votações", "7. Elaboração e aprovação da ata", "8. Distribuição da ata aos moradores"], "entities": ["Síndico", "Conselho Consultivo", "Administradora", "Moradores"], "variables": ["prazo_convocacao", "quorum_minimo"], "mermaid_diagram": "flowchart TD\n    A[\"Definição de Pauta<br/>(Síndico)\"] --> B[\"Convocação Formal<br/>(Administradora)\"]\n    B --> C[\"Distribuição de Material<br/>(Administradora)\"]\n    C --> D[\"Realização da Assembleia<br/>(Síndico)\"]\n    D --> E[\"Registro de Presença<br/>(Administradora)\"]\n    E --> F[\"Verificação de Quórum<br/>(Conselho Consultivo)\"]\n    F --> G{Quórum Atingido?}\n    G -->|Sim| H[\"Deliberações e Votações<br/>(Conselho Consultivo)\"]\n    G -->|Não| I[\"Adiamento<br/>(Síndico)\"]\n    H --> J[\"Elaboração da Ata<br/>(Administradora)\"]\n    J --> K[\"Aprovação da Ata<br/>(Conselho Consultivo)\"]\n    K --> L[\"Distribuição aos Moradores<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff\n    style L fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para organização, convocação e realização de assembleias condominiais, incluindo pauta, quórum e atas.',
            '["Síndico", "Conselho Consultivo", "Administradora", "Moradores"]'::jsonb,
            '{"prazo_convocacao": null, "quorum_minimo": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 26: Manutenções Programadas
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Manutenções Programadas';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Manutenções Programadas',
            'eventos'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo para planejamento, comunicação e execução de manutenções programadas que afetam áreas comuns ou unidades.", "workflow": ["1. Planejamento anual de manutenções", "2. Agendamento com fornecedores", "3. Comunicação prévia aos moradores afetados", "4. Preparação do local e equipamentos", "5. Execução da manutenção", "6. Verificação e testes", "7. Comunicação de conclusão", "8. Registro no histórico de manutenções"], "entities": ["Síndico", "Fornecedores", "Moradores"], "variables": ["calendario_manutencoes"], "mermaid_diagram": "flowchart TD\n    A[\"Planejamento Anual<br/>(Síndico)\"] --> B[\"Agendamento com Fornecedores<br/>(Administradora)\"]\n    B --> C[\"Comunicação aos Moradores<br/>(Administradora)\"]\n    C --> D[\"Preparação do Local<br/>(Administradora)\"]\n    D --> E[\"Execução da Manutenção<br/>(Fornecedores)\"]\n    E --> F[\"Verificação e Testes<br/>(Síndico)\"]\n    F --> G{Sucesso?}\n    G -->|Sim| H[\"Comunicação de Conclusão<br/>(Administradora)\"]\n    G -->|Não| I[\"Correções<br/>(Fornecedores)\"]\n    I --> E\n    H --> J[\"Registro no Histórico<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo para planejamento, comunicação e execução de manutenções programadas que afetam áreas comuns ou unidades.',
            '["Síndico", "Fornecedores", "Moradores"]'::jsonb,
            '{"calendario_manutencoes": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 27: Festas e Reuniões Privadas
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Festas e Reuniões Privadas';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Festas e Reuniões Privadas',
            'eventos'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Regulamento para reserva e uso de áreas comuns para festas e reuniões privadas de moradores, incluindo regras, horários e limpeza.", "workflow": ["1. Solicitação de reserva com antecedência", "2. Verificação de disponibilidade", "3. Aprovação e confirmação da reserva", "4. Pagamento de taxa se aplicável", "5. Uso do espaço no horário reservado", "6. Limpeza completa após o evento", "7. Vistoria e liberação", "8. Registro de uso"], "entities": ["Moradores", "Administradora"], "variables": ["politica_eventos", "horario_eventos"], "mermaid_diagram": "flowchart TD\n    A[\"Solicitação de Reserva<br/>(Moradores)\"] --> B[\"Verificação de Disponibilidade<br/>(Administradora)\"]\n    B --> C{Aprovado?}\n    C -->|Sim| D[\"Confirmação<br/>(Administradora)\"]\n    C -->|Não| E[\"Negado<br/>(Administradora)\"]\n    D --> F[\"Pagamento de Taxa<br/>(Moradores)\"]\n    F --> G[\"Uso do Espaço<br/>(Moradores)\"]\n    G --> H[\"Limpeza Completa<br/>(Moradores)\"]\n    H --> I[\"Vistoria<br/>(Administradora)\"]\n    I --> J[\"Liberação<br/>(Administradora)\"]\n    J --> K[\"Registro de Uso<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Regulamento para reserva e uso de áreas comuns para festas e reuniões privadas de moradores, incluindo regras, horários e limpeza.',
            '["Moradores", "Administradora"]'::jsonb,
            '{"politica_eventos": null, "horario_eventos": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 28: Reservas de Áreas
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Reservas de Áreas';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Reservas de Áreas',
            'eventos'::processcategory,
            NULL,
            'regulamento'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Processo unificado para reserva de áreas comuns (escritório, SPA, área de recreação) incluindo sistema de reservas, regras e cancelamentos.", "workflow": ["1. Consulta de disponibilidade no sistema", "2. Solicitação de reserva", "3. Verificação e confirmação", "4. Uso da área no horário reservado", "5. Limpeza e organização", "6. Encerramento da reserva", "7. Em caso de cancelamento: comunicação com antecedência"], "entities": ["Moradores", "Administradora"], "variables": ["politica_reservas_areas_comuns", "prazo_cancelamento"], "mermaid_diagram": "flowchart TD\n    A[\"Consulta de Disponibilidade<br/>(Moradores)\"] --> B[\"Solicitação de Reserva<br/>(Moradores)\"]\n    B --> C[\"Verificação<br/>(Administradora)\"]\n    C --> D[\"Confirmação<br/>(Administradora)\"]\n    D --> E[\"Uso da Área<br/>(Moradores)\"]\n    E --> F[\"Limpeza<br/>(Moradores)\"]\n    F --> G[\"Encerramento<br/>(Administradora)\"]\n    G --> H{Cancelamento?}\n    H -->|Sim| I[\"Comunicação com Antecedência<br/>(Moradores)\"]\n    H -->|Não| J[\"Concluído<br/>(Administradora)\"]\n    style A fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style B fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#166534,stroke:#22c55e,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Processo unificado para reserva de áreas comuns (escritório, SPA, área de recreação) incluindo sistema de reservas, regras e cancelamentos.',
            '["Moradores", "Administradora"]'::jsonb,
            '{"politica_reservas_areas_comuns": null, "prazo_cancelamento": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 29: Incêndio
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Incêndio';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Incêndio',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações de incêndio ou princípio de incêndio, incluindo evacuação, acionamento de bombeiros e ponto de encontro.", "workflow": ["1. Identificação do incêndio", "2. Acionamento imediato dos bombeiros (193)", "3. Acionamento do alarme de incêndio", "4. Evacuação ordenada do prédio", "5. Direcionamento para ponto de encontro", "6. Verificação de presença de moradores", "7. Aguardar chegada dos bombeiros", "8. Fornecer informações aos bombeiros", "9. Retorno ao prédio apenas após autorização", "10. Registro do incidente e lições aprendidas"], "entities": ["Moradores", "Bombeiros", "Síndico", "Portaria Online"], "variables": ["telefone_bombeiros", "ponto_encontro_incendio"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Incêndio<br/>(Moradores)\"] --> B[\"Acionamento Bombeiros 193<br/>(Moradores/Portaria)\"]\n    B --> C[\"Acionamento do Alarme<br/>(Portaria Online)\"]\n    C --> D[\"Evacuação Ordenada<br/>(Moradores)\"]\n    D --> E[\"Ponto de Encontro<br/>(Síndico)\"]\n    E --> F[\"Verificação de Presença<br/>(Síndico)\"]\n    F --> G[\"Aguardar Bombeiros<br/>(Todos)\"]\n    G --> H[\"Fornecer Informações<br/>(Síndico)\"]\n    H --> I{Autorização?}\n    I -->|Sim| J[\"Retorno ao Prédio<br/>(Bombeiros)\"]\n    I -->|Não| G\n    J --> K[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style C fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações de incêndio ou princípio de incêndio, incluindo evacuação, acionamento de bombeiros e ponto de encontro.',
            '["Moradores", "Bombeiros", "Síndico", "Portaria Online"]'::jsonb,
            '{"telefone_bombeiros": null, "ponto_encontro_incendio": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 30: Vazamento de Gás
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Vazamento de Gás';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Vazamento de Gás',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações de vazamento de gás, incluindo segurança, evacuação e acionamento de serviços especializados.", "workflow": ["1. Identificação do vazamento", "2. Não acionar interruptores ou equipamentos elétricos", "3. Ventilar o ambiente se seguro", "4. Evacuar a área imediatamente", "5. Acionar bombeiros (193) e empresa de gás", "6. Isolar a área", "7. Aguardar chegada dos profissionais", "8. Retorno apenas após liberação", "9. Verificação e reparo", "10. Registro do incidente"], "entities": ["Moradores", "Bombeiros", "Empresa de Gás", "Síndico"], "variables": ["telefone_bombeiros", "empresa_gas"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Vazamento<br/>(Moradores)\"] --> B[\"NÃO Acionar Interruptores<br/>(Moradores)\"]\n    B --> C{Ventilar Seguro?}\n    C -->|Sim| D[\"Ventilar Ambiente<br/>(Moradores)\"]\n    C -->|Não| E[\"Evacuar Imediatamente<br/>(Moradores)\"]\n    D --> E\n    E --> F[\"Acionar Bombeiros 193<br/>(Moradores)\"]\n    F --> G[\"Acionar Empresa de Gás<br/>(Síndico)\"]\n    G --> H[\"Isolar a Área<br/>(Portaria Online)\"]\n    H --> I[\"Aguardar Profissionais<br/>(Todos)\"]\n    I --> J{Liberação?}\n    J -->|Sim| K[\"Retorno<br/>(Bombeiros)\"]\n    J -->|Não| I\n    K --> L[\"Verificação e Reparo<br/>(Empresa de Gás)\"]\n    L --> M[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#dc2626,stroke:#ef4444,color:#fff\n    style H fill:#dc2626,stroke:#ef4444,color:#fff\n    style I fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff\n    style L fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações de vazamento de gás, incluindo segurança, evacuação e acionamento de serviços especializados.',
            '["Moradores", "Bombeiros", "Empresa de Gás", "Síndico"]'::jsonb,
            '{"telefone_bombeiros": null, "empresa_gas": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 31: Falta de Energia
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Falta de Energia';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Falta de Energia',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento para situações de falta de energia elétrica, incluindo verificação, comunicação e acionamento de serviços.", "workflow": ["1. Identificação da falta de energia", "2. Verificação se é problema local ou geral", "3. Comunicação à portaria/síndico", "4. Verificação de disjuntores e sistema elétrico", "5. Acionamento da concessionária se necessário", "6. Comunicação aos moradores", "7. Acompanhamento até resolução", "8. Verificação de funcionamento após retorno", "9. Registro do incidente"], "entities": ["Moradores", "Síndico", "Concessionária de Energia", "Portaria Online"], "variables": ["telefone_concessionaria"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação da Falta<br/>(Moradores)\"] --> B{Problema Local ou Geral?}\n    B -->|Local| C[\"Verificação de Disjuntores<br/>(Moradores)\"]\n    B -->|Geral| D[\"Comunicação à Portaria<br/>(Moradores)\"]\n    C --> E{Resolvido?}\n    E -->|Sim| F[\"Verificação de Funcionamento<br/>(Moradores)\"]\n    E -->|Não| D\n    D --> G[\"Acionamento Concessionária<br/>(Síndico)\"]\n    G --> H[\"Comunicação aos Moradores<br/>(Portaria Online)\"]\n    H --> I[\"Acompanhamento<br/>(Síndico)\"]\n    I --> J[\"Retorno da Energia<br/>(Concessionária)\"]\n    J --> F\n    F --> K[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style C fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style D fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#dc2626,stroke:#ef4444,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento para situações de falta de energia elétrica, incluindo verificação, comunicação e acionamento de serviços.',
            '["Moradores", "Síndico", "Concessionária de Energia", "Portaria Online"]'::jsonb,
            '{"telefone_concessionaria": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 32: Elevador Preso
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Elevador Preso';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Elevador Preso',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações de pessoas presas no elevador, incluindo acionamento de socorro e resgate.", "workflow": ["1. Identificação de pessoas presas no elevador", "2. Acionamento do botão de emergência", "3. Comunicação com portaria/síndico", "4. Acionamento imediato da empresa de manutenção", "5. Tranquilização das pessoas presas", "6. Acompanhamento até resgate", "7. Verificação de condições das pessoas resgatadas", "8. Acionamento de serviços médicos se necessário", "9. Bloqueio do elevador até reparo", "10. Registro do incidente"], "entities": ["Moradores", "Empresa de Manutenção dos Elevadores", "Síndico", "Portaria Online"], "variables": ["empresa_elevador", "telefone_samu"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação de Pessoas Presas<br/>(Moradores)\"] --> B[\"Botão de Emergência<br/>(Pessoas Presas)\"]\n    B --> C[\"Comunicação Portaria/Síndico<br/>(Pessoas Presas)\"]\n    C --> D[\"Acionamento Empresa Manutenção<br/>(Portaria Online)\"]\n    D --> E[\"Tranquilização das Pessoas<br/>(Portaria Online)\"]\n    E --> F[\"Acompanhamento<br/>(Síndico)\"]\n    F --> G[\"Resgate<br/>(Empresa de Manutenção)\"]\n    G --> H{Necessita Atendimento Médico?}\n    H -->|Sim| I[\"Acionamento SAMU<br/>(Síndico)\"]\n    H -->|Não| J[\"Verificação de Condições<br/>(Síndico)\"]\n    I --> J\n    J --> K[\"Bloqueio do Elevador<br/>(Portaria Online)\"]\n    K --> L[\"Reparo<br/>(Empresa de Manutenção)\"]\n    L --> M[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style C fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#166534,stroke:#22c55e,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#dc2626,stroke:#ef4444,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#dc2626,stroke:#ef4444,color:#fff\n    style L fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações de pessoas presas no elevador, incluindo acionamento de socorro e resgate.',
            '["Moradores", "Empresa de Manutenção dos Elevadores", "Síndico", "Portaria Online"]'::jsonb,
            '{"empresa_elevador": null, "telefone_samu": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 33: Ameaça à Segurança
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Ameaça à Segurança';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Ameaça à Segurança',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações de ameaça à segurança (roubo, agressão, invasão), incluindo acionamento de polícia e medidas de segurança.", "workflow": ["1. Identificação da ameaça", "2. Acionamento imediato da polícia (190)", "3. Acionamento da empresa de segurança", "4. Isolamento da área se possível", "5. Proteção de evidências", "6. Comunicação ao síndico", "7. Aguardar chegada da polícia", "8. Fornecer informações e evidências", "9. Acompanhamento do caso", "10. Reforço de medidas de segurança se necessário", "11. Registro detalhado do incidente"], "entities": ["Moradores", "Polícia", "Empresa de Segurança", "Síndico", "Portaria Online"], "variables": ["telefone_policia", "empresa_seguranca_rua"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação da Ameaça<br/>(Moradores)\"] --> B[\"Acionamento Polícia 190<br/>(Moradores/Portaria)\"]\n    B --> C[\"Acionamento Segurança<br/>(Portaria Online)\"]\n    C --> D{Isolar Área Possível?}\n    D -->|Sim| E[\"Isolamento<br/>(Portaria Online)\"]\n    D -->|Não| F[\"Proteção de Evidências<br/>(Portaria Online)\"]\n    E --> F\n    F --> G[\"Comunicação ao Síndico<br/>(Portaria Online)\"]\n    G --> H[\"Aguardar Polícia<br/>(Todos)\"]\n    H --> I[\"Fornecer Informações<br/>(Síndico)\"]\n    I --> J[\"Acompanhamento do Caso<br/>(Síndico)\"]\n    J --> K{Reforço Necessário?}\n    K -->|Sim| L[\"Reforço de Segurança<br/>(Empresa de Segurança)\"]\n    K -->|Não| M[\"Registro Detalhado<br/>(Portaria Online)\"]\n    L --> M\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style C fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#dc2626,stroke:#ef4444,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff\n    style L fill:#dc2626,stroke:#ef4444,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações de ameaça à segurança (roubo, agressão, invasão), incluindo acionamento de polícia e medidas de segurança.',
            '["Moradores", "Polícia", "Empresa de Segurança", "Síndico", "Portaria Online"]'::jsonb,
            '{"telefone_policia": null, "empresa_seguranca_rua": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 34: Emergências Médicas
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Emergências Médicas';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Emergências Médicas',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações médicas urgentes, incluindo acionamento de SAMU, primeiros socorros e apoio.", "workflow": ["1. Identificação da emergência médica", "2. Acionamento imediato do SAMU (192)", "3. Prestação de primeiros socorros se capacitado", "4. Comunicação à portaria/síndico", "5. Preparação do acesso para ambulância", "6. Acompanhamento até chegada do SAMU", "7. Fornecimento de informações aos paramédicos", "8. Apoio e acompanhamento conforme necessário", "9. Registro do incidente"], "entities": ["Moradores", "SAMU", "Síndico", "Portaria Online"], "variables": ["telefone_samu", "ponto_encontro_ambulancia"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação da Emergência<br/>(Moradores)\"] --> B[\"Acionamento SAMU 192<br/>(Moradores)\"]\n    B --> C{Capacitado para Primeiros Socorros?}\n    C -->|Sim| D[\"Prestação de Primeiros Socorros<br/>(Moradores)\"]\n    C -->|Não| E[\"Comunicação Portaria/Síndico<br/>(Moradores)\"]\n    D --> E\n    E --> F[\"Preparação do Acesso<br/>(Portaria Online)\"]\n    F --> G[\"Aguardar SAMU<br/>(Todos)\"]\n    G --> H[\"Fornecimento de Informações<br/>(Síndico)\"]\n    H --> I[\"Apoio e Acompanhamento<br/>(Síndico)\"]\n    I --> J[\"Registro do Incidente<br/>(Portaria Online)\"]\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style H fill:#166534,stroke:#22c55e,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style J fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações médicas urgentes, incluindo acionamento de SAMU, primeiros socorros e apoio.',
            '["Moradores", "SAMU", "Síndico", "Portaria Online"]'::jsonb,
            '{"telefone_samu": null, "ponto_encontro_ambulancia": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;


-- Processo 35: Alagamentos
DO $$
DECLARE
    v_creator_id UUID;
    v_process_id UUID;
    v_version_id UUID;
BEGIN
    -- Obter creator_id
    SELECT id INTO v_creator_id FROM seed_creator_id LIMIT 1;
    
    -- Verificar se já existe
    SELECT id INTO v_process_id 
    FROM public.processes 
    WHERE name = 'Alagamentos';
    
    IF v_process_id IS NULL THEN
        -- Criar processo
        INSERT INTO public.processes (
            name, category, subcategory, document_type,
            status, creator_id
        ) VALUES (
            'Alagamentos',
            'emergencias'::processcategory,
            NULL,
            'manual'::documenttype,
            'em_revisao'::processstatus,
            v_creator_id
        ) RETURNING id INTO v_process_id;
        
        -- Criar versão inicial
        INSERT INTO public.process_versions (
            process_id, version_number, content, content_text,
            entities_involved, variables_applied, created_by, status
        ) VALUES (
            v_process_id,
            1,
            '{"description": "Procedimento de emergência para situações de alagamento, incluindo proteção de equipamentos, drenagem e acionamento de serviços.", "workflow": ["1. Identificação do alagamento", "2. Proteção de equipamentos elétricos", "3. Isolamento da área se possível", "4. Acionamento de serviços de drenagem se necessário", "5. Comunicação ao síndico/administradora", "6. Documentação fotográfica do dano", "7. Limpeza e secagem", "8. Verificação de danos estruturais", "9. Reparos necessários", "10. Registro do incidente e medidas preventivas"], "entities": ["Moradores", "Síndico", "Administradora", "Empresa de Manutenção"], "variables": ["telefone_emergencia"], "mermaid_diagram": "flowchart TD\n    A[\"Identificação do Alagamento<br/>(Moradores)\"] --> B[\"Proteção de Equipamentos Elétricos<br/>(Moradores)\"]\n    B --> C{Isolar Área Possível?}\n    C -->|Sim| D[\"Isolamento<br/>(Moradores)\"]\n    C -->|Não| E[\"Acionamento Drenagem<br/>(Síndico)\"]\n    D --> E\n    E --> F[\"Comunicação Síndico/Administradora<br/>(Moradores)\"]\n    F --> G[\"Documentação Fotográfica<br/>(Síndico)\"]\n    G --> H[\"Limpeza e Secagem<br/>(Empresa de Manutenção)\"]\n    H --> I[\"Verificação de Danos<br/>(Síndico)\"]\n    I --> J{Danos Estruturais?}\n    J -->|Sim| K[\"Reparos<br/>(Empresa de Manutenção)\"]\n    J -->|Não| L[\"Registro do Incidente<br/>(Administradora)\"]\n    K --> M[\"Medidas Preventivas<br/>(Síndico)\"]\n    M --> L\n    style A fill:#dc2626,stroke:#ef4444,color:#fff\n    style B fill:#dc2626,stroke:#ef4444,color:#fff\n    style D fill:#dc2626,stroke:#ef4444,color:#fff\n    style E fill:#dc2626,stroke:#ef4444,color:#fff\n    style F fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style G fill:#166534,stroke:#22c55e,color:#fff\n    style H fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style I fill:#166534,stroke:#22c55e,color:#fff\n    style K fill:#1e3a8a,stroke:#3b82f6,color:#fff\n    style L fill:#166534,stroke:#22c55e,color:#fff\n    style M fill:#166534,stroke:#22c55e,color:#fff"}'::jsonb,
            'Procedimento de emergência para situações de alagamento, incluindo proteção de equipamentos, drenagem e acionamento de serviços.',
            '["Moradores", "Síndico", "Administradora", "Empresa de Manutenção"]'::jsonb,
            '{"telefone_emergencia": null}'::jsonb,
            v_creator_id,
            'em_revisao'::processstatus
        ) RETURNING id INTO v_version_id;
    END IF;
END $$;
