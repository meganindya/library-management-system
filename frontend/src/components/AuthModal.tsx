import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import AuthContext from '../context/auth-context';

import './AuthModal.scss';

interface IAuthModalState {
  failed: boolean;
  message: string | null;
}

export default function AuthModal() {
  const [authStatus, setAuthStatus] = useState<IAuthModalState>({
    failed: false,
    message: null
  });

  const userEl: React.RefObject<HTMLInputElement> = React.createRef();
  const passEl: React.RefObject<HTMLInputElement> = React.createRef();

  const authContext = useContext(AuthContext);

  const clearFields = () => {
    if (userEl.current) {
      userEl.current.value = '';
    }
    if (passEl.current) {
      passEl.current.value = '';
    }
    const userField = document.getElementById('auth-form-user-id');
    if (userField) userField.focus();
  };

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
      if (!responseData.data.login) {
        clearFields();
        setAuthStatus({
          failed: true,
          message: responseData.errors[0].message
        });
      } else {
        setAuthStatus({
          failed: false,
          message: null
        });
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
        {authStatus.failed && <span>{authStatus.message}</span>}
        <input
          type="text"
          id="auth-form-user-id"
          placeholder="User ID"
          ref={userEl}
          required
        />
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
