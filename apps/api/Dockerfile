FROM node:18-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN ./node_modules/.bin/prisma generate

COPY . .
RUN ./node_modules/.bin/nest build

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
