import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faIdBadge,
  faEnvelope,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import './AuthModal.scss';

interface IAuthModalProps {}

interface IAuthModalState {
  isLogin: boolean;
}

export default class AuthModal extends React.Component<
  IAuthModalProps,
  IAuthModalState
> {
  private idRef: React.RefObject<HTMLInputElement>;
  private emailRef: React.RefObject<HTMLInputElement>;
  private passwordRef: React.RefObject<HTMLInputElement>;

  constructor(props: IAuthModalProps) {
    super(props);

    this.state = {
      isLogin: true
    };

    this.idRef = React.createRef();
    this.emailRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  switchModeHandler = () => {
    this.setState((prevState) => ({
      isLogin: !prevState.isLogin
    }));
  };

  submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  render() {
    let floatBoxContent, fixedBoxContent;

    if (this.state.isLogin) {
      floatBoxContent = (
        <React.Fragment>
          <h2 className="form-heading">Welcome back!</h2>
          <form onSubmit={this.submitHandler}>
            <div className="input-field">
              <FontAwesomeIcon icon={faIdBadge} className="input-field-icon" />
              <input
                type="text"
                id="id"
                placeholder="User ID"
                ref={this.idRef}
              />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faKey} className="input-field-icon" />
              <input
                type="password"
                id="pass"
                placeholder="Password"
                ref={this.emailRef}
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
          <button onClick={this.switchModeHandler}>Register</button>
        </React.Fragment>
      );
    } else {
      fixedBoxContent = (
        <React.Fragment>
          <h2 className="form-heading">Register new account</h2>
          <form onSubmit={this.submitHandler}>
            <div className="input-field">
              <FontAwesomeIcon icon={faIdBadge} className="input-field-icon" />
              <input
                type="text"
                id="id"
                placeholder="User ID"
                ref={this.idRef}
              />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className="input-field-icon" />
              <input
                type="email"
                id="email"
                placeholder="E-mail"
                ref={this.emailRef}
              />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faKey} className="input-field-icon" />
              <input
                type="password"
                id="pass"
                placeholder="Password"
                ref={this.passwordRef}
              />
            </div>
            <input type="submit" value="Sign up" />
          </form>
        </React.Fragment>
      );

      floatBoxContent = (
        <React.Fragment>
          <h3>Already have an account?</h3>
          <button onClick={this.switchModeHandler}>Sign in</button>
        </React.Fragment>
      );
    }

    return (
      <div className="auth-modal">
        <div
          className={`fixed-box ${
            this.state.isLogin ? 'narrow-box' : 'wide-box'
          }`}
        >
          {fixedBoxContent}
        </div>
        <div
          className={`float-box ${
            this.state.isLogin ? 'wide-box' : 'narrow-box'
          }`}
        >
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
}
