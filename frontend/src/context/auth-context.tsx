import React from 'react';

export interface IAuthContext {
  userID: string | null;
  type: string | null;
  token: string | null;
  tokenExpiration: number;
  login: (userID: string, type: string, token: string, tokenExpiration: number) => void;
  logout: () => void;
}

export default React.createContext<IAuthContext>({
  userID: null,
  type: null,
  token: null,
  tokenExpiration: 0,
  login: () => {},
  logout: () => {}
});
