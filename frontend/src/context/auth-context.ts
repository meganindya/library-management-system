import React from 'react';

import { IAuthContext } from '../@types/context';

export const authContextDefaults: IAuthContext = {
    userID: null,
    type: null,
    token: null,
    tokenExpiration: 99,
    // userID: '11118001',
    // token: 'abcdefghijklmnopqrstuvwxyz',
    // type: 'Student',
    // tokenExpiration: 99
    login: () => {},
    logout: () => {}
};

export default React.createContext<IAuthContext>(authContextDefaults);
