import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import postgresClient from '../../app';
import User, { IUserDoc } from '../../models/user';

import { IUser, IUserAuth } from '../../@types/user';
import { ITransactionPG } from '../../@types/transaction';
import { booksFromIDs } from './book';

// -- Utilities ------------------------------------------------------------------------------------

async function borrowedCurr(userID: string): Promise<string[]> {
    return (
        await postgresClient.query(
            `SELECT "bookID" from transactions WHERE "userID" = '${userID}' AND "returnDate" IS NULL`
        )
    ).rows.map((transaction: Pick<ITransactionPG, 'bookID'>) => transaction.bookID);
}

async function borrowedPrev(userID: string): Promise<string[]> {
    return (
        await postgresClient.query(
            `SELECT "bookID" from transactions WHERE "userID" = '${userID}' AND "returnDate" IS NOT NULL`
        )
    ).rows.map((transaction: Pick<ITransactionPG, 'bookID'>) => transaction.bookID);
}

// -- Query Resolvers ------------------------------------------------------------------------------

export async function login(userID: string, password: string): Promise<IUserAuth> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('user does not exist');
    // check password hash match
    if (!(await bcrypt.compare(password, user.password))) throw new Error('password is incorrect');
    // generate token
    const token = jwt.sign({ userID, email: user.email }, 'privatekey', { expiresIn: '1h' });
    return { userID, type: user.type, token, tokenExpiration: 1 };
}

export async function user(userID: string): Promise<Partial<IUser> | null> {
    // find user with userID: `userID`
    const user = await User.findOne({ userID });
    const notifications = (
        await postgresClient.query(
            `SELECT "bookID" FROM notifications WHERE "userID" = '${userID}'`
        )
    ).rows.map((row: { bookID: string }) => row.bookID);
    return !user
        ? null
        : {
              ...user._doc,
              password: '',
              borrowedCurr: async () => await borrowedCurr(userID),
              borrowedPrev: async () => await borrowedPrev(userID),
              notifications: async () => await booksFromIDs(notifications)
          };
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

// -- Development --------------------------------------------------------------

export async function addUser(input: IUser): Promise<IUser> {
    // check if userID exists
    if (await User.findOne({ userID: input.userID })) throw new Error('user already exists');
    // hash password with 12 rounds of salting
    const hashedPass = await bcrypt.hash(input.password, 12);
    const user: IUserDoc = new User({ ...input, password: hashedPass });
    let userDoc: IUserDoc = await user.save();
    return { ...userDoc._doc, password: '', notifications: [] };
}

// -- Temporary ----------------------------------------------------------------

export async function tempUserAction(): Promise<IUser[]> {
    return (await User.find({})).map((user) => ({
        ...user,
        borrowedCurr: [],
        borrowedPrev: [],
        notifications: []
    }));
}
