import WebSocket from "ws";
import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import "./db/conn"; // Init Database

import authenticationRouter from "./modules/auth";
import { handleChatConnection } from "./modules/chat";

const app: Express = express();
const port = process.env.PORT;
const origin_base_url = process.env.ORIGIN_BASE_URL;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: origin_base_url, optionsSuccessStatus: 200 }));
app.use(cookieParser());

const chatWss = new WebSocket.Server({
  server: app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  }),
  host: "localhost",
  path: "/chat",
});

// Note: `ws` is the socket to the current client.
chatWss.on("connection", (client) =>
  handleChatConnection(client, chatWss.clients)
);

app.get("/", (req: Request, res: Response) => {
  res.send(`Web socket connections count: ${chatWss.clients.size}`);
});

app.use("/auth", authenticationRouter);
