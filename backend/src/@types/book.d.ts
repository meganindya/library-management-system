import { IAuthor } from './author';

export interface IBook {
    bookID: string;
    title: string;
    category: string;
    abstract: string | null;
    quantity: int;
    authors: IAuthor[] | string[];
}
