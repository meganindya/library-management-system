import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';
import TemplatePage from './pages/Template';

import AuthContext, { IAuthContext } from './context/auth-context';

export default function App() {
  const [userState, setUserState] = useState<{
    userID: string | null;
    type: string | null;
    token: string | null;
    tokenExpiration: number;
  }>({
    userID: null,
    token: null,
    type: null,
    tokenExpiration: 99
    // userID: '11118001',
    // token: 'abcdefghijklmnopqrstuvwxyz',
    // type: 'Student',
    // tokenExpiration: 99
  });

  const authContextDefaultVals: IAuthContext = {
    userID: userState.userID,
    type: userState.type,
    token: userState.token,
    tokenExpiration: userState.tokenExpiration,
    login: (userID: string, type: string, token: string, tokenExpiration: number): void => {
      setUserState({
        userID,
        type,
        token,
        tokenExpiration
      });
    },
    logout: () => {
      setUserState({
        userID: null,
        type: null,
        token: null,
        tokenExpiration: 99
      });
    }
  };

  return (
    <BrowserRouter>
      <React.Fragment>
        <AuthContext.Provider value={authContextDefaultVals}>
          <main>
            <Switch>
              {!userState.token && (
                <React.Fragment>
                  <Redirect to="/auth" exact />
                  <Route path="/auth" component={AuthPage}></Route>
                </React.Fragment>
              )}
              {userState.token && (
                <React.Fragment>
                  <Redirect from="/" to="/browse" exact />
                  <Redirect from="/auth" to="/browse" exact />
                  <Route path="/browse" render={() => <TemplatePage pageName="browse" />} />
                  <Route path="/history" render={() => <TemplatePage pageName="history" />} />
                  <Route path="/dashboard" render={() => <TemplatePage pageName="dashboard" />} />
                </React.Fragment>
              )}
              {/* <Redirect from="/" to="/browse" exact />
              <Route path="/browse" render={() => <TemplatePage pageName="browse" />} /> */}
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}
