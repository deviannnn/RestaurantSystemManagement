FROM node:20-alpine

WORKDIR /restaurant/backend/user-service

COPY package*.json ./

RUN npm install
RUN apk add --no-cache curl

COPY . .

EXPOSE 5000

CMD ["npm", "start"]