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
  const _users = chatroom.collection<UserDb>("users");
  const _rooms = chatroom.collection<Room>("rooms");
  const messages = chatroom.collection<ChatMessage>("messages");

  // payload info
  const userId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);

  // message info
  const _id = payload.message?._id;
  const authorId = payload.message?.authorId;
  const messageRoomId = payload.message?.roomId;
  const text = payload.message?.text;

  // could be !(arg1 && arg2 && ...), shout out to De Morgan
  if (
    !text ||
    !_id ||
    !authorId ||
    !messageRoomId ||
    !userId.equals(authorId) ||
    !roomId.equals(messageRoomId)
  ) {
    const errorMessageResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.BAD_REQUEST,
        message: "Message invalid",
      },
    };

    return errorMessageResponse;
  }

  const upsertResult = await messages.updateOne(
    { _id, authorId, roomId },
    { text }
  );

  const updatedMessage = await messages
    .aggregate([
      {
        $match: { _id: upsertResult.upsertedId },
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

  if (!updatedMessage) {
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
