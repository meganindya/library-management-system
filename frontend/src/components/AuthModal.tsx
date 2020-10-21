import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import AuthContext from '../context/auth-context';

import './AuthModal.scss';

export default function AuthModal() {
  const userEl: React.RefObject<HTMLInputElement> = React.createRef();
  const passEl: React.RefObject<HTMLInputElement> = React.createRef();

  const authContext = useContext(AuthContext);

  const submitHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const user = userEl.current?.value;
    const pass = passEl.current?.value;

    if (
      (user && user.trim().length === 0) ||
      (pass && pass.trim().length === 0)
    ) {
      return;
    }

    let requestBody = {
      query: `
        query login($userID: String!, $password: String!) {
          login(userID: $userID, password: $password) {
            userID
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        userID: user,
        password: pass
      }
    };

    try {
      const response = await fetch('http://localhost:8000/api', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('failed!');
      }

      const responseData = await response.json();
      if (responseData.data.login.token) {
        authContext.login(
          responseData.data.login.userID,
          responseData.data.login.token,
          responseData.data.login.tokenExpiration
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="auth-modal">
      <h2>Welcome back</h2>
      <form onSubmit={submitHandler}>
        <input type="text" id="userID" placeholder="User ID" ref={userEl} />
        <input
          type="password"
          id="password"
          placeholder="Password"
          ref={passEl}
        />
        <input type="submit" value="Log In" />
      </form>
      <Link to="/">Forgot password?</Link>
    </div>
  );
}
