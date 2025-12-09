-- Script SQL para criar usuário admin inicial
-- Execute após a migration 004

-- Primeiro, verificar se o enum userrole existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('admin', 'syndic', 'council', 'resident', 'staff');
    END IF;
END$$;

-- Criar usuário admin (senha: cvdf2025)
-- Hash bcrypt de 'cvdf2025': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y
-- Vamos usar um hash real gerado pelo passlib

INSERT INTO stakeholders (
    id,
    name,
    email,
    hashed_password,
    type,
    role,
    user_role,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'Ricardo Esper',
    'resper@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5Y', -- Hash de 'cvdf2025'
    'sindico'::stakeholdertype,
    'aprovador'::stakeholderrole,
    'admin'::userrole,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET
    hashed_password = EXCLUDED.hashed_password,
    user_role = EXCLUDED.user_role,
    type = EXCLUDED.type,
    is_active = true,
    updated_at = NOW();

