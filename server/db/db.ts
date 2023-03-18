import { ChatMessage } from "../types";

let idx = 4;

let historyFromDB: ChatMessage[] = [
  { id: 1, author: "User1", text: "Hello" },
  { id: 2, author: "User2", text: "Hello, there" },
  { id: 3, author: "User3", text: "Thanks" },
];

// Note: Promises are not necessary here
//       But perhaps they'd matter when I'll have a real DB connection?
const getMessages = (): Promise<ChatMessage[]> => {
  return new Promise((resolve, reject) => {
    if (historyFromDB.length === 0) {
      reject("Simulate error if db connection was unsuccessful");
      return;
    }

    resolve(historyFromDB);
  });
};

const addMessage = (message: ChatMessage): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // dumb auto id
    message.id = idx++;
    historyFromDB = [...historyFromDB, message];

    resolve(true);
  });
};

export { getMessages, addMessage };
