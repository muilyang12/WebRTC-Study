import { Request, Response } from "express";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const morgan = require("morgan");

const roomRoute = require("./src/routes/roomRoute");

const isDev = process.env.NODE_ENV !== "production";

// const { sequelize } = require("./src/models/index");
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("DB Connected. :)");
//   })
//   .catch((err) => {
//     console.error(`DB Connection failed. :( - ${err}`);
//   });

const connectSocket = require("./src/routes/connectSocket");

const app = express();
const port = 8888;

const server = http.createServer(app);

connectSocket(server);

const corsOptions = {
  origin: isDev ? "http://localhost:3333" : "",
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

if (!isDev) {
  app.use(morgan("combined"));

  console.log("Production server is running.");
} else {
  app.use(morgan("dev"));

  console.log("Dev server is running.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", roomRoute);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hi, Moore!" });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
