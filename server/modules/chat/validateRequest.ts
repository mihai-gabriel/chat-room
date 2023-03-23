import { ObjectId } from "mongodb";
import databaseClient from "../../db/conn";
import * as HttpStatus from "../../utils/httpStatusCodes";
import {
  ErrorResponsePayload,
  RequestPayload,
  Room,
  UserDb,
  WsMessage,
  WsMessageType,
} from "../../types";

export const validateRequest = async (payload: RequestPayload) => {
  const chatroom = databaseClient.db("chatroom");
  const users = chatroom.collection<UserDb>("users");
  const rooms = chatroom.collection<Room>("rooms");

  let userId: ObjectId;
  let roomId: ObjectId;

  try {
    userId = new ObjectId(payload.userId);
    roomId = new ObjectId(payload.roomId);
  } catch (e) {
    const serverErrorResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Invalid User ID or Room ID. Try to re-authenticate.",
      },
    };

    return serverErrorResponse;
  }

  // TODO: Check JWT token here when implemented

  console.log("received userId", userId);

  const user = await users.findOne({ _id: userId });

  if (!user) {
    const errorUserResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.BAD_REQUEST,
        message: "User does not exist",
      },
    };

    return errorUserResponse;
  }

  const room = rooms.findOne({ _id: roomId, userIds: { $in: [user._id] } });

  if (!room) {
    const errorRoomResponse: WsMessage<ErrorResponsePayload> = {
      type: WsMessageType.SERVER_ERROR,
      payload: {
        code: HttpStatus.UNAUTHORIZED,
        message: "Room does not exist",
      },
    };

    return errorRoomResponse;
  }

  return {
    type: WsMessageType.REQUEST_VALIDATED,
    payload,
  };
};
