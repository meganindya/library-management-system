import mongoose from 'mongoose';
import { IAuthor } from '../@types/author';

const { Schema } = mongoose;

export interface IAuthorDoc extends IAuthor, mongoose.Document {
    _doc: IAuthor | Promise<IAuthor>;
}

const authorSchema = new Schema({
    name: { type: String, required: true },
    books: { type: [Schema.Types.ObjectId], ref: 'Book', required: false }
});

export default mongoose.model<IAuthorDoc>('Author', authorSchema);
