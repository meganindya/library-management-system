import React from 'react';

import AuthModal from '../components/AuthModal/AuthModal';

import './Auth.scss';

interface IAuthProps {}

interface IAuthState {}

export default class AuthPage extends React.Component<IAuthProps, IAuthState> {
  render() {
    return (
      <React.Fragment>
        <div id="auth-back-shape">
          {/* stencil */}
          <div></div>
        </div>
        <div id="auth-heading">
          {/* logo */}
          <span></span>
          <h1>My Library Inc.</h1>
        </div>
        <div id="auth-modal-wrapper">
          <AuthModal />
        </div>
      </React.Fragment>
    );
  }
}
