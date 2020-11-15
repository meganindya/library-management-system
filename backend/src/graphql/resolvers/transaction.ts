import { ITransaction, ITransactionPG } from '../../@types/transaction';
import User from '../../models/user';
import Book from '../../models/book';
import { unsubscribe } from './book';
import postgresClient from '../../app';

// -- Utilities ------------------------------------------------------------------------------------

function transformTransaction(transaction: ITransactionPG): ITransaction {
    return {
        transID: transaction.transID,
        userID: transaction.userID,
        bookID: transaction.bookID,
        borrowDate: transaction.borrowDate.toISOString(),
        returnDate: transaction.returnDate ? transaction.returnDate.toISOString() : null,
        book: async () => await Book.findOne({ bookID: transaction.bookID })
    };
}

function transformTransactions(transactions: ITransactionPG[]): ITransaction[] {
    return (
        transactions
            // sort by decreasing order of borrowDate
            .sort((a, b) => parseInt(b.transID) - parseInt(a.transID))
            .map((transaction) => transformTransaction(transaction))
    );
}

// -- Query Resolvers ------------------------------------------------------------------------------

export async function transactions(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    return transformTransactions(
        (await postgresClient.query(`SELECT * FROM transactions WHERE "userID" = '${userID}'`)).rows
    );
}

export async function pending(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    const transactions: ITransactionPG[] = (
        await postgresClient.query(`SELECT * FROM transactions WHERE "userID" = '${userID}'`)
    ).rows;
    return transformTransactions(transactions.filter((transaction) => !transaction.returnDate));
}

export async function outstanding(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    const transactions: ITransactionPG[] = (
        await postgresClient.query(`SELECT * FROM transactions WHERE "userID" = '${userID}'`)
    ).rows;
    return transformTransactions(
        transactions.filter((transaction) => {
            const dueDate = new Date(
                transaction.borrowDate.getTime() +
                    (user.type === 'Student' ? 30 : 180) * 1000 * 60 * 60 * 24
            ).getTime();
            return !transaction.returnDate
                ? Date.now() > dueDate
                : transaction.returnDate.getTime() > dueDate;
        })
    );
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function borrowBook(userID: string, bookID: string): Promise<ITransaction> {
    const user = await User.findOne({ userID });
    const book = await Book.findOne({ bookID });
    if (!user || !book) throw new Error('invalid user or book');

    const pendingTransactions = await pending(userID);
    // check if borrow limit reached
    if (pendingTransactions.length >= (user.type === 'Student' ? 5 : 8))
        throw new Error('borrow limit reached');
    // check if book already pending return
    if (pendingTransactions.find((transaction) => transaction.bookID === bookID))
        throw new Error('book already borrowed');
    // check if book remaining in shelf
    if (book.quantity <= 0) throw new Error('book not in shelf');

    const transID = ((await postgresClient.query('SELECT * FROM transactions')).rows.length + 1)
        .toString()
        .padStart(9, '0');

    await postgresClient.query(
        `INSERT INTO transactions VALUES ('${transID}', '${userID}', '${bookID}', to_timestamp(${Date.now()} / 1000.0), null)`
    );

    const transaction: ITransactionPG = (
        await postgresClient.query(`SELECT * FROM transactions WHERE "transID" = '${transID}'`)
    ).rows[0];

    // unsubscribe userID for bookID
    await unsubscribe(bookID, userID);

    // update book quantity
    await Book.updateOne({ bookID }, { $set: { quantity: book.quantity - 1 } });

    return transformTransaction(transaction);
}

export async function returnBook(userID: string, bookID: string): Promise<ITransaction | null> {
    const transaction: ITransactionPG = (
        await postgresClient.query(
            `SELECT * FROM transactions WHERE "userID" = ${userID} AND "bookID" = ${bookID}`
        )
    ).rows[0];
    if (!transaction) throw new Error('no transaction found');
    // check if already returned
    if (transaction.returnDate) throw new Error('already returned');

    // update returnDate in transaction
    await postgresClient.query(
        `UPDATE transactions SET returndate = to_timestamp(${Date.now()} / 1000.0) WHERE "transID" = ${
            transaction.transID
        }`
    );

    // update book quantity
    const bookDoc = await Book.findOne({ bookID: transaction.bookID });
    if (bookDoc) {
        await Book.updateOne(
            { bookID: transaction.bookID },
            { $set: { quantity: bookDoc.quantity + 1 } }
        );
    }

    const updatedTransaction: ITransactionPG = (
        await postgresClient.query(
            `SELECT * FROM transactions WHERE "userID" = ${userID} AND "bookID" = ${bookID}`
        )
    ).rows[0];

    return !updatedTransaction ? null : transformTransaction(updatedTransaction);
}

// -- Temporary ------------------------------------------------------------------------------------

export async function tempTransactionAction(): Promise<ITransaction[]> {
    return transformTransactions((await postgresClient.query(`SELECT * FROM transactions`)).rows);
}
