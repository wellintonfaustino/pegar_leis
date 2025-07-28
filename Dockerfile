FROM node:20

# Define diretório de trabalho
WORKDIR /app

# Instala dependências do sistema necessárias para rodar o Chromium
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
  libgbm1 \
  libxshmfence1 \
  libglu1-mesa \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Copia os arquivos
COPY package*.json ./
RUN npm install
COPY . .

# Expor porta da aplicação
EXPOSE 3000

CMD ["node", "index.js"]
