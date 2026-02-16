FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

EXPOSE 3000
# Turbopack + hostname for Docker; use CHOKIDAR_USEPOLLING + WATCHPACK_POLLING for file watching
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
