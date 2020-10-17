import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BrowsePage from './pages/Browse';

import './App.scss';

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <div id="back-overlay"></div>
          <main id="main-content">
            <Switch>
              <Redirect from="/" to="/browse" exact />
              <Route path="/auth" component={AuthPage} />
              <Route path="/browse" component={BrowsePage} />
            </Switch>
          </main>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}
