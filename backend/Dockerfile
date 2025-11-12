# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copia manifestos primeiro (melhor cache)
COPY package*.json ./

# Instala dependências incluindo dev (para gerar Prisma)
RUN npm install --include=dev

# Copia o restante
COPY . .

# Gera cliente Prisma
RUN npx prisma generate

# Produção: remove devDependencies
ENV NODE_ENV=production
RUN npm prune --omit=dev

EXPOSE 3001
CMD ["node", "server.js"]
