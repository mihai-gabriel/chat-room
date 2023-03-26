import React, {
  Fragment,
  KeyboardEventHandler,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Message } from "./components/Message/Message";
import { ChatMessage } from "../../types";
import { localStorageStore, messageStore } from "../../store";

import "./style.css";

import sendIcon from "../../assets/send.svg";
import userIcon from "../../assets/user.svg";
import signOutIcon from "../../assets/signout.svg";

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
  const editInputRef = useRef(null);

  const [editing, setEditing] = useState<string>();

  const isUserMessageTextValid = (messageText: string): boolean => {
    return messageText.length >= 3;
  };

  const clearInput = () => {
    if (userInputRef.current) {
      const inputElement = userInputRef.current as HTMLInputElement;
      inputElement.value = "";
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      if (editInputRef.current) {
        const editElement = editInputRef.current as HTMLInputElement;
        const updatedText = editElement.value;
        const message = messages.find((msg) => msg._id === editing);

        if (!isUserMessageTextValid(updatedText) || !message) return;

        messageStore.sendMessageUpdate(message, updatedText);
        console.log("SENT");
        setEditing(undefined);
        clearInput();
      }
      return;
    }

    if (userInputRef.current) {
      const inputElement = userInputRef.current as HTMLInputElement;
      const messageText = inputElement.value;

      if (!isUserMessageTextValid(messageText)) return;

      messageStore.sendMessage(messageText);
      clearInput();
    }
  };

  const handleCancelEdit = (
    e: SyntheticEvent<HTMLFormElement, KeyboardEvent>
  ) => {
    if (e.nativeEvent.code === "Escape") {
      setEditing(undefined);
    }
  };

  // TODO: Prompt before deleting
  const deleteMessage = (_id: string) => {
    const message = messages.find((msg) => msg._id === _id);

    if (!message) return;

    messageStore.sendDeleteMessage(message);
  };

  useEffect(() => {
    if (editing && editInputRef.current) {
      const editElement = editInputRef.current as HTMLInputElement;
      const message = messages.find((message) => message._id === editing);

      editElement.value = message?.text || "";
    }
  }, [editing]);

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
      <div className="chat-header">
        <h3 className="room-title">Room 0</h3>
        <div className="auth-info">
          <div className="logged-user">
            <img src={userIcon} alt="logged in user" width={24} height={24} />
            <p>{localStorageData.user?.username}</p>
          </div>

          <div className="logout">
            <img
              src={signOutIcon}
              alt="logged in user"
              width={24}
              height={24}
            />
            <a role="button" onClick={localStorageStore.clearLocalStorage}>
              Logout
            </a>
          </div>
        </div>
      </div>
      <div className="chat-messages-wrapper">
        <div ref={messagesRef} className="chat-messages">
          {messages.map((message, index) => (
            <Fragment key={message._id}>
              <Message
                {...message}
                previousMessage={
                  index - 1 > 0 ? messages[index - 1] : undefined
                }
                nextMessage={
                  index + 1 <= messages.length - 1
                    ? messages[index + 1]
                    : undefined
                }
                editing={editing}
                setEditing={setEditing}
                deleteMessage={deleteMessage}
              />
            </Fragment>
          ))}
        </div>
      </div>
      <form
        className="send-message-form"
        onSubmit={sendMessage}
        onKeyDown={handleCancelEdit}
      >
        <input
          ref={editInputRef}
          type="text"
          className={`edit-input ${editing ? "" : "hidden"}`}
          autoFocus
        />
        <input
          ref={userInputRef}
          type="text"
          className={`chat-input ${editing ? "hidden" : ""}`}
          placeholder="Type here..."
          minLength={2}
          autoFocus
        />
        <button className="send-button" type="submit">
          <img src={sendIcon} alt="send message" />
        </button>

        {editing && (
          <a
            role="button"
            className="cancel-edit"
            onClick={() => setEditing(undefined)}
          >
            (Esc) Cancel edit
          </a>
        )}
      </form>
    </div>
  );
};
