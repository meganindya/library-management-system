import React, { useContext, useEffect, useState } from 'react';

import { fetchGraphQLResponse } from '../utils/HttpUtils';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import AuthContext from '../context/auth-context';

import './NavBar.scss';

export default function NavBar() {
  const authContext = useContext(AuthContext);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query user($userID: String!) {
        user(userID: $userID) {
          firstName
        }
      }`,
        { userID: authContext.userID },
        'Username Fetch Failed'
      );

      if (!response) return;

      setName(response.data.user.firstName || '');
    })();
  }, []);

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
