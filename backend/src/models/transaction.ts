import mongoose from 'mongoose';
import { ITransaction } from '../@types/transaction';

const { Schema } = mongoose;

export interface ITransactionDoc extends ITransaction, mongoose.Document {
    _doc: ITransaction;
}

const transactionSchema = new Schema({
    transID: { type: String, required: true },
    userID: { type: String, required: true },
    bookID: { type: String, required: true },
    borrowDate: { type: String, required: true },
    returnDate: { type: String, required: false }
});

export default mongoose.model<ITransactionDoc>('Transaction', transactionSchema);
