import postgresClient from '../../app';

import { IAwaiting, IAwaitingPG } from '../../@types/awaiting';
import { user } from './user';
import { book } from './book';
import { borrowBook, returnBook } from './transaction';

// -- Query Resolvers ------------------------------------------------------------------------------

export async function awaiting(userID: string, type: string): Promise<IAwaiting[]> {
    const transactions: IAwaitingPG[] = (
        await postgresClient.query(
            `SELECT * FROM awaiting` +
                (userID !== '' || type !== '' ? ' WHERE' : '') +
                (userID !== '' ? ` "userID" = '${userID}'` : '') +
                (userID !== '' && type !== '' ? ' AND' : '') +
                (type !== '' ? ` "type" = '${type}'` : '')
        )
    ).rows;
    return await Promise.all(
        transactions.map(async (transaction) => ({
            user: async () => await user(transaction.userID),
            book: async () => await book(transaction.bookID),
            type: transaction.type,
            createdAt: transaction.createdAt.toISOString()
        }))
    );
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function awaitTransaction(
    userID: string,
    bookID: string,
    type: string
): Promise<IAwaiting> {
    await postgresClient.query(
        `INSERT INTO awaiting VALUES ('${userID}', '${bookID}', '${type}', to_timestamp(${Date.now()} / 1000.0))`
    );
    const query = `SELECT * FROM awaiting WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`;
    const transaction: IAwaitingPG = (await postgresClient.query(query)).rows[0];
    return {
        user: async () => await user(transaction.userID),
        book: async () => await book(transaction.bookID),
        type: transaction.type,
        createdAt: transaction.createdAt.toISOString()
    };
}

export async function confirmAwaiting(userID: string, bookID: string): Promise<void> {
    const transaction: IAwaitingPG = (
        await postgresClient.query(
            `SELECT * FROM awaiting WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
        )
    ).rows[0];

    await clearAwaiting(userID, bookID);

    if (transaction.type === 'borrow') {
        await borrowBook(userID, bookID);
    } else {
        await returnBook(userID, bookID);
    }
}

export async function clearAwaiting(userID: string, bookID: string): Promise<void> {
    await postgresClient.query(
        `DELETE FROM awaiting WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
    );

    if (
        (
            await postgresClient.query(
                `SELECT * FROM awaiting WHERE "userID" = '${userID}' AND "bookID" = '${bookID}'`
            )
        ).rows.length > 0
    )
        throw new Error('clear failed');
}
