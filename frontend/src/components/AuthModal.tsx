import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { IUserAuth } from '../@types/user';

// -- Utilities ------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../utils/HttpUtils';

// -- Context --------------------------------------------------------------------------------------

import AuthContext from '../context/auth-context';

// -- Stylesheet -----------------------------------------------------------------------------------

import './AuthModal.scss';

// -- Component ------------------------------------------------------------------------------------

export default function AuthModal() {
  const authContext = useContext(AuthContext);
  const [authFailMessage, setAuthFailMessage] = useState<string | null>(null);

  // -- Referenced elements ----------------------------------------------------

  const userEl = React.createRef<HTMLInputElement>();
  const passEl = React.createRef<HTMLInputElement>();

  // -- Callbacks --------------------------------------------------------------

  const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = userEl.current?.value;
    const pass = passEl.current?.value;

    if ((user && user.trim().length === 0) || (pass && pass.trim().length === 0)) return;

    const response = await fetchGraphQLResponse(
      `query login($userID: String!, $password: String!) {
        login(userID: $userID, password: $password) {
          userID
          type
          token
          tokenExpiration
        }
      }`,
      { userID: user, password: pass },
      'login failed'
    );

    if (!response) return;

    if (response.errors) {
      setAuthFailMessage(response.errors[0].message);
      if (userEl.current) userEl.current.value = '';
      if (passEl.current) passEl.current.value = '';
      const userField = document.getElementById('auth-form-user-id');
      if (userField) userField.focus();
    } else {
      setAuthFailMessage(null);
      const authData: IUserAuth = response.data.login;
      authContext.login(authData.userID, authData.type, authData.token, authData.tokenExpiration);
    }
  };

  // -- Render -----------------------------------------------------------------

  return (
    <div id="auth-modal">
      <h2>Welcome back</h2>
      <form onSubmit={submitHandler}>
        {authFailMessage && <span>{authFailMessage}</span>}
        <input type="text" id="auth-form-user-id" placeholder="User ID" ref={userEl} required />
        <input
          type="password"
          id="auth-form-password"
          placeholder="Password"
          ref={passEl}
          required
        />
        <input type="submit" value="Log In" />
      </form>
      <Link to="/">Forgot password?</Link>
    </div>
  );
}
