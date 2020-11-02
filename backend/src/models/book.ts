import mongoose from 'mongoose';
import { IBook } from '../@types/book';

const { Schema } = mongoose;

export interface IBookDoc extends IBook, mongoose.Document {
    _doc: IBook | PromiseLike<IBook>;
}

const bookSchema = new Schema({
    bookID: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    abstract: { type: String, required: false },
    quantity: { type: Number, required: true },
    authors: { type: [Schema.Types.ObjectId], ref: 'Author', required: false }
});

export default mongoose.model<IBookDoc>('Book', bookSchema);
