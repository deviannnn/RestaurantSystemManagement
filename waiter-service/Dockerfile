FROM node:20-alpine

WORKDIR /restaurant/backend/waiter-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]