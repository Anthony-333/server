import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import AuthRoute from "./Routes/AuthRoute.ts";
import UsersRoute from "./Routes/UsersRoute.ts";
import cookieparser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

//For env File
dotenv.config();
const MONGO_DB = process.env.MONGO_DB;
const PORT = process.env.PORT || 5000;

//Middleware
const app: Application = express();

app.use(express.json());

app.use(bodyParser.json({ limit: "30mb" }));

app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://theforumgroup.org",
      "https://theforumgroup.org",
      "http://www.theforumgroup.org",
      "https://www.theforumgroup.org",
    ],
    credentials: true,
  })
);

app.use(cookieparser());

app.get("/", (req: Request, res: Response) => {
  res.send("The Forum server")
})

//Route usage
app.use("/auth", AuthRoute);
app.use("/users", UsersRoute);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ENDPOINT,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // listens when there's new registered users
  socket.on("signup_success", () => {
    socket.broadcast.emit("new_user_signup");
  });
});

//initialize mongodbConnection
mongoose
  .connect(MONGO_DB)
  .then(() =>
    server.listen(PORT, () => console.log(`listening to Port: ${PORT}`))
  )
  .catch((error) => console.log(error));
