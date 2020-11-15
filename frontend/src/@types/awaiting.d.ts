import { IBook } from './book';
import { IUser } from './user';

export interface IAwaiting {
    user: IUser;
    book: IBook;
    type: string;
    createdAt: string;
}
