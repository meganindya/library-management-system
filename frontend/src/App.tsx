import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';
import TemplatePage from './pages/Template';

import AuthContext from './context/auth-context';

interface IAppState {
  userID: string | null;
  token: string | null;
}

export default function App() {
  const [userState, setUserState] = useState<IAppState>({
    userID: null, // || '11118001',
    token: null // || 'hjsfbghdsfndsmnf'
  });

  const login = (
    userID: string,
    token: string,
    tokenExpiration: number
  ): void => {
    setUserState({
      userID,
      token
    });
  };

  const logout = () => {
    setUserState({
      userID: null,
      token: null
    });
  };

  return (
    <BrowserRouter>
      <React.Fragment>
        <AuthContext.Provider
          value={{
            userID: userState.userID,
            token: userState.token,
            login: login,
            logout: logout
          }}
        >
          <main id="main-content">
            <Switch>
              {userState.token && <Redirect from="/" to="/browse" exact />}
              {userState.token && <Redirect from="/auth" to="/browse" exact />}
              {!userState.token && <Route path="/auth" component={AuthPage} />}
              {userState.token && (
                <Route
                  path="/browse"
                  render={() => <TemplatePage pageName="browse" />}
                />
              )}
              {userState.token && (
                <Route
                  path="/history"
                  render={() => <TemplatePage pageName="history" />}
                />
              )}
              {userState.token && (
                <Route
                  path="/dashboard"
                  render={() => <TemplatePage pageName="dashboard" />}
                />
              )}
              {!userState.token && <Redirect to="/auth" exact />}
              {/* <Redirect from="/" to="/browse" exact />
              <Route
                path="/browse"
                render={() => <TemplatePage pageName="browse" />}
              /> */}
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}
