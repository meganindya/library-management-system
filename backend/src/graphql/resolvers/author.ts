import { IAuthor } from '../../@types/author';
import { IBook } from '../../@types/book';
import Author, { IAuthorDoc } from '../../models/author';
import Book, { IBookDoc } from '../../models/book';

async function transformAuthor(author: IAuthorDoc) {
    let books: IBook[] = [];
    for (let bookID of author.books) {
        const book = await Book.findOne({ _id: bookID });
        if (book) {
            console.log(book.title);
            books.push(book);
        }
    }
    return { ...author._doc, books };
}

export async function authorBooks(nameQuery: string): Promise<IBook[]> {
    const authors = await Author.find({ name: new RegExp(`.*${nameQuery}.*`) });
    let books: IBookDoc[] = [];
    for (let author of authors) {
        for (let bookID of author.books) {
            let book = await Book.findOne({ _id: bookID });
            if (book) books.push(book);
        }
    }
    return books;
}

export async function authors(): Promise<IAuthor[]> {
    const authors = await Author.find({});
    return await Promise.all(
        authors.map(async (author) => transformAuthor(author))
    );
}

export async function addAuthor(name: string): Promise<IAuthor> {
    const author: IAuthorDoc = new Author({
        name,
        books: []
    });
    const doc = await author.save();
    return { ...doc._doc };
}
