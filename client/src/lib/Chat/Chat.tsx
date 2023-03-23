import React, {
  Fragment,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

import { Message } from "./components/Message/Message";
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

  if (!localStorageData.user) {
    return null;
  }

  return (
    <div className="chat-container">
      <h3>Room 0</h3>
      <div className="chat-messages-wrapper">
        <div ref={messagesRef} className="chat-messages">
          {messages.map((message, index) => (
            <Fragment key={message._id}>
              <Message
                {...message}
                previousMessageAuthorId={
                  index - 1 > 0 ? messages[index - 1].author._id : undefined
                }
                nextMessageAuthorId={
                  index + 1 <= messages.length - 1
                    ? messages[index + 1].author._id
                    : undefined
                }
              />
            </Fragment>
          ))}
        </div>
      </div>
      <form className="send-message-form" onSubmit={sendMessage}>
        <input
          ref={userInputRef}
          type="text"
          className="chat-input"
          placeholder="Type here..."
          minLength={2}
          autoFocus
        />
        <button className="send-button" type="submit">
          <img src={sendIcon} alt="send message" />
        </button>
      </form>
    </div>
  );
};
