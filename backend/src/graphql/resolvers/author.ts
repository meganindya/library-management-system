import { IAuthor } from '../../@types/author';
import { IBook } from '../../@types/book';
import Author, { IAuthorDoc } from '../../models/author';
import Book from '../../models/book';

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
        books.push({ ...book._doc, authors });
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
    // const authorDocs = await Author.find({});
    // for (let i in authorDocs) {
    //     const authorDoc = authorDocs[i];
    //     await Author.updateOne(
    //         { _id: authorDoc._id },
    //         { $set: { authorID: 'A' + authorDoc.authorID.substring(1) } }
    //     );
    // }
    const authorDocsNew = await Author.find({});
    return await Promise.all(authorDocsNew.map(async (author) => transformAuthor(author)));
}
