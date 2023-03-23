import type { RawData, WebSocket } from "ws";
import { RequestPayload, WsMessage, WsMessageType } from "../../types";
import { sendChatHistory } from "./sendChatHistory";
import { broadcastChatMessage } from "./broadcastChatMessage";
import { validateRequest } from "./validateRequest";
import { editChatMessage } from "./editChatMessage";

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

const handleMessage = async (
  rawSocketData: RawData,
  client: WebSocket,
  clients: Set<WebSocket>
) => {
  const messageData: WsMessage<RequestPayload> = JSON.parse(
    rawSocketData.toString()
  );

  const validation = await validateRequest(messageData.payload);

  if (validation.type === WsMessageType.SERVER_ERROR) {
    client.send(JSON.stringify(validation));
    return;
  }

  switch (messageData.type) {
    case WsMessageType.CHAT_HISTORY:
      await sendChatHistory(client, messageData.payload);
      break;
    case WsMessageType.CHAT_MESSAGE:
      await broadcastChatMessage(client, clients, messageData.payload);
      break;
    case WsMessageType.CHAT_MESSAGE_UPDATE:
      await editChatMessage(client, clients, messageData.payload);
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
