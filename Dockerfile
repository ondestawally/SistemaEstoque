# Usa a imagem base super leve do Python 3.11
FROM python:3.11-slim

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia os arquivos de dependência
COPY requirements.txt .

# Instala as dependências (sem cache para reduzir o tamanho da imagem)
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código-fonte (exceto os do .dockerignore)
COPY . .

# A porta que o Render vai bater
EXPOSE 8000

# Adiciona /app/src no PYTHONPATH para que os imports absolutos (src.domain...) funcionem
ENV PYTHONPATH=/app/src

# Comando para rodar a aplicação em produção via uvicorn (Worker único para Render grátis)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
