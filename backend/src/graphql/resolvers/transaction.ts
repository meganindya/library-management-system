import postgresClient from '../../app';
import User from '../../models/user';

import { ITransaction, ITransactionPG } from '../../@types/transaction';
import { book, unsubscribe } from './book';

// -- Utilities ------------------------------------------------------------------------------------

function transformTransaction(transaction: ITransactionPG): ITransaction {
    return {
        transID: transaction.transID,
        userID: transaction.userID,
        bookID: transaction.bookID,
        borrowDate: transaction.borrowDate.toISOString(),
        returnDate: transaction.returnDate ? transaction.returnDate.toISOString() : null,
        book: async () => await book(transaction.bookID)
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
        await postgresClient.query(
            `SELECT * FROM transactions WHERE "userID" = '${userID}' AND "returnDate" IS NULL`
        )
    ).rows;
    return transformTransactions(transactions);
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
    if (!user) throw new Error('invalid user');

    const pendingTransactions = await pending(userID);
    // check if borrow limit reached
    if (pendingTransactions.length >= (user.type === 'Student' ? 5 : 8))
        throw new Error('borrow limit reached');
    // check if book already pending return
    if (pendingTransactions.find((transaction) => transaction.bookID === bookID))
        throw new Error('book already borrowed');
    // check if book remaining in shelf
    const quantity: number = (
        await postgresClient.query(`SELECT "quantity" FROM shelf WHERE "bookID" = '${bookID}'`)
    ).rows[0].quantity;
    if (quantity === 0) throw new Error('book not in shelf');

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
    await postgresClient.query(
        `UPDATE shelf SET "quantity" = ${quantity - 1} WHERE "bookID" = '${bookID}'`
    );

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
    const quantity: number = (
        await postgresClient.query(`SELECT "quantity" FROM shelf WHERE "bookID" = '${bookID}'`)
    ).rows[0].quantity;
    await postgresClient.query(
        `UPDATE shelf SET "quantity" = ${quantity + 1} WHERE "bookID" = '${bookID}'`
    );

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
