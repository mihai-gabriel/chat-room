import WebSocket from "ws";
import { ChatMessage, MessageType, WsMessage } from "../types";
import { addMessage } from "../db";

type WebSocketServerClients = Set<WebSocket.WebSocket>;

export const broadcastChatMessage = async (
  broadcaster: WebSocket.WebSocket,
  clients: WebSocketServerClients
) => {
  return async (data: WebSocket.RawData) => {
    if (!broadcaster.readyState) return;

    // if somebody sends to server a chat message, we need to cast it the Web socket message to chat message;
    const receivedMessageData = JSON.parse(
      data.toString()
    ) as WsMessage<ChatMessage>;

    if (receivedMessageData.type !== MessageType.CHAT_MESSAGE) {
      return;
    }

    // save message to DB
    await addMessage(receivedMessageData.data);

    // We send for each client, even the sender
    // Note: We send the message back to the sender,
    //       so I won't handle updating the sent message in the frontend separately.
    //       It will automatically pick it up and update it.
    clients.forEach(function each(client) {
      if (!client.readyState) return;

      const sentMessageData: WsMessage<ChatMessage> = {
        type: MessageType.CHAT_MESSAGE,
        data: receivedMessageData.data,
      };

      client.send(JSON.stringify(sentMessageData));
    });
  };
};
