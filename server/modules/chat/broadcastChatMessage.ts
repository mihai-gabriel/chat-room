import { WebSocket } from "ws";
import { ObjectId } from "mongodb";

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
import { INTERNAL_SERVER_ERROR } from "../../utils/httpStatusCodes";

export const broadcastChatMessage = async (
  client: WebSocket,
  clients: Set<WebSocket>,
  payload: RequestPayload
) => {
  const chatroom = databaseClient.db("chatroom");
  const _users = chatroom.collection<UserDb>("users");
  const _rooms = chatroom.collection<Room>("rooms");
  const messages = chatroom.collection<ChatMessage>("messages");

  console.log(
    `RECEIVED: ${payload.userId} - ${payload.roomId} and ${payload.message}`
  );

  const authorId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);
  const text = payload.message;

  if (!text) {
    const errorRoomResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.UNAUTHORIZED,
        message: "Room does not exist",
      },
    };

    return errorRoomResponse;
  }

  const insertResult = await messages.insertOne({
    authorId,
    roomId,
    text,
  });

  const createdMessage = await messages
    .aggregate([
      {
        $match: { _id: insertResult.insertedId },
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
        },
      },
      { $addFields: { creationDate: { $toDate: "$_id" } } },
    ])
    .next();

  if (!createdMessage) {
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
    type: WsMessageType.CHAT_MESSAGE,
    payload: createdMessage as ChatMessageDto,
  };

  clients.forEach((chatClient) => {
    chatClient.send(JSON.stringify(response));
  });
};
