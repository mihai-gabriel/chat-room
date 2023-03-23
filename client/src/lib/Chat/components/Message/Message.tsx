import React, { useSyncExternalStore } from "react";
import { ChatMessage } from "../../../../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { localStorageStore } from "../../../../store";

dayjs.extend(relativeTime);

import "./style.css";

interface MessageProps extends ChatMessage {
  previousMessageAuthorId?: string;
  nextMessageAuthorId?: string;
}

export const Message: React.FC<MessageProps> = ({
  _id,
  author,
  text,
  creationDate,
  previousMessageAuthorId,
  nextMessageAuthorId,
}) => {
  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );

  const userIsAuthor = author._id === localStorageData.user?._id;
  const previousContinuousMessage = previousMessageAuthorId === author._id;
  const nextContinuousMessage = nextMessageAuthorId === author._id;

  const classNames = [
    "message-container",
    userIsAuthor ? "current-user" : "",
    previousContinuousMessage ? "has-previous-message" : "",
    nextContinuousMessage ? "has-next-message" : "",
  ];

  return (
    <div className={classNames.join(" ").trim()}>
      {!previousContinuousMessage && (
        <span className="username">{author.username}</span>
      )}
      <div className="text" title={creationDate}>
        <p>{text}</p>
      </div>
      {!nextContinuousMessage && (
        <span className="timestamp" title={creationDate}>
          {dayjs(creationDate).fromNow()}
        </span>
      )}
    </div>
  );
};
