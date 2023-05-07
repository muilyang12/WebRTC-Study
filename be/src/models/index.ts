const { Sequelize } = require("sequelize");

const db: any = {};

const isDev = process.env.NODE_ENV !== "production";
const sequelize = new Sequelize(
  `mysql://${process.env.DB_ID}:${process.env.DB_PW}@localhost:3306/${process.env.DB_NAME}`
);

db.sequelize = sequelize;

const Room = require("./room");
Room.initiate(sequelize);
Room.associate(db);

db.Room = Room;

module.exports = db;
