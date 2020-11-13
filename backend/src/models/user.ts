import mongoose from 'mongoose';
import { IUser } from '../@types/user';

const { Schema } = mongoose;

export interface IUserDoc extends IUser, mongoose.Document {
    _doc: IUser;
}

const userSchema = new Schema({
    userID: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
    notifications: { type: [String], required: true }
});

export default mongoose.model<IUserDoc>('User', userSchema);
