import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUser, IUserAuth } from '../../@types/user';
import User, { IUserDoc } from '../../models/user';

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
    return !user ? null : { ...user._doc, password: '' };
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function addUser(input: IUser): Promise<IUser> {
    // check if userID exists
    if (await User.findOne({ userID: input.userID })) throw new Error('user already exists');
    // hash password with 12 rounds of salting
    const hashedPass = await bcrypt.hash(input.password, 12);
    const user: IUserDoc = new User({ ...input, password: hashedPass, points: 0 });
    let userDoc: IUserDoc = await user.save();
    return { ...userDoc._doc, password: '' };
}
