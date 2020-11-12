import mongoose from 'mongoose';
import { ITransaction } from '../@types/transaction';

const { Schema } = mongoose;

export interface ITransactionDoc
    extends Omit<ITransaction, 'borrowDate' | 'returnDate'>,
        mongoose.Document {
    borrowDate: Date;
    returnDate: Date | null;
    _doc: ITransaction;
}

const transactionSchema = new Schema({
    transID: { type: String, required: true },
    userID: { type: String, required: true },
    bookID: { type: String, required: true },
    borrowDate: { type: Date, required: true },
    returnDate: { type: Date, required: false }
});

export default mongoose.model<ITransactionDoc>('Transaction', transactionSchema);
