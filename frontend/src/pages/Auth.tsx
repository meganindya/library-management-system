import React from 'react';

import AuthModal from '../components/AuthModal';

import './Auth.scss';

export default function AuthPage() {
  return (
    <React.Fragment>
      <div id="auth-back">
        <div id="auth-back-stencil"></div>
      </div>
      <div id="auth-banner">
        <div id="auth-heading"></div>
        <div id="auth-modal-wrap">
          <AuthModal />
        </div>
      </div>
    </React.Fragment>
  );
}
