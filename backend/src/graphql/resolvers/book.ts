import { IBook } from '../../@types/book';
import Book, { IBookDoc } from '../../models/book';
import Author from '../../models/author';
import { IAuthor } from '../../@types/author';
import { BookMutations } from '../fields/book';

async function transformBook(book: IBookDoc) {
    let authors: IAuthor[] = [];
    for (let authorID of book.authors) {
        const author = await Author.findOne({ _id: authorID });
        if (author) authors.push(author);
    }
    return { ...book._doc, authors };
}

export async function bookSearch(queryString: string): Promise<IBook[]> {
    const books = await Book.find({ title: new RegExp(`.*${queryString}.*`) });
    return await Promise.all(books.map(async (book) => transformBook(book)));
}

export async function book(bookID: string): Promise<IBook | null> {
    const book = await Book.findOne({ bookID: bookID });
    return !book ? null : transformBook(book);
}

export async function books(): Promise<IBook[]> {
    const books = await Book.find({});
    return await Promise.all(books.map(async (book) => transformBook(book)));
}

export async function categories(): Promise<{ categoryName: string }[]> {
    const books = await Book.find({});
    let categories: string[] = [];
    for (let book of books) {
        if (categories.indexOf(book.category) === -1) {
            categories.push(book.category);
        }
    }
    return categories.map((category) => ({ categoryName: category }));
}

export async function addBook(input: IBook): Promise<IBook> {
    const existingBook = await Book.findOne({ bookID: input.bookID });
    if (existingBook) throw new Error('Book already exists');
    const book: IBookDoc = new Book({ ...input });
    const doc: IBookDoc = await book.save();
    for (let authorID of input.authors) {
        const author = await Author.findOne({ _id: authorID });
        if (!author) continue;
        let books = author.books;
        books.push(doc._id);
        await Author.updateOne({ _id: authorID }, { books });
    }
    return { ...doc._doc };
}
