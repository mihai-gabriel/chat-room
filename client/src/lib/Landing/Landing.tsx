import React, { Fragment, useState } from "react";
import { LoginPrompt } from "../LoginPrompt";
import { RegisterPrompt } from "../RegisterPrompt";

import "./style.css";

export const Landing: React.FC = () => {
  const [hasAccount, setHasAccount] = useState(true);

  const renderSection = () => {
    if (hasAccount) {
      return (
        <Fragment>
          <h1>Chat Room</h1>
          <LoginPrompt />
          <a role="button" onClick={() => setHasAccount(false)}>
            No account?
          </a>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <h1>Account Creation</h1>
        <RegisterPrompt />
        <a role="button" onClick={() => setHasAccount(true)}>
          Go to login
        </a>
      </Fragment>
    );
  };

  return <div className="landing-container">{renderSection()}</div>;
};
