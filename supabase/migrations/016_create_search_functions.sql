-- Migration: Criar funções de busca vetorial
-- Descrição: Funções para busca semântica na base de conhecimento usando embeddings
-- Data: 2025-01-09

-- Função para busca vetorial por similaridade de cosseno
-- Retorna documentos mais similares ao embedding fornecido
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  process_id UUID,
  process_version_id UUID,
  chunk_index INTEGER,
  chunk_type VARCHAR(50),
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  process_name TEXT,
  process_category TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.process_id,
    kb.process_version_id,
    kb.chunk_index,
    kb.chunk_type,
    kb.content,
    kb.metadata,
    -- Similaridade de cosseno (1 - distância = similaridade)
    1 - (kb.embedding <=> query_embedding) AS similarity,
    p.name AS process_name,
    p.category::TEXT AS process_category
  FROM knowledge_base_documents kb
  INNER JOIN processes p ON p.id = kb.process_id
  WHERE 
    -- Verificar se o embedding não é nulo
    kb.embedding IS NOT NULL
    -- Filtrar por similaridade mínima
    AND (1 - (kb.embedding <=> query_embedding)) >= match_threshold
    -- Filtrar por metadata se fornecido
    AND (filter_metadata = '{}'::jsonb OR kb.metadata @> filter_metadata)
    -- Apenas processos aprovados
    AND p.status = 'aprovado'
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Função para busca híbrida (vetorial + full-text)
CREATE OR REPLACE FUNCTION search_knowledge_base_hybrid(
  query_embedding vector(1536),
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_metadata JSONB DEFAULT '{}'::jsonb,
  vector_weight FLOAT DEFAULT 0.7,
  text_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  process_id UUID,
  process_version_id UUID,
  chunk_index INTEGER,
  chunk_type VARCHAR(50),
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  text_rank FLOAT,
  combined_score FLOAT,
  process_name TEXT,
  process_category TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.process_id,
    kb.process_version_id,
    kb.chunk_index,
    kb.chunk_type,
    kb.content,
    kb.metadata,
    -- Similaridade vetorial
    (1 - (kb.embedding <=> query_embedding)) AS similarity,
    -- Rank de busca full-text
    ts_rank(to_tsvector('portuguese', kb.content), plainto_tsquery('portuguese', query_text)) AS text_rank,
    -- Score combinado
    (
      (1 - (kb.embedding <=> query_embedding)) * vector_weight +
      ts_rank(to_tsvector('portuguese', kb.content), plainto_tsquery('portuguese', query_text)) * text_weight
    ) AS combined_score,
    p.name AS process_name,
    p.category::TEXT AS process_category
  FROM knowledge_base_documents kb
  INNER JOIN processes p ON p.id = kb.process_id
  WHERE 
    kb.embedding IS NOT NULL
    AND (
      -- Similaridade vetorial acima do threshold
      (1 - (kb.embedding <=> query_embedding)) >= match_threshold
      OR
      -- OU match de texto relevante
      to_tsvector('portuguese', kb.content) @@ plainto_tsquery('portuguese', query_text)
    )
    AND (filter_metadata = '{}'::jsonb OR kb.metadata @> filter_metadata)
    AND p.status = 'aprovado'
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- Função para buscar processos relacionados (baseado em similaridade)
CREATE OR REPLACE FUNCTION find_related_processes(
  process_id_param UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  process_id UUID,
  process_name TEXT,
  process_category TEXT,
  similarity FLOAT,
  common_chunks INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH process_embeddings AS (
    SELECT embedding, chunk_type
    FROM knowledge_base_documents
    WHERE process_id = process_id_param
      AND embedding IS NOT NULL
  ),
  related_scores AS (
    SELECT
      kb.process_id,
      AVG(1 - (kb.embedding <=> pe.embedding)) AS avg_similarity,
      COUNT(*) AS common_chunks
    FROM knowledge_base_documents kb
    CROSS JOIN process_embeddings pe
    WHERE kb.process_id != process_id_param
      AND kb.embedding IS NOT NULL
      AND kb.chunk_type = pe.chunk_type
    GROUP BY kb.process_id
    HAVING AVG(1 - (kb.embedding <=> pe.embedding)) > 0.7
  )
  SELECT
    rs.process_id,
    p.name AS process_name,
    p.category::TEXT AS process_category,
    rs.avg_similarity AS similarity,
    rs.common_chunks
  FROM related_scores rs
  INNER JOIN processes p ON p.id = rs.process_id
  WHERE p.status = 'aprovado'
  ORDER BY rs.avg_similarity DESC, rs.common_chunks DESC
  LIMIT match_count;
END;
$$;

-- Comentários
COMMENT ON FUNCTION search_knowledge_base IS 'Busca vetorial por similaridade de cosseno na base de conhecimento';
COMMENT ON FUNCTION search_knowledge_base_hybrid IS 'Busca híbrida combinando busca vetorial e full-text search';
COMMENT ON FUNCTION find_related_processes IS 'Encontra processos relacionados baseado em similaridade de embeddings';





