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

export const sendChatHistory = async (
  client: WebSocket,
  payload: RequestPayload
) => {
  const chatroom = databaseClient.db("chatroom");
  const users = chatroom.collection<UserDb>("users");
  const messages = chatroom.collection<ChatMessage>("messages");
  const rooms = chatroom.collection<Room>("rooms");

  const userId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);

  const user = await users.findOne({ _id: userId });

  if (!user) {
    const errorResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.BAD_REQUEST,
        message: "User does not exist",
      },
    };

    client.send(JSON.stringify(errorResponse));
    return;
  }

  const room = rooms.findOne({ _id: roomId, userIds: { $in: [userId] } });

  if (!room) {
    const errorResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.UNAUTHORIZED,
        message: "Unauthorized to this chat room",
      },
    };

    client.send(JSON.stringify(errorResponse));
    return;
  }

  // - Filter Messages by roomId
  // - Aggregate user data (authorId -> author)
  // - Only keep the relevant fields ($project)
  // - Append creation date (from _id)
  const roomMessages = await messages
    .aggregate<ChatMessageDto>([
      { $match: { roomId } },
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
    .toArray();

  const response: WsMessage<ChatMessageDto[]> = {
    type: WsMessageType.CHAT_HISTORY,
    payload: roomMessages,
  };

  client.send(JSON.stringify(response));
};
