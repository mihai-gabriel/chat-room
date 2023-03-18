import WebSocket from "ws";

import type { ChatMessage, WsMessage } from "../types";
import { MessageType } from "../types";

import { getMessages } from "../db";

export const handleInitialConnection = async (ws: WebSocket.WebSocket) => {
  return async (data: WebSocket.RawData) => {
    if (!ws.readyState) return;

    // we cast .data to string because it represents the userId; (token in the future)
    const receivedMessageData = JSON.parse(
      data.toString()
    ) as WsMessage<string>;

    if (receivedMessageData.type !== MessageType.INITIAL) {
      return;
    }

    const messagesFromDb = await getMessages();

    const historyData: WsMessage<ChatMessage[]> = {
      type: MessageType.INITIAL,
      data: messagesFromDb,
    };

    ws.send(JSON.stringify(historyData));
  };
};
