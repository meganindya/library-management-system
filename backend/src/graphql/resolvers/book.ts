import { IBook, IBookInp, ICategory } from '../../@types/book';
import { IAuthor } from '../../@types/author';
import Book, { IBookDoc } from '../../models/book';
import Author from '../../models/author';
import User from '../../models/user';
import { authorBooks } from './author';

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
    return { ...book._doc, authors: async () => await getAuthorDocs(book.authors) };
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
    queryString: string,
    author: boolean,
    category: string
): Promise<IBook[]> {
    if (author) {
        let books = await authorBooks(queryString);
        if (category !== 'any') books = books.filter((book) => book.category === category);
        return books;
    } else {
        let books = await Book.find(category === 'any' ? {} : { category });
        books = books.filter((book) => book.title.match(new RegExp(queryString, 'i')) !== null);
        return await Promise.all(books.map(async (book) => await transformBook(book)));
    }
}

export async function book(bookID: string): Promise<IBook | null> {
    const bookDoc = await Book.findOne({ bookID });
    return !bookDoc ? null : transformBook(bookDoc);
}

// -- Development --------------------------------------------------------------

export async function books(): Promise<IBook[]> {
    const bookDocs = await Book.find({});
    return await Promise.all(bookDocs.map(async (book) => transformBook(book)));
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function subscribe(bookID: string, userID: string): Promise<IBook | null> {
    const book = await Book.findOne({ bookID });
    const user = await User.findOne({ userID });
    if (!book || !user) throw new Error('invalid book or user');

    if (book.quantity > 0) throw new Error('book already in shelf');

    if (book.subscribers.indexOf(userID) !== -1 || user.notifications.indexOf(bookID) !== -1)
        throw new Error('user already subscribed');

    await Book.updateOne({ bookID }, { $set: { subscribers: [...book.subscribers, userID] } });
    await User.updateOne({ userID }, { $set: { notifications: [...user.notifications, bookID] } });

    const bookDoc = await Book.findOne({ bookID });
    return !bookDoc ? null : transformBook(bookDoc);
}

export async function unsubscribe(bookID: string, userID: string): Promise<IBook | null> {
    const book = await Book.findOne({ bookID });
    const user = await User.findOne({ userID });
    if (!user || !book) throw new Error('invalid user or book');

    if (book.subscribers.indexOf(userID) === -1 && user.notifications.indexOf(bookID) === -1)
        throw new Error('user already unsubscribed');

    await Book.updateOne(
        { bookID },
        {
            $set: { subscribers: book.subscribers.splice(book.subscribers.indexOf(userID), 1) }
        }
    );
    await User.updateOne(
        { userID },
        {
            $set: {
                notifications: user.notifications.splice(user.notifications.indexOf(bookID), 1)
            }
        }
    );

    const bookDoc = await Book.findOne({ bookID });
    return !bookDoc ? null : transformBook(bookDoc);
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
    // const bookDocs = await Book.find({});
    // for (let i in bookDocs) {
    //     const bookDoc = bookDocs[i];
    //     const authorIDs: string[] = [];
    //     for (let authorID of bookDoc.authors) {
    //         if (typeof authorID !== 'string') continue;
    //         authorIDs.push('A' + authorID.substring(1));
    //     }
    //     console.log(authorIDs);
    //     await Book.updateOne({ bookID: bookDoc.bookID }, { $set: { authors: authorIDs } });
    // }

    // const bookDocs = await Book.find({});
    // for (let bookDoc of bookDocs) {
    //     await Book.updateOne({ bookID: bookDoc.bookID }, { $set: { subscribers: [] } });
    // }

    const bookDocsNew = await Book.find({});
    return await Promise.all(bookDocsNew.map(async (book) => transformBook(book)));
}
