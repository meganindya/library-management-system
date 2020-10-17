import React from 'react';

import LoginModal from '../components/LoginModal/LoginModal';

import './Auth.scss';

class AuthPage extends React.Component {
  render() {
    const background = (
      <React.Fragment>
        <div id="back-overlay"></div>
        <div id="back-shape">
          <div></div>
        </div>
        <div id="title">
          <span></span>
          <h1>My Library Inc.</h1>
        </div>
        <LoginModal />
      </React.Fragment>
    );
    return background;
  }
}

export default AuthPage;
