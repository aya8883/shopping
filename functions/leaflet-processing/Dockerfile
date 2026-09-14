FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY src ./src
ENV NODE_ENV=production
EXPOSE 3010
CMD ["npm", "start"]
