import postgresClient from '../../app';
import Author, { IAuthorDoc } from '../../models/author';
import Book from '../../models/book';

import { IAuthor } from '../../@types/author';
import { IBook } from '../../@types/book';

// -- Utilities ------------------------------------------------------------------------------------

async function getBookDocs(bookIDs: string[]): Promise<IBook[]> {
    let books: IBook[] = [];
    for (let bookID of bookIDs) {
        if (typeof bookID !== 'string') continue;
        const book = await Book.findOne({ bookID });
        if (!book) continue;
        const authors: IAuthor[] = [];
        for (let authorID of book.authors) {
            const authorDoc = await Author.findOne({ authorID });
            if (authorDoc) authors.push(await transformAuthor(authorDoc));
        }
        const quantity: number = parseInt(
            (
                await postgresClient.query(
                    `SELECT "quantity" FROM shelf WHERE "bookID" = '${book.bookID}'`
                )
            ).rows[0].quantity
        );
        const subscribers: string[] = (
            await postgresClient.query(
                `SELECT "userID" from notifications WHERE "bookID" = '${book.bookID}'`
            )
        ).rows.map((row) => row.userID);
        books.push({ ...book._doc, authors, quantity, subscribers });
    }
    return books;
}

async function transformAuthor(author: IAuthorDoc): Promise<IAuthor> {
    return { ...author._doc, books: async () => await getBookDocs(author.books) };
}

// -- Query Resolvers ------------------------------------------------------------------------------

// also used by bookSearch of ./books.ts
export async function authorBooks(nameQuery: string): Promise<IBook[]> {
    const authors = await Author.find({ name: new RegExp(`.*${nameQuery}.*`, 'i') });
    let books: IBook[] = [];
    for (let author of authors) books.push(...(await getBookDocs(author.books)));
    return books;
}

// -- Development --------------------------------------------------------------

export async function authors(): Promise<IAuthor[]> {
    const authors = await Author.find({});
    return await Promise.all(authors.map(async (author) => transformAuthor(author)));
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

// -- Development --------------------------------------------------------------

export async function addAuthor(name: string): Promise<IAuthor> {
    let authorID: string = '';
    await Author.countDocuments({ authorID: /.*/ }, (_, count) => {
        authorID = (count + 1).toString().padStart(9, '0');
    });

    const author: IAuthorDoc = new Author({ authorID, name, books: [] });
    const authorDoc = await author.save();
    return { ...authorDoc._doc };
}

// -- Temporary ----------------------------------------------------------------

export async function tempAuthorAction(): Promise<IAuthor[]> {
    const authorDocsNew = await Author.find({});
    return await Promise.all(authorDocsNew.map(async (author) => transformAuthor(author)));
}
