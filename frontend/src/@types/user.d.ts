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
    borrowedCurr: string[] | null;
    borrowedPrev: string[] | null;
}

export interface IUserAuth {
    userID: string;
    type: string;
    token: string;
    tokenExpiration: int;
}
