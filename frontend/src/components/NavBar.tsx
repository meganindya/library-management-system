import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../context/auth-context';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './NavBar.scss';

export default function NavBar() {
  const authContext = useContext(AuthContext);
  const [name, setName] = useState('');

  useEffect(() => {
    const nameRequestBody = {
      query: `
        query user($userID: String!) {
          user(userID: $userID) {
            firstName
          }
        }
      `,
      variables: {
        userID: authContext.userID
      }
    };

    let firstName: string | null = null;
    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(nameRequestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('failed!');
        }
        return response.json();
      })
      .then((responseData) => {
        if (responseData.data.user.firstName) {
          firstName = responseData.data.user.firstName;
          !firstName ? setName('') : setName(firstName);
        }
      })
      .catch((e) => {
        console.error(e);
      });
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
