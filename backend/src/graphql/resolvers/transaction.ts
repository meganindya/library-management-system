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

    const userOpenTrans = await Transaction.find({ userID });
    let counter = 0;
    userOpenTrans.forEach((trans) => {
        if (trans.returnDate === null || trans.returnDate === '') {
            counter++;
        }
    });
    if (counter === 5) {
        throw new Error('Quota full');
    }
    userOpenTrans.forEach((trans) => {
        if (trans.bookID === bookID) {
            throw new Error('Book already borrowed');
        }
    });

    const bookCount = (await Book.findOne({ bookID }))?.quantity;
    if (!bookCount || bookCount === 0) {
        throw new Error('No more in stock');
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

    await Book.updateOne({ bookID }, { $set: { quantity: bookCount - 1 } });

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

    const bookCount = (await Book.findOne({ bookID: transaction.bookID }))
        ?.quantity;
    await Book.updateOne(
        { bookID: transaction.bookID },
        { $set: { quantity: bookCount + 1 } }
    );

    return !updatedTransaction ? null : updatedTransaction._doc;
}

export async function transactions(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('No User found');
    return await Transaction.find({ userKey: user._id });
}

export async function pending(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('No User found');
    const transAll = await Transaction.find({ userKey: user._id });
    let transPending: ITransaction[] = [];
    transAll.forEach((trans) => {
        if (trans.returnDate === '' || trans.returnDate === null) {
            transPending.push(trans);
        }
    });
    return transPending;
}

export async function outstanding(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('No User found');
    const transAll = await Transaction.find({ userKey: user._id });
    let transPending: ITransaction[] = [];
    transAll.forEach((trans) => {
        if (trans.returnDate === '' || trans.returnDate === null) {
            let bdate = new Date(trans.borrowDate).getMilliseconds();
            let rdate = new Date().getMilliseconds();
            let diff = Math.round((rdate - bdate) / (1000 * 60 * 60 * 24));
            console.log(diff);
            transPending.push(trans);
        }
    });
    return transPending;
}
