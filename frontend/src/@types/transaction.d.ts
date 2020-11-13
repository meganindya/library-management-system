import { IBook } from './book';

export interface ITransaction {
    transID: string;
    userID: string;
    bookID: string;
    borrowDate: string;
    returnDate: string | null;
    book: IBook;
}
