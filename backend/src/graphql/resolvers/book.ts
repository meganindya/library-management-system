import { IBook, IBookInp } from '../../@types/book';
import { IAuthor } from '../../@types/author';
import Book, { IBookDoc } from '../../models/book';
import Author from '../../models/author';

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

export async function categories(): Promise<{ categoryName: string }[]> {
    let categorySet = new Set<string>();
    (await Book.find({})).forEach((book) => categorySet.add(book.category));
    return [...categorySet].map((category) => ({ categoryName: category }));
}

export async function bookSearch(queryString: string): Promise<IBook[]> {
    const books = await Book.find({ title: new RegExp(`.*${queryString}.*`) });
    return await Promise.all(books.map(async (book) => transformBook(book)));
}

export async function book(bookID: string): Promise<IBook | null> {
    const bookDoc = await Book.findOne({ bookID });
    return !bookDoc ? null : transformBook(bookDoc);
}

export async function books(): Promise<IBook[]> {
    const bookDocs = await Book.find({});
    return await Promise.all(bookDocs.map(async (book) => transformBook(book)));
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function addBook(input: IBookInp): Promise<IBook> {
    // book with bookID already exists
    if (await Book.findOne({ bookID: input.bookID })) throw new Error('Book already exists');

    const book: IBookDoc = new Book({ ...input });
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

// -- Temporary ------------------------------------------------------------------------------------

export async function tempBookAction() {
    const bookDocs = await Book.find({});
    for (let i in bookDocs) {
        const bookDoc = bookDocs[i];
        const authorIDs: string[] = [];
        for (let authorID of bookDoc.authors) {
            if (typeof authorID !== 'string') continue;
            authorIDs.push('A' + authorID.substring(1));
        }
        console.log(authorIDs);
        await Book.updateOne({ bookID: bookDoc.bookID }, { $set: { authors: authorIDs } });
    }
    const bookDocsNew = await Book.find({});
    return await Promise.all(bookDocsNew.map(async (book) => transformBook(book)));
}
