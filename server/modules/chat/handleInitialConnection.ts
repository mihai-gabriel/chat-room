// import WebSocket from "ws";
//
// import type {
//   FullChatMessage,
//   WsClientMessage,
//   WsServerMessage,
// } from "../../types";
// import { WsMessageType } from "../../types";
//
// import { messageService, userService } from "../../db";
//
// type WebSocketServerClients = Set<WebSocket.WebSocket>;
//
// export const handleInitialConnection = async (
//   ws: WebSocket.WebSocket,
//   clients: WebSocketServerClients
// ) => {
//   return async (rawSocketData: WebSocket.RawData) => {
//     if (!ws.readyState) return;
//
//     const rawMessageData = JSON.parse(rawSocketData.toString());
//
//     if (typeof rawMessageData.data === "object") {
//       return;
//     }
//
//     if (rawMessageData.data !== "initial") {
//       return;
//     }
//
//     // typecast to the appropriate type
//     const messageData = rawMessageData as WsClientMessage<string>;
//
//     // REFACTOR into a different function
//     // mark user as being "online" in the chat
//
//     // clients.forEach(function each(client) {
//     //   if (!client.readyState) return;
//     //
//     //   const onlineUsersData: WsServerMessage<number[]> = {
//     //     type: WsMessageType.SERVER_ANNOUNCEMENT,
//     //     data: userService.getLoggedInUsers(),
//     //   };
//     //
//     //   client.send(JSON.stringify(onlineUsersData));
//     // });
//
//     // TODO: retrieve all the messages for this user (not all messages)
//     const messagesFromDb = await messageService.getMessages();
//
//     const fullMessagesFromDb: FullChatMessage[] = [];
//
//     for (const dbMessage of messagesFromDb) {
//       const user = userService.getUserProfileById(dbMessage.authorId);
//
//       if (user) {
//         fullMessagesFromDb.push({ ...dbMessage, authorName: user?.username });
//       }
//     }
//
//     console.log("full history:", fullMessagesFromDb);
//
//     // Send the chat history when the user is initially loading the chat.
//     const historyData: WsServerMessage<FullChatMessage[]> = {
//       type: WsMessageType.CHAT_HISTORY,
//       data: fullMessagesFromDb,
//     };
//
//     ws.send(JSON.stringify(historyData));
//   };
// };
