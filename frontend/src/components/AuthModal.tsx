import React from 'react';
import { Link } from 'react-router-dom';

import './AuthModal.scss';

export default function AuthModal() {
  return (
    <div id="auth-modal">
      <h2>Welcome back</h2>
      <form onSubmit={() => {}}>
        <input type="text" id="" placeholder="User ID" />
        <input type="password" id="" placeholder="Password" />
        <input type="submit" value="Log In" />
      </form>
      <Link to="/">Forgot password?</Link>
    </div>
  );
}
