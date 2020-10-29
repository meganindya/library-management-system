import { ITransaction } from '../../@types/transaction';
import User from '../../models/user';
import Book from '../../models/book';
import Transaction, { ITransactionDoc } from '../../models/transaction';

export async function borrowBook(
    userID: string,
    bookID: string
): Promise<ITransaction> {
    let transID: string = '';
    await Transaction.countDocuments({ transID: /.*/ }, (_, count) => {
        transID = (count + 1).toString().padStart(9, '0');
    });

    const user = await User.findOne({ userID });
    const book = await Book.findOne({ bookID });
    if (!user || !book) {
        throw new Error('Invalid user or book');
    }

    const transaction: ITransactionDoc = new Transaction({
        transID,
        userID,
        userKey: user._id,
        bookID,
        bookKey: book._id,
        borrowDate: new Date().toISOString(),
        returnDate: null
    });
    const doc: ITransactionDoc = await transaction.save();
    return { ...doc._doc };
}

export async function returnBook(
    transID: string
): Promise<ITransaction | null> {
    const transaction = await Transaction.findOne({ transID });
    if (!transaction) throw new Error('No Transaction Found');

    if (transaction.returnDate) throw new Error('Already returned');

    await Transaction.updateOne(
        { _id: transaction._id },
        { returnDate: new Date().toISOString() }
    );
    const updatedTransaction = await Transaction.findOne({ transID });
    return !updatedTransaction ? null : updatedTransaction._doc;
}

export async function transactions(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('No User found');
    return await Transaction.find({ userKey: user._id });
}
