import React, { useSyncExternalStore } from "react";
import { ChatMessage } from "../../../../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { localStorageStore } from "../../../../store";

dayjs.extend(relativeTime);

import "./style.css";

import editIcon from "../../../../assets/edit.svg";
import deleteIcon from "../../../../assets/delete.svg";

interface MessageProps extends ChatMessage {
  previousMessage?: ChatMessage;
  nextMessage?: ChatMessage;
  editing?: string;
  setEditing: (_id: string) => void;
  deleteMessage: (_id: string) => void;
}

export const Message: React.FC<MessageProps> = ({
  _id,
  author,
  text,
  creationDate,
  edited,
  previousMessage,
  nextMessage,
  editing,
  setEditing,
  deleteMessage,
}) => {
  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );

  // TODO: Rework this, it's not working as intended for more than 2 continuous messages
  const wasEdited = edited || previousMessage?.edited;

  const isEditedNow = editing === _id;
  const userIsAuthor = author._id === localStorageData.user?._id;
  const previousContinuousMessage = previousMessage?.author._id === author._id;
  const nextContinuousMessage = nextMessage?.author._id === author._id;

  const classNames = [
    "message-container",
    userIsAuthor ? "current-user" : "",
    previousContinuousMessage ? "has-previous-message" : "",
    nextContinuousMessage ? "has-next-message" : "",
    isEditedNow ? "editing" : "",
  ];

  return (
    <div className={classNames.join(" ").trim()}>
      {!previousContinuousMessage && (
        <span className="username">{author.username}</span>
      )}
      <div className="text" title={creationDate}>
        <div
          className="delete-button"
          role="button"
          onClick={() => deleteMessage(_id)}
        >
          <img src={deleteIcon} alt="delete" width={25} height={25} />
        </div>
        <div
          className="edit-button"
          role="button"
          onClick={() => setEditing(_id)}
        >
          <img src={editIcon} alt="edit" width={25} height={25} />
        </div>
        <p>{text}</p>
      </div>
      {!nextContinuousMessage && (
        <span className="timestamp" title={creationDate}>
          {dayjs(creationDate).fromNow()} {wasEdited && "(edited)"}
        </span>
      )}
    </div>
  );
};
