import { WebSocket } from "ws";
import { ObjectId, WithId } from "mongodb";

import databaseClient from "../../db/conn";
import * as HttpStatus from "../../utils/httpStatusCodes";
import {
  ChatMessage,
  ChatMessageDto,
  ErrorResponsePayload,
  RequestPayload,
  Room,
  UserDb,
  WsMessage,
  WsMessageType,
} from "../../types";

export const editChatMessage = async (
  client: WebSocket,
  clients: Set<WebSocket>,
  payload: RequestPayload
) => {
  const chatroom = databaseClient.db("chatroom");
  const messages = chatroom.collection<ChatMessage>("messages");

  // payload info
  const userId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);

  // message info
  const _id = new ObjectId(payload.message?._id);
  const text = payload.message?.text;

  const message = await messages.findOne({ _id });

  if (
    !text ||
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

  const upsertResult = await messages.findOneAndUpdate(
    { _id, authorId: message.authorId, roomId },
    { $set: { text, edited: true } }
  );

  const updatedMessage = await messages
    .aggregate([
      {
        $match: { _id: upsertResult.value?._id },
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          pipeline: [
            { $project: { username: true, fullName: true, email: true } },
          ],
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: true,
          roomId: true,
          author: true,
          text: true,
          edited: true,
        },
      },
      { $addFields: { creationDate: { $toDate: "$_id" } } },
    ])
    .next();

  if (!updatedMessage || !upsertResult.ok) {
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

  const response: WsMessage<ChatMessageDto> = {
    type: WsMessageType.CHAT_MESSAGE_UPDATE,
    payload: updatedMessage as ChatMessageDto,
  };

  clients.forEach((chatClient) => {
    chatClient.send(JSON.stringify(response));
  });
};
