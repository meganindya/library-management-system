import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BrowsePage from './pages/Browse';
import HistoryPage from './pages/History';

import AuthContext from './context/auth-context';

import './App.scss';

interface IAppProps {}

interface IAppState {
  userID: string | null;
  token: string | null;
}

export default class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);

    this.state = {
      userID: null,
      token: null
    };
  }

  login = (userID: string, token: string, tokenExpiration: number): void => {
    this.setState({
      userID,
      token
    });
  };

  logout = () => {
    this.setState({
      userID: null,
      token: null
    });
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider
            value={{
              userID: this.state.userID,
              token: this.state.token,
              login: this.login,
              logout: this.logout
            }}
          >
            <div id="back-overlay"></div>
            <main id="main-content">
              <Switch>
                {this.state.token && <Redirect from="/" to="/browse" exact />}
                {this.state.token && (
                  <Redirect from="/auth" to="/browse" exact />
                )}
                {!this.state.token && (
                  <Route path="/auth" component={AuthPage} />
                )}
                {this.state.token && (
                  <Route path="/browse" component={BrowsePage} />
                )}
                {this.state.token && (
                  <Route path="/history" component={HistoryPage} />
                )}
                {!this.state.token && <Redirect to="/auth" exact />}
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}
