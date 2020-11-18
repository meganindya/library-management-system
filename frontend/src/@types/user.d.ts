import { IBook } from './book';

export interface IUser {
    userID: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    password: string;
    type: string;
    notifications: IBook[];
    borrowedCurr: string[];
    borrowedPrev: string[];
}

export interface IUserAuth {
    userID: string;
    type: string;
    token: string;
    tokenExpiration: number;
}
