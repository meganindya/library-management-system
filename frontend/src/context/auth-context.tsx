import React from 'react';

interface IAuthContext {
  userID: string | null;
  token: string | null;
  login: (userID: string, token: string, tokenExpiration: number) => void;
  logout: () => void;
}

export default React.createContext({
  userID: null,
  token: null,
  login: (userID, token, tokenExpiration) => {},
  logout: () => {}
} as IAuthContext);
