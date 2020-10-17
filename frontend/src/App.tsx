import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';

import './App.scss';

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <div id="back-overlay"></div>
          <main id="main-content">
            <Switch>
              <Redirect from="/" to="/auth" exact />
              <Route path="/auth" component={AuthPage} />
            </Switch>
          </main>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}
