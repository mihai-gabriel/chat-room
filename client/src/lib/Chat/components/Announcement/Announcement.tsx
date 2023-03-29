import React from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import "./style.css";

dayjs.extend(localizedFormat);

interface AnnouncementProps {
  subject: string;
  text: string;
  timestamp?: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({
  subject,
  text,
  timestamp,
}) => {
  return (
    <div className="announcement-container">
      <h5>{subject}</h5>
      <p className="text">{text}</p>
      <p className="announcement-timestamp">{dayjs(timestamp).format("LLL")}</p>
      <hr />
    </div>
  );
};
