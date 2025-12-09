-- Migration: Seed de Entidades Comuns de Condomínio
-- Descrição: Insere entidades padrão que são comuns em qualquer condomínio

-- PESSOAS
INSERT INTO entities (name, type, category, description, is_active) VALUES
  ('Síndico', 'pessoa', 'sindico', 'Responsável pela administração do condomínio', true),
  ('Subsíndico', 'pessoa', 'sindico', 'Auxiliar do síndico na administração', true),
  ('Conselheiro', 'pessoa', 'conselheiro', 'Membro do conselho consultivo do condomínio', true),
  ('Moradores', 'pessoa', 'morador', 'Residentes do condomínio', true),
  ('Faxineiro', 'pessoa', 'faxineiro', 'Responsável pela limpeza das áreas comuns', true)
ON CONFLICT DO NOTHING;

-- EMPRESAS
INSERT INTO entities (name, type, category, description, is_active) VALUES
  ('Administradora', 'empresa', 'administradora', 'Empresa responsável pela administração condominial', true),
  ('Portaria Online', 'empresa', 'portaria_online', 'Sistema de portaria remota e controle de acesso', true),
  ('Empresa de Segurança', 'empresa', 'seguranca', 'Empresa responsável pela segurança do condomínio', true),
  ('Manutenção de Elevadores', 'empresa', 'manutencao_elevador', 'Empresa especializada em manutenção de elevadores', true),
  ('Jardinagem', 'empresa', 'jardinagem', 'Empresa responsável pela manutenção dos jardins e áreas verdes', true),
  ('Dedetização', 'empresa', 'dedetizacao', 'Empresa especializada em controle de pragas', true),
  ('Manutenção Geral', 'empresa', 'manutencao', 'Empresa de manutenção predial e elétrica', true),
  ('Fornecedor de Gás', 'empresa', 'gas', 'Empresa fornecedora de gás encanado', true),
  ('Concessionária de Energia', 'empresa', 'energia', 'Concessionária de energia elétrica', true),
  ('Outros Fornecedores', 'empresa', 'outro_fornecedor', 'Outros fornecedores e prestadores de serviço', true)
ON CONFLICT DO NOTHING;

-- SERVIÇOS DE EMERGÊNCIA
INSERT INTO entities (name, type, category, phone, emergency_phone, description, is_active) VALUES
  ('Bombeiros', 'servico_emergencia', 'bombeiros', '193', '193', 'Corpo de Bombeiros - Emergências', true),
  ('Polícia Militar', 'servico_emergencia', 'policia', '190', '190', 'Polícia Militar - Emergências', true),
  ('SAMU', 'servico_emergencia', 'samu', '192', '192', 'Serviço de Atendimento Móvel de Urgência', true)
ON CONFLICT DO NOTHING;

-- INFRAESTRUTURA
INSERT INTO entities (name, type, category, description, is_active) VALUES
  ('Portão Principal', 'infraestrutura', 'portao', 'Sistema de portão automático principal', true),
  ('Elevador', 'infraestrutura', 'elevador', 'Sistema de elevadores do condomínio', true),
  ('Sistema de Biometria', 'infraestrutura', 'sistema_biometria', 'Sistema de controle de acesso por biometria', true),
  ('Sistema de Câmeras', 'infraestrutura', 'sistema_cameras', 'Sistema de monitoramento por câmeras de segurança', true)
ON CONFLICT DO NOTHING;

-- Comentário sobre a migration
COMMENT ON TABLE entities IS 'Tabela de entidades envolvidas nos processos do condomínio. Inclui pessoas, empresas, serviços de emergência e infraestrutura.';

