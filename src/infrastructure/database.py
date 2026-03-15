from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# URL do banco de dados na raiz do projeto
SQLALCHEMY_DATABASE_URL = "sqlite:///estoque.db"

# Engine central do SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

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
