import WebSocket from "ws";
import {
  ChatMessage,
  FullChatMessage,
  WsClientMessage,
  WsMessageType,
  WsServerMessage,
} from "../types";
import { messageService, userService } from "../db";

type WebSocketServerClients = Set<WebSocket.WebSocket>;

export const broadcastChatMessage = async (
  broadcaster: WebSocket.WebSocket,
  clients: WebSocketServerClients
) => {
  return async (rawSocketData: WebSocket.RawData) => {
    if (!broadcaster.readyState) return;

    // if somebody sends to server a chat message, we need to cast it the Web socket message to chat message;
    const rawMessageData = JSON.parse(rawSocketData.toString());

    if (typeof rawMessageData.data === "string") {
      return;
    }

    if (rawMessageData.data === "initial") {
      return;
    }

    const messageData = rawMessageData as WsClientMessage<ChatMessage>;

    // save message to DB
    const fullMessageDataDB = await messageService.addMessage(
      messageData.data,
      messageData.userId
    );

    console.log("received message:", fullMessageDataDB);

    // get the username from the message author Id to send it back as a full message
    const user = await userService.getUserProfileById(
      fullMessageDataDB.authorId
    );

    const fullMessageData: FullChatMessage = {
      ...fullMessageDataDB,
      authorName: user?.username || "",
    };

    // We send for each client, even the sender
    // Note: We send the message back to the sender,
    //       so I won't handle updating the sent message in the frontend separately.
    //       It will automatically pick it up and update it.
    clients.forEach(function each(client) {
      if (!client.readyState) return;

      const sentMessageData: WsServerMessage<ChatMessage> = {
        type: WsMessageType.CHAT_MESSAGE,
        data: fullMessageData,
      };

      client.send(JSON.stringify(sentMessageData));
    });
  };
};
