FROM node:20-alpine

WORKDIR /restaurant/backend/kitchen-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]