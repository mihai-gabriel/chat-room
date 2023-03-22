import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { ChatMessage } from "../../types";
import { localStorageStore, messageStore } from "../../store";

import "./style.css";

import sendIcon from "../../assets/send.svg";

export const Chat: React.FC = () => {
  const messages = useSyncExternalStore<ChatMessage[]>(
    messageStore.subscribe,
    messageStore.getSnapshot
  );

  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );

  const userInputRef = useRef(null);
  const messagesRef = useRef(null);

  const isUserMessageTextValid = (messageText: string): boolean => {
    return messageText.length >= 3;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (userInputRef.current) {
      const inputElement = userInputRef.current as HTMLInputElement;
      const messageText = inputElement.value;

      if (!isUserMessageTextValid(messageText)) return;

      messageStore.sendMessage(messageText);
      inputElement.value = "";
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      const messagesElement = messagesRef.current as HTMLDivElement;
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages]);

  if (!localStorageData.userId) {
    console.log(localStorageData.userId);
    return null;
  }

  return (
    <div className="chat-container">
      <div ref={messagesRef} className="chat-messages">
        <ul>
          {messages.map((message) => (
            <li key={message._id}>
              {message.creationDate}
              {" - "}
              {message.text}{" "}
              <span className="username">- {message.author.fullName}</span>
            </li>
          ))}
        </ul>
      </div>
      <form className="send-message-form" onSubmit={sendMessage}>
        <input
          className="chat-input"
          ref={userInputRef}
          type="text"
          autoFocus
        />
        <button className="send-button" type="submit">
          <img src={sendIcon} alt="send message" />
        </button>
      </form>
    </div>
  );
};
