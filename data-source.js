const path = require("path");
const { DataSource } = require("typeorm");
require("dotenv").config();

module.exports = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "subscribe",
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, "./src/entities/*.js")],
  migrations: [path.join(__dirname, "./src/migrations/*.js")],
  migrationsTableName: "migrations",
});
