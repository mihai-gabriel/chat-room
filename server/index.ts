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

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", optionsSuccessStatus: 200 }));

const wss = new WebSocket.Server({
  server: app.listen(port),
  host: "localhost",
  path: "/",
});

// Note: `ws` is the socket to the current client.
wss.on("connection", async function connection(ws) {
  ws.on("error", console.error);

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

app.listen(() => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
