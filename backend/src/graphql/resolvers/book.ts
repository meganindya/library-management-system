import { IBook, IBookInp, ICategory } from '../../@types/book';
import { IAuthor } from '../../@types/author';
import Book, { IBookDoc } from '../../models/book';
import Author from '../../models/author';
import User from '../../models/user';
import { authorBooks } from './author';
import postgresClient from '../../app';

// -- Utilities ------------------------------------------------------------------------------------

async function getAuthorDocs(authorIDs: string[]): Promise<IAuthor[]> {
    let authors: IAuthor[] = [];
    for (let authorID of authorIDs) {
        if (typeof authorID !== 'string') continue;
        const author = await Author.findOne({ authorID });
        if (!author) continue;
        let books: IBook[] = [];
        for (let bookID of author.books) {
            const bookDoc = await Book.findOne({ bookID });
            if (bookDoc) books.push(await transformBook(bookDoc));
        }
        authors.push({ ...author._doc, books });
    }
    return authors;
}

async function transformBook(book: IBookDoc): Promise<IBook> {
    const quantity: { quantity: number } = (
        await postgresClient.query(`SELECT "quantity" FROM shelf WHERE "bookID" = '${book.bookID}'`)
    ).rows[0];
    return {
        ...book._doc,
        quantity: quantity.quantity,
        authors: async () => await getAuthorDocs(book.authors)
    };
}

// -- Query Resolvers ------------------------------------------------------------------------------

export async function categories(): Promise<ICategory[]> {
    let categories: { [key: string]: number } = {};
    (await Book.find({})).forEach((book) => {
        if (categories[book.category] !== undefined) categories[book.category]++;
        else categories[book.category] = 1;
    });
    return Object.keys(categories).map((name) => ({ name, quantity: categories[name] }));
}

export async function bookSearch(
    query: string,
    author: boolean,
    category: string
): Promise<IBook[]> {
    if (author) {
        let books = await authorBooks(query);
        if (category !== 'any') books = books.filter((book) => book.category === category);
        return books;
    } else {
        let books = await Book.find(category === 'any' ? {} : { category });
        books = books.filter((book) => book.title.match(new RegExp(query, 'i')) !== null);
        return await Promise.all(books.map(async (book) => await transformBook(book)));
    }
}

export async function book(bookID: string): Promise<IBook | null> {
    const bookDoc = await Book.findOne({ bookID });
    return !bookDoc ? null : transformBook(bookDoc);
}

// used by ./user
export async function booksFromIDs(bookIDs: string[]): Promise<IBook[]> {
    return await Promise.all(
        (await Book.find({ bookID: { $in: bookIDs } })).map(
            async (book) => await transformBook(book)
        )
    );
}

// -- Development --------------------------------------------------------------

export async function books(): Promise<IBook[]> {
    const bookDocs = await Book.find({});
    return await Promise.all(bookDocs.map(async (book) => transformBook(book)));
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function subscribe(bookID: string, userID: string): Promise<void> {
    if (
        (await postgresClient.query(`SELECT "quantity" FROM shelf WHERE "bookID" = '${bookID}'`))
            .rows[0] > 0
    )
        throw new Error('book already in shelf');

    if (
        (
            await postgresClient.query(
                `SELECT * FROM notifications WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
            )
        ).rows.length > 0
    )
        throw new Error('user already subscribed');

    await postgresClient.query(`INSERT INTO notifications VALUES ('${userID}', '${bookID}')`);
}

export async function unsubscribe(bookID: string, userID: string): Promise<void> {
    if (
        (
            await postgresClient.query(
                `SELECT * FROM notifications WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
            )
        ).rows.length === 0
    )
        throw new Error('user already unsubscribed');

    await postgresClient.query(
        `DELETE FROM notifications WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
    );
}

// -- Development --------------------------------------------------------------

export async function addBook(input: IBookInp): Promise<IBook> {
    // book with bookID already exists
    if (await Book.findOne({ bookID: input.bookID })) throw new Error('Book already exists');

    const book: IBookDoc = new Book({ ...input, subscribers: [] });
    const bookDoc: IBookDoc = await book.save();

    // update books lists for corresponding authors
    for (let authorID of input.authors) {
        if (typeof authorID !== 'string') continue;
        const author = await Author.findOne({ authorID });
        if (!author) continue;
        let books = author.books;
        books.push(bookDoc.bookID);
        await Author.updateOne({ _id: authorID }, { books });
    }

    return { ...bookDoc._doc };
}

// -- Temporary ----------------------------------------------------------------

export async function tempBookAction(): Promise<IBook[]> {
    const books = (await Book.find({})).map((book) => book.bookID);
    for (let bookID of books) {
        await Book.updateOne({ bookID }, { $unset: { quantity: 1, subscribers: 1 } });
    }

    const users = (await User.find({})).map((user) => user.userID);
    for (let userID of users) {
        await User.updateOne({ userID }, { $unset: { notifications: 1 } });
    }

    const bookDocsNew = await Book.find({});
    return await Promise.all(bookDocsNew.map(async (book) => transformBook(book)));
}
