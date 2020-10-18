import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdBadge,
  faEnvelope,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import './AuthModal.scss';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);

  const idRef: React.RefObject<HTMLInputElement> = React.createRef();
  const emailRef: React.RefObject<HTMLInputElement> = React.createRef();
  const passwordRef: React.RefObject<HTMLInputElement> = React.createRef();

  const switchModeHandler = () => {
    setIsLogin(!isLogin);
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  let floatBoxContent, fixedBoxContent;

  if (isLogin) {
    floatBoxContent = (
      <React.Fragment>
        <h2 className="form-heading">Welcome back!</h2>
        <form onSubmit={submitHandler}>
          <div className="input-field">
            <FontAwesomeIcon icon={faIdBadge} className="input-field-icon" />
            <input type="text" id="id" placeholder="User ID" ref={idRef} />
          </div>
          <div className="input-field">
            <FontAwesomeIcon icon={faKey} className="input-field-icon" />
            <input
              type="password"
              id="pass"
              placeholder="Password"
              ref={emailRef}
            />
          </div>
          <input type="submit" value="Login" />
        </form>
        <Link to="/">Forgot Password?</Link>
      </React.Fragment>
    );

    fixedBoxContent = (
      <React.Fragment>
        <h3>New user?</h3>
        <button onClick={switchModeHandler}>Register</button>
      </React.Fragment>
    );
  } else {
    fixedBoxContent = (
      <React.Fragment>
        <h2 className="form-heading">Register new account</h2>
        <form onSubmit={submitHandler}>
          <div className="input-field">
            <FontAwesomeIcon icon={faIdBadge} className="input-field-icon" />
            <input type="text" id="id" placeholder="User ID" ref={idRef} />
          </div>
          <div className="input-field">
            <FontAwesomeIcon icon={faEnvelope} className="input-field-icon" />
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              ref={emailRef}
            />
          </div>
          <div className="input-field">
            <FontAwesomeIcon icon={faKey} className="input-field-icon" />
            <input
              type="password"
              id="pass"
              placeholder="Password"
              ref={passwordRef}
            />
          </div>
          <input type="submit" value="Sign up" />
        </form>
      </React.Fragment>
    );

    floatBoxContent = (
      <React.Fragment>
        <h3>Already have an account?</h3>
        <button onClick={switchModeHandler}>Sign in</button>
      </React.Fragment>
    );
  }

  return (
    <div className="auth-modal">
      <div className={`fixed-box ${isLogin ? 'narrow-box' : 'wide-box'}`}>
        {fixedBoxContent}
      </div>
      <div className={`float-box ${isLogin ? 'wide-box' : 'narrow-box'}`}>
        {floatBoxContent}
        <span className="art-bubble"></span>
        <span className="art-bubble"></span>
        <span className="art-bubble"></span>
        <span className="art-bubble"></span>
        <span className="art-bubble"></span>
      </div>
    </div>
  );
}
