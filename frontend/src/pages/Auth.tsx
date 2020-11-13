import React from 'react';

import AuthModal from '../components/AuthModal';

import './Auth.scss';

export default function AuthPage() {
  // -- Render -------------------------------------------------------------------------------------

  return (
    <div id="auth-back">
      <div id="auth-back-shape">
        <div id="auth-back-overlay"></div>
      </div>
      <div id="auth-banner" className="container">
        <div id="auth-main" className="container">
          <div id="auth-heading">
            <h1>mylibrary.inc</h1>
            <h2>
              Connects – people to people, people to place, people to learning.
              <br />
              <br />
              Cutting libraries in a recession is like cutting hospitals in a plague.
            </h2>
          </div>
          <div id="auth-modal-wrap">
            <AuthModal />
          </div>
        </div>
      </div>
      <footer id="auth-footer" className="container">
        <span>Copyright &copy;2020 meganindya</span>
      </footer>
    </div>
  );
}
