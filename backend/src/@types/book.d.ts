import { IAuthor } from './author';

export interface IBook {
    bookID: string;
    title: string;
    category: string;
    abstract: string | null;
    quantity: number;
    authors: IAuthor[] | Function;
    subscribers: string[] | null;
}

export interface IBookInp extends Omit<IBook, 'authors'> {
    authors: string[];
}

export interface ICategory {
    name: string;
    quantity: number;
}
