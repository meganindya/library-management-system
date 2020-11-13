import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUser, IUserAuth } from '../../@types/user';
import User, { IUserDoc } from '../../models/user';
import Transaction from '../../models/transaction';
import { booksFromIDs } from './book';

// -- Utilities ------------------------------------------------------------------------------------

async function borrowedCurr(userID: string): Promise<string[]> {
    return (await Transaction.find({ userID }))
        .filter((transaction) => !transaction.returnDate)
        .map((transaction) => transaction.bookID);
}

async function borrowedPrev(userID: string): Promise<string[]> {
    return (await Transaction.find({ userID }))
        .filter((transaction) => transaction.returnDate)
        .map((transaction) => transaction.bookID);
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
    const user = await User.findOne({ userID: userID });
    return !user
        ? null
        : {
              ...user._doc,
              password: '',
              borrowedCurr: async () => await borrowedCurr(userID),
              borrowedPrev: async () => await borrowedPrev(userID),
              notifications: async () => await booksFromIDs(user.notifications)
          };
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

// -- Development --------------------------------------------------------------

export async function addUser(input: IUser): Promise<IUser> {
    // check if userID exists
    if (await User.findOne({ userID: input.userID })) throw new Error('user already exists');
    // hash password with 12 rounds of salting
    const hashedPass = await bcrypt.hash(input.password, 12);
    const user: IUserDoc = new User({ ...input, password: hashedPass, notifications: [] });
    let userDoc: IUserDoc = await user.save();
    return {
        ...userDoc._doc,
        password: '',
        notifications: async () => booksFromIDs(userDoc.notifications)
    };
}

// -- Temporary ----------------------------------------------------------------

export async function tempUserAction(): Promise<IUser[]> {
    // const userDocs = await User.find({});
    // for (let userDoc of userDocs) {
    //     await User.updateOne(
    //         { userID: userDoc.userID },
    //         { $set: { notifications: [] }, $unset: { points: 1 } }
    //     );
    // }

    return (await User.find({})).map((user) => ({
        ...user,
        borrowedCurr: [],
        borrowedPrev: [],
        notifications: async () => await booksFromIDs(user.notifications)
    }));
}
