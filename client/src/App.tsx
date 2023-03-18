import React, { useRef, useSyncExternalStore } from "react";
import { messageStore } from "./store";
import { ChatMessage } from "./types";

export default function App() {
  const messages = useSyncExternalStore<ChatMessage[]>(
    messageStore.subscribe,
    messageStore.getSnapshot
  );

  const userInputRef = useRef(null);

  const isUserMessageTextValid = (messageText: string): boolean => {
    console.log(messageText);

    return messageText.length >= 3;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (userInputRef.current) {
      const inputElement = userInputRef.current as HTMLInputElement;
      const messageText = inputElement.value;

      if (!isUserMessageTextValid(messageText)) return;

      const chatMessage: ChatMessage = {
        author: "User",
        text: messageText,
      };

      console.log("sent event");
      messageStore.sendMessage(chatMessage);
    }
  };

  return (
    <>
      <form onSubmit={sendMessage}>
        <input ref={userInputRef} type="text" />
        <button type="submit">Send</button>
      </form>
      <hr />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </>
  );
}
