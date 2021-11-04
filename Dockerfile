FROM node:12-alpine
RUN mkdir -p /app/node_modules
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]
