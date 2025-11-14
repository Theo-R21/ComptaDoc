FROM node:20-slim

WORKDIR /app

ENV WATCHPACK_POLL=true

# Installer lightningcss pour Linux AVANT que node_modules ne soit monté par Docker
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
RUN npm rebuild lightningcss --platform=linux --arch=x64 || true

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
