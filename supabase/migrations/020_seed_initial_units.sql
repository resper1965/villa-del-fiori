-- Migration: Seed de Unidades Iniciais
-- Descrição: Cria unidades iniciais do condomínio Villa Dei Fiori
-- Nota: Ajuste os números de unidades conforme necessário para seu condomínio

-- Exemplo: Condomínio com 14 unidades (2 blocos, 7 andares cada, 1 unidade por andar)
-- Ajuste conforme a estrutura real do seu condomínio

-- Bloco A - Andares 1 a 7
INSERT INTO units (number, block, floor, is_active) VALUES
  ('101', 'A', 1, true),
  ('201', 'A', 2, true),
  ('301', 'A', 3, true),
  ('401', 'A', 4, true),
  ('501', 'A', 5, true),
  ('601', 'A', 6, true),
  ('701', 'A', 7, true)
ON CONFLICT (number) DO NOTHING;

-- Bloco B - Andares 1 a 7
INSERT INTO units (number, block, floor, is_active) VALUES
  ('102', 'B', 1, true),
  ('202', 'B', 2, true),
  ('302', 'B', 3, true),
  ('402', 'B', 4, true),
  ('502', 'B', 5, true),
  ('602', 'B', 6, true),
  ('702', 'B', 7, true)
ON CONFLICT (number) DO NOTHING;

-- Comentário: Ajuste os valores acima conforme a estrutura real do seu condomínio
-- Você pode adicionar mais unidades, modificar blocos, andares, áreas, vagas, etc.

