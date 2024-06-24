# RestaurantSystemManagement

docker-compose up -d

npx sequelize-cli db:migrate

npx sequelize-cli db:migrate:undo:all

npx sequelize-cli db:seed:all

npx sequelize-cli db:seed:undo:all

catalog service:
`` PORT=5000
`` DB_PORT=3307

notification service:
`` PORT=5001

order service:
`` PORT=5002
`` DB_PORT=3308

payment service:
`` PORT=5003
`` DB_PORT=3309

table service:
`` PORT=5004
`` DB_PORT=3310

user service:
`` PORT=5005
`` DB_PORT=3311

kitchen service:
`` PORT=5006