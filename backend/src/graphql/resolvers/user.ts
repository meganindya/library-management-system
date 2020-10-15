import { IUser, IUserInp } from '../../@types/user';
import User, { IUserDoc } from '../../models/user';

export async function user(userID: string): Promise<IUser | null> {
    return await User.findOne({ userID: userID });
}

export async function users(): Promise<IUser[]> {
    return await User.find({});
}

export async function addUser(input: IUserInp): Promise<IUser> {
    const existingUser = await User.findOne({ userID: input.userID });
    if (existingUser) throw new Error('User already exists');

    const user: IUserDoc = new User({ ...input });
    let doc: IUserDoc = await user.save();
    return { ...doc._doc, password: null };
}
