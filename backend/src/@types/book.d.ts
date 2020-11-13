import { IAuthor } from './author';

export interface IBook {
    bookID: string;
    title: string;
    category: string;
    abstract: string | null;
    quantity: int;
    authors: IAuthor[] | Function;
    subscribers: string[];
}

export interface IBookInp extends Omit<IBook, 'authors'> {
    authors: string[];
}

export interface ICategory {
    name: string;
    quantity: number;
}
