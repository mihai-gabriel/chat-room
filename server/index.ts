import express, { Express, Request, Response } from "express";
import WebSocket from "ws";
import dotenv from "dotenv";
import { handleInitialConnection, broadcastChatMessage } from "./chat";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

const wss = new WebSocket.Server({
  server: app.listen(port),
  host: "localhost",
  path: "/",
});

wss.on("connection", async function connection(ws) {
  ws.on("error", console.error);

  // handle Initial connection
  ws.on("message", await handleInitialConnection(ws));

  // handle broadcasting messages
  ws.on("message", await broadcastChatMessage(ws, wss.clients));
});

app.get("/", (req: Request, res: Response) => {
  res.send(`Web socket connections count: ${wss.clients.size}`);
});

app.listen(() => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
