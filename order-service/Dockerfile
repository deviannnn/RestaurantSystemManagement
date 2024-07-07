FROM node:20-alpine

WORKDIR /restaurant/backend/order-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]