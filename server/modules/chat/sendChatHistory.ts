import { WebSocket } from "ws";
import { ObjectId } from "mongodb";

import databaseClient from "../../db/conn";
import * as HttpStatus from "../../utils/httpStatusCodes";
import {
  ChatMessage,
  ChatMessageDto,
  ErrorPayload,
  Payload,
  WsMessage,
  WsMessageType,
} from "../../types";

export const sendChatHistory = async (client: WebSocket, payload: Payload) => {
  const chatroom = databaseClient.db("chatroom");
  const messages = chatroom.collection<ChatMessage>("messages");
  const rooms = chatroom.collection("rooms");

  // TODO:
  //  1) Get user id, room id from `payload`
  //  2) Verify if user has access to that room
  //  3) Query all the messages from that room (Suggestion: pagination)
  //  4) Send the messages as JSON to the client

  console.log(`RECEIVED: ${payload.userId} and ${payload.roomId}`);

  const userId = new ObjectId(payload.userId);
  const roomId = new ObjectId(payload.roomId);

  const room = rooms.findOne({ userIds: { $in: [userId] } });

  if (!room) {
    const errorResponse: WsMessage<ErrorPayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.UNAUTHORIZED,
        message: "Unauthorized to this chat room",
      },
    };

    client.send(JSON.stringify(errorResponse));
  }

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
