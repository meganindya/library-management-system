import mongoose from 'mongoose';
import { ITransaction } from '../@types/transaction';

const { Schema } = mongoose;

export interface ITransactionDoc extends ITransaction, mongoose.Document {
    _doc: ITransaction;
}

const transactionSchema = new Schema({
    transID: { type: String, required: true },
    userID: { type: String, required: true },
    userKey: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    bookID: { type: String, required: true },
    bookKey: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    },
    borrowDate: { type: String, required: true },
    returnDate: { type: String, required: false }
});

export default mongoose.model<ITransactionDoc>('Transaction', transactionSchema);
