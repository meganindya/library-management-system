import { IBook } from './book';
import { IUser } from './user';

export interface IAwaiting {
    user: IUser | Function;
    book: IBook | Function;
    type: string;
    createdAt: string;
}

export interface IAwaitingPG extends IAwaiting {
    userID: string;
    bookID: string;
    createdAt: Date;
}
