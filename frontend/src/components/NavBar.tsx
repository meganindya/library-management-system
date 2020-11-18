import React, { useContext, useEffect, useState } from 'react';

// - Utilities -------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../utils/HttpUtils';

// -- Subcomponents --------------------------------------------------------------------------------

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// -- Context --------------------------------------------------------------------------------------

import AuthContext from '../context/auth-context';

// -- Stylesheet -----------------------------------------------------------------------------------

import './NavBar.scss';

// -- Component ------------------------------------------------------------------------------------

export default function NavBar() {
  const authContext = useContext(AuthContext);
  const [name, setName] = useState('');

  // fetch user's first name on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query user($userID: String!) {
        user(userID: $userID) {
          firstName
        }
      }`,
        { userID: authContext.userID },
        'user first name fetch failed'
      );

      if (!response) return;

      setName(response.data.user.firstName || '');
    })();
  }, []);

  // -- Render -----------------------------------------------------------------

  return (
    <nav className="container-fluid">
      <div id="nav-logo">
        <h1>mylibrary.inc</h1>
      </div>
      <div id="nav-user">
        <span>Hi,&nbsp;&nbsp;{name || 'USER'}</span>
        <button onClick={authContext.logout}>
          <FontAwesomeIcon icon={faSignOutAlt}></FontAwesomeIcon>
        </button>
      </div>
    </nav>
  );
}
