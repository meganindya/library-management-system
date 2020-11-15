import { IBook } from './book';

export interface ITransaction {
    transID: string;
    userID: string;
    bookID: string;
    borrowDate: string;
    returnDate: string | null;
    book: IBook | Function;
}

export interface ITransactionPG extends Omit<ITransaction, 'book'> {
    borrowDate: Date;
    returnDate: Date | null;
}
