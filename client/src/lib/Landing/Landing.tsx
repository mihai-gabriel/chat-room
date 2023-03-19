import React, { useState } from "react";
import { LoginPrompt } from "../LoginPrompt";
import { RegisterPrompt } from "../RegisterPrompt";

import "./style.css";

export const Landing: React.FC = () => {
  const [hasAccount, setHasAccount] = useState(true);

  return (
    <div className="landing-container">
      <h1>Chat Room</h1>
      {hasAccount ? <LoginPrompt /> : <RegisterPrompt />}
      {hasAccount ? (
        <a role="button" onClick={() => setHasAccount(false)}>
          No account?
        </a>
      ) : (
        <a role="button" onClick={() => setHasAccount(true)}>
          Go to login
        </a>
      )}
    </div>
  );
};
