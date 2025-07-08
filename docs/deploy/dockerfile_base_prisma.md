## Dockerfile base (para proyectos que usen Prisma)

```Dockerfile
# Etapa 1: Instalar dependencias
FROM node:24.3-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --frozen-lockfile
RUN npx prisma generate

# Etapa 2: Construcción
FROM node:24.3-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build

# Etapa 3: Producción
FROM node:24.3-alpine AS runner
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app

# Copiar archivos necesarios
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/prisma ./prisma

# Copiar script de arranque
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
```