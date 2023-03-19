import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { ChatMessage, FullChatMessage } from "../types";
import { messageStore } from "../store";

interface ChatProps {
  userId?: number;
}

export const Chat: React.FC<ChatProps> = ({ userId }) => {
  const messages = useSyncExternalStore<FullChatMessage[]>(
    messageStore.subscribe,
    messageStore.getSnapshot
  );

  const userInputRef = useRef(null);

  const isUserMessageTextValid = (messageText: string): boolean => {
    return messageText.length >= 3;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (userInputRef.current) {
      const inputElement = userInputRef.current as HTMLInputElement;
      const messageText = inputElement.value;

      if (!isUserMessageTextValid(messageText)) return;

      const chatMessage: ChatMessage = {
        text: messageText,
      };

      messageStore.sendMessage(chatMessage);
      inputElement.value = "";
    }
  };

  useEffect(() => {}, [userId]);

  if (!userId) {
    return null;
  }

  return (
    <>
      <form onSubmit={sendMessage}>
        <input ref={userInputRef} type="text" />
        <button type="submit">Send</button>
      </form>
      <hr />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.text} - {message.authorName}
          </li>
        ))}
      </ul>
    </>
  );
};
