FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.js ./
ENV NODE_ENV=production
# Optional: CLEARCRAWL_API_KEY (free tier without it), CLEARCRAWL_URL
ENTRYPOINT ["node", "index.js"]
