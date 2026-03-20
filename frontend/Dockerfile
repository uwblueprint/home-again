FROM node:22-bullseye

WORKDIR /app

COPY package.json package-lock.json ./
RUN rm -rf node_modules && npm install

COPY . ./

EXPOSE 3000
# Turbopack + hostname for Docker; use CHOKIDAR_USEPOLLING + WATCHPACK_POLLING for file watching
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
