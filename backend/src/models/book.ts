import mongoose from 'mongoose';
import { IBook } from '../@types/book';

const { Schema } = mongoose;

export interface IBookDoc extends Omit<IBook, 'authors'>, mongoose.Document {
    authors: string[];
    _doc: IBook;
}

const bookSchema = new Schema({
    bookID: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    abstract: { type: String, required: false },
    authors: { type: [String], required: true }
});

export default mongoose.model<IBookDoc>('Book', bookSchema);
