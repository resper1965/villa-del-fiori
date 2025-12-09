from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator
import os

from app.core.config import settings

# Para Neon, usar connection pooling otimizado
# Neon recomenda usar a connection string com pooling para aplicação
# e sem pooling para migrations (Alembic)
database_url = settings.DATABASE_URL

# Se estiver na Vercel e houver POSTGRES_URL (com pooling), usar ela
# Caso contrário, usar DATABASE_URL
if os.environ.get("VERCEL") and os.environ.get("POSTGRES_URL"):
    database_url = os.environ.get("POSTGRES_URL")
elif os.environ.get("POSTGRES_URL"):
    database_url = os.environ.get("POSTGRES_URL")

# Configuração otimizada para Neon/Postgres serverless
# pool_pre_ping: verifica conexões antes de usar (importante para serverless)
# pool_size: menor para serverless (Neon gerencia pooling)
# max_overflow: menor para evitar muitas conexões
engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=5,  # Reduzido para serverless
    max_overflow=10,  # Reduzido para serverless
    connect_args={
        "sslmode": "require",  # Neon requer SSL
    },
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


