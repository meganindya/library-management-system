import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdBadge, faKey } from '@fortawesome/free-solid-svg-icons';
import './LoginModal.scss';

export default class LoginModal extends React.Component {
  render() {
    return (
      <div className="login-modal">
        <div className="alt-box">
          <h3>New user?</h3>
          <button>Register</button>
        </div>
        <div className="form-box">
          <span className="art-bubble"></span>
          <span className="art-bubble"></span>
          <span className="art-bubble"></span>
          <span className="art-bubble"></span>
          <span className="art-bubble"></span>
          <h2>Welcome back!</h2>
          <form action="">
            <div className="input-field">
              <FontAwesomeIcon icon={faIdBadge} className="input-field-icon" />
              <input type="text" name="" id="" placeholder="User ID" />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faKey} className="input-field-icon" />
              <input type="password" name="" id="" placeholder="Password" />
            </div>
            <input type="submit" value="Login" />
          </form>
          <Link to="/">Forgot Password?</Link>
        </div>
      </div>
    );
  }
}
