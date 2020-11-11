import mongoose from 'mongoose';
import { IAuthor } from '../@types/author';

const { Schema } = mongoose;

export interface IAuthorDoc extends Omit<IAuthor, 'books'>, mongoose.Document {
    books: string[];
    _doc: IAuthor;
}

const authorSchema = new Schema({
    authorID: { type: String, required: true },
    name: { type: String, required: true },
    books: { type: [String], required: true }
});

export default mongoose.model<IAuthorDoc>('Author', authorSchema);
