import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BrowsePage from './pages/Browse';
import HistoryPage from './pages/History';

import AuthContext from './context/auth-context';

import './App.scss';

interface IAppState {
  userID: string | null;
  token: string | null;
}

export default function App() {
  const [userState, setUserState] = useState<IAppState>({
    userID: null,
    token: null
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
          <div id="back-overlay"></div>
          <main id="main-content">
            <Switch>
              {userState.token && <Redirect from="/" to="/browse" exact />}
              {userState.token && <Redirect from="/auth" to="/browse" exact />}
              {!userState.token && <Route path="/auth" component={AuthPage} />}
              {userState.token && (
                <Route path="/browse" component={BrowsePage} />
              )}
              {userState.token && (
                <Route path="/history" component={HistoryPage} />
              )}
              {!userState.token && <Redirect to="/auth" exact />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}
