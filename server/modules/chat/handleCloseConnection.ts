// import { userService } from "../../db";
//
// export const handleCloseConnection = async (code: number, reason: Buffer) => {
//   // If we receive the "mark user as offline" code (3001)
//   // We delete the user from the "loggedInUsers"
//   if (code === 3001) {
//     const userId = Number(reason.toString());
//     userService.logoutUserFromChat(userId);
//   }
// };
