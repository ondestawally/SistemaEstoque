import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Busca a string de conexão do Supabase, com fallback para SQLite local em caso de erro/ausência
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///estoque.db")

# Criação condicional do Engine (SQLite precisa de connect_args extras para threads)
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Postgres (Supabase)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Fábrica de Sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe Base de onde todos os modelos ORM herdarão
Base = declarative_base()

# Dependência simples para obter a sessão e fechar ao final
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
