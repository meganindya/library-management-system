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
        <h1 id="title">My Library Inc.</h1>
        <LoginModal />
      </React.Fragment>
    );
    return background;
  }
}

export default AuthPage;
