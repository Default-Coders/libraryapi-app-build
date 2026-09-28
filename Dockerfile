FROM node:24-alpine AS compilacao
WORKDIR /aplicacao
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-alpine
WORKDIR /aplicacao
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=compilacao /aplicacao/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main.js"]
