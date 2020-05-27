FROM node:12-alpine
RUN mkdir -p /home/node/app/node_modules
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]
