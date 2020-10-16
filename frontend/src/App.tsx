import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import AuthPage from './pages/Auth';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Redirect from="/" to="/auth" exact />
          <Route path="/auth" component={AuthPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
