# Usa imagem oficial do Node.js
FROM node:20

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto
COPY package*.json ./
COPY index.js ./

# Instala dependências
RUN npm install

# Garante que o Chromium funcione com Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Expõe a porta do servidor
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "index.js" ]
