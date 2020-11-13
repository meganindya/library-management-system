import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchGraphQLResponse } from '../utils/HttpUtils';

import AuthContext from '../context/auth-context';

import './AuthModal.scss';

export default function AuthModal() {
  const authContext = useContext(AuthContext);
  const [authStatus, setAuthStatus] = useState<{ failed: boolean; message: string | null }>({
    failed: false,
    message: null
  });

  // -- Referenced elements ------------------------------------------------------------------------

  const userEl = React.createRef<HTMLInputElement>();
  const passEl = React.createRef<HTMLInputElement>();

  // -- Callbacks ----------------------------------------------------------------------------------

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
      if (userEl.current) userEl.current.value = '';
      if (passEl.current) passEl.current.value = '';
      const userField = document.getElementById('auth-form-user-id');
      if (userField) userField.focus();
      setAuthStatus({
        failed: true,
        message: response.errors[0].message
      });
    } else {
      setAuthStatus({
        failed: false,
        message: null
      });
      authContext.login(
        response.data.login.userID,
        response.data.login.type,
        response.data.login.token,
        response.data.login.tokenExpiration
      );
    }
  };

  // -- Render -------------------------------------------------------------------------------------

  return (
    <div id="auth-modal">
      <h2>Welcome back</h2>
      <form onSubmit={submitHandler}>
        {authStatus.failed && <span>{authStatus.message}</span>}
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
