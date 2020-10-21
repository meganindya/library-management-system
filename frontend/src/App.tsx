import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';

import AuthContext from './context/auth-context';

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
          <main id="main-content">
            <Switch>
              {/* {userState.token && <Redirect from="/" to="/auth" exact />}
              {!userState.token && <Route path="/auth" component={AuthPage} />}
              {!userState.token && <Redirect to="/auth" exact />} */}
              <Redirect from="/" to="/auth" exact></Redirect>
              <Route path="/auth" component={AuthPage}></Route>
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}
