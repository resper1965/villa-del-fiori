-- Migration: Adicionar extensão pgvector
-- Descrição: Habilita extensão pgvector para busca vetorial (embeddings)
-- Data: 2025-01-09

-- Verificar se a extensão já existe antes de criar
CREATE EXTENSION IF NOT EXISTS vector;

-- Comentário na extensão
COMMENT ON EXTENSION vector IS 'Extensão para busca vetorial usando embeddings (usado para base de conhecimento e RAG)';





