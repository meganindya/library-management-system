import { IBook } from '../../@types/book';
import Book, { IBookDoc } from '../../models/book';

export async function bookSearch(queryString: string): Promise<IBook[]> {
    return await Book.find({ title: new RegExp(`.*${queryString}.*`) });
}

export async function book(bookID: string): Promise<IBook | null> {
    return await Book.findOne({ bookID: bookID });
}

export async function books(): Promise<IBook[]> {
    return await Book.find({});
}

export async function addBook(input: IBook): Promise<IBook> {
    const existingBook = await Book.findOne({ bookID: input.bookID });
    console.log(existingBook);
    if (existingBook) throw new Error('Book already exists');
    const book: IBookDoc = new Book({ ...input });
    const doc: IBookDoc = await book.save();
    return { ...doc._doc };
}
