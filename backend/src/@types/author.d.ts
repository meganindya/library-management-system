import { IBook } from './book';

export interface IAuthor {
    name: string;
    books: IBook[] | string[];
}
