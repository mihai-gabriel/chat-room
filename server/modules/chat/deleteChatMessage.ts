import { WebSocket } from "ws";
import { ObjectId, WithId } from "mongodb";

import databaseClient from "../../db/conn";
import * as HttpStatus from "../../utils/httpStatusCodes";
import {
  ChatMessage,
  ErrorResponsePayload,
  RequestPayload,
  Room,
  UserDb,
  WsMessage,
  WsMessageType,
} from "../../types";

export const deleteChatMessage = async (
  client: WebSocket,
  clients: Set<WebSocket>,
  payload: RequestPayload
) => {
  const chatroom = databaseClient.db("chatroom");
  const _users = chatroom.collection<UserDb>("users");
  const _rooms = chatroom.collection<Room>("rooms");
  const messages = chatroom.collection<ChatMessage>("messages");

  // payload info
  const userId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);

  // message info
  const _id = new ObjectId(payload.message?._id);

  const message = await messages.findOne({ _id });

  if (
    !_id ||
    !message ||
    !userId.equals(message.authorId) ||
    !roomId.equals(message.roomId)
  ) {
    const errorMessageResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.BAD_REQUEST,
        message: "Message invalid",
      },
    };

    client.send(JSON.stringify(errorMessageResponse));
    return;
  }

  const upsertResult = await messages.findOneAndDelete({
    _id,
    authorId: message.authorId,
    roomId,
  });

  if (!upsertResult.ok) {
    const serverErrorResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Something went wrong with handling this request",
      },
    };

    client.send(JSON.stringify(serverErrorResponse));
    return;
  }

  const response: WsMessage<{ _id: string }> = {
    type: WsMessageType.CHAT_MESSAGE_DELETE,
    payload: { _id: _id.toString() },
  };

  clients.forEach((chatClient) => {
    chatClient.send(JSON.stringify(response));
  });
};
