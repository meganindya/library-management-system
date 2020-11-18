import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { IAuthContext } from './@types/context';

// -- Subcomponents --------------------------------------------------------------------------------

import AuthPage from './pages/Auth';
import TemplatePage from './pages/Template';

// -- Context --------------------------------------------------------------------------------------

import AuthContext, { authContextDefaults } from './context/auth-context';

// -- Component ------------------------------------------------------------------------------------

export default function App() {
  const [userAuthState, setUserAuthState] = useState<Omit<IAuthContext, 'login' | 'logout'>>({
    ...authContextDefaults
  });

  // -- Render -----------------------------------------------------------------

  return (
    <BrowserRouter>
      <React.Fragment>
        <AuthContext.Provider
          value={{
            ...userAuthState,
            login: (userID: string, type: string, token: string, tokenExpiration: number): void =>
              setUserAuthState({ userID, type, token, tokenExpiration }),
            logout: (): void => setUserAuthState({ ...authContextDefaults })
          }}
        >
          <main>
            <Switch>
              {!userAuthState.token && (
                <React.Fragment>
                  <Redirect to="/auth" exact />
                  <Route path="/auth" component={AuthPage}></Route>
                </React.Fragment>
              )}
              {userAuthState.token &&
                (userAuthState.type !== 'Librarian' ? (
                  <React.Fragment>
                    <Redirect from="/" to="/browse" exact />
                    <Redirect from="/auth" to="/browse" exact />
                    <Redirect from="/awaiting" to="/browse" exact />
                    <Redirect from="/borrow" to="/browse" exact />
                    <Redirect from="/return" to="/browse" exact />
                    <Route path="/browse" render={() => <TemplatePage pageName="browse" />} />
                    <Route path="/history" render={() => <TemplatePage pageName="history" />} />
                    <Route path="/dashboard" render={() => <TemplatePage pageName="dashboard" />} />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Redirect from="/" to="/awaiting" exact />
                    <Redirect from="/auth" to="/awaiting" exact />
                    <Redirect from="/browse" to="/awaiting" exact />
                    <Redirect from="/history" to="/awaiting" exact />
                    <Redirect from="/dashboard" to="/awaiting" exact />
                    <Route path="/awaiting" render={() => <TemplatePage pageName="awaiting" />} />
                    <Route path="/borrow" render={() => <TemplatePage pageName="borrow" />} />
                    <Route path="/return" render={() => <TemplatePage pageName="return" />} />
                  </React.Fragment>
                ))}
            </Switch>
          </main>
        </AuthContext.Provider>
      </React.Fragment>
    </BrowserRouter>
  );
}
