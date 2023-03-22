import type { RawData, WebSocket } from "ws";
import { Payload, WsMessage, WsMessageType } from "../../types";
import { sendChatHistory } from "./sendChatHistory";

export const handleChatConnection = (
  client: WebSocket,
  clients: Set<WebSocket>
) => {
  if (!client.readyState) return;

  console.log("handleChatConnection() fired");

  // Mark user as 'online'
  // userService.loginUserFromChat(messageData.userId);

  client.on("error", handleError);
  client.on("close", handleClose);
  client.on("message", (message) => handleMessage(message, client, clients));
};

const handleMessage = (
  rawSocketData: RawData,
  client: WebSocket,
  clients: Set<WebSocket>
) => {
  const messageData: WsMessage<Payload> = JSON.parse(rawSocketData.toString());

  switch (messageData.type) {
    case WsMessageType.CHAT_HISTORY:
      sendChatHistory(client, messageData.payload);
      break;
  }
};

const handleError = (error: Error) => {
  console.error(error);
};

const handleClose = (code: number, reason: Buffer) => {
  // If we receive the "mark user as offline" code (3001)
  // We delete the user from the "loggedInUsers"
  if (code === 3001) {
    const userId = Number(reason.toString());

    // mark user as 'offline'
    // userService.logoutUserFromChat(userId);
  }
};

/*
* async function connection(ws) {
  ws.on("error", console.error);

  // TODO: Add a router based on ws message type

  // handle Initial connection
  ws.on("message", await handleInitialConnection(ws, chatWss.clients));

  // handle broadcasting messages
  ws.on("message", await broadcastChatMessage(ws, chatWss.clients));

  ws.on("close", await handleCloseConnection);
}*/
