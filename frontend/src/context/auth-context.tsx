import React from 'react';

export interface IAuthContext {
  userID: string | null;
  token: string | null;
  tokenExpiration: number;
  login: (userID: string, token: string, tokenExpiration: number) => void;
  logout: () => void;
}

export default React.createContext<IAuthContext>({
  userID: null,
  token: null,
  tokenExpiration: 0,
  login: () => {},
  logout: () => {}
});
