import express, { Express, Request, Response } from "express";
import cors from "cors";
import WebSocket from "ws";
import dotenv from "dotenv";
import {
  handleInitialConnection,
  broadcastChatMessage,
  handleCloseConnection,
} from "./chat";
import { userService } from "./db";
import { UserDB } from "./types";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const origin_base_url = process.env.ORIGIN_BASE_URL;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: origin_base_url, optionsSuccessStatus: 200 }));

const wss = new WebSocket.Server({
  server: app.listen(port),
  host: "localhost",
  path: "/chat",
});

// Note: `ws` is the socket to the current client.
wss.on("connection", async function connection(ws) {
  ws.on("error", console.error);

  // TODO: Add a router based on ws message type

  // handle Initial connection
  ws.on("message", await handleInitialConnection(ws, wss.clients));

  // handle broadcasting messages
  ws.on("message", await broadcastChatMessage(ws, wss.clients));

  ws.on("close", await handleCloseConnection);
});

app.get("/", (req: Request, res: Response) => {
  res.send(`Web socket connections count: ${wss.clients.size}`);
});

// TODO: REFACTOR: This is as simple as I could make it
app.post("/login", async (req: Request, res: Response) => {
  const userCredentials = req.body;

  console.log("user credentials:", userCredentials);

  const user = userService.getUserByCredentials(
    userCredentials.username,
    userCredentials.password
  );

  console.log("user info", user);

  if (user) {
    res.status(200).send(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        message: "OK",
      })
    );
  } else {
    res.status(403).send({ message: "Auth failed" });
  }
});

app.post("/register", async (req: Request, res: Response) => {
  const userAccountInfo: UserDB = {
    username: req.body.username,
    password: req.body.password,
  };

  const userCreated = await userService.addUser(userAccountInfo);

  if (!userCreated) {
    res.status(400).send({ message: "Error creating the account" });
  }

  res.status(201).send({ message: "OK", user: userCreated });
});

app.listen(() => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
