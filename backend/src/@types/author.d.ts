import { IBook } from './book';

export interface IAuthor {
    authorID: string;
    name: string;
    books: IBook[] | Function;
}
