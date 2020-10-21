import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUser, IUserAuth, IUserInp } from '../../@types/user';
import User, { IUserDoc } from '../../models/user';

export async function login(
    userID: string,
    password: string
): Promise<IUserAuth> {
    const user = await User.findOne({ userID });

    if (!user) {
        throw new Error('User does not exist!');
    }

    const isPassEqual: boolean = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
        throw new Error('Password is incorrect!');
    }

    const token = jwt.sign(
        {
            userID: user.userID,
            email: user.email
        },
        'privatekey',
        {
            expiresIn: '1h'
        }
    );
    return { userID: user.userID, token: token, tokenExpiration: 1 };
}

export async function user(userID: string): Promise<IUser | null> {
    const user = await User.findOne({ userID: userID });
    if (!user) {
        return null;
    }
    return {
        userID: user.userID,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        type: user.type
    };
}

export async function users(): Promise<IUser[]> {
    const users = await User.find({});
    return users.map((user) => ({
        userID: user.userID,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        type: user.type
    }));
}

export async function addUser(input: IUserInp): Promise<IUser> {
    const existingUser = await User.findOne({ userID: input.userID });
    if (existingUser) throw new Error('User already exists');

    const hashedPass = await bcrypt.hash(input.password, 12);
    const user: IUserDoc = new User({ ...input, password: hashedPass });
    let doc: IUserDoc = await user.save();
    return { ...doc._doc, password: '' };
}
