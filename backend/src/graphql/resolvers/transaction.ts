import { ITransaction } from '../../@types/transaction';
import User from '../../models/user';
import Book from '../../models/book';
import Transaction, { ITransactionDoc } from '../../models/transaction';
import { unsubscribe } from './book';

// -- Utilities ------------------------------------------------------------------------------------

function transformTransactions(transactionDocs: ITransactionDoc[]): ITransaction[] {
    const dateString = (date: Date): string => date.toISOString();
    return (
        transactionDocs
            // sort by decreasing order of borrowDate
            .sort(
                (a: ITransactionDoc, b: ITransactionDoc) =>
                    b.borrowDate.getTime() - a.borrowDate.getTime()
            )
            .map((transactionDoc) => ({
                ...transactionDoc._doc,
                borrowDate: dateString(transactionDoc.borrowDate),
                returnDate: transactionDoc.returnDate ? dateString(transactionDoc.returnDate) : null
            }))
    );
}

// -- Query Resolvers ------------------------------------------------------------------------------

export async function transactions(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    return transformTransactions(await Transaction.find({ userID: user.userID }));
}

export async function pending(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    const transactions = await Transaction.find({ userID: user.userID });
    return transformTransactions(transactions.filter((transaction) => !transaction.returnDate));
}

export async function outstanding(userID: string): Promise<ITransaction[]> {
    const user = await User.findOne({ userID });
    if (!user) throw new Error('no user found');
    const transactions = await Transaction.find({ userID });
    return transformTransactions(
        transactions.filter((transaction) => {
            const dueDate = new Date(
                transaction.borrowDate.getTime() +
                    (user.type === 'Student' ? 30 : 180) * 1000 * 60 * 60 * 24
            ).getTime();
            if (!transaction.returnDate) {
                return new Date().getTime() > dueDate;
            } else {
                return transaction.returnDate.getTime() > dueDate;
            }
        })
    );
}

// -- Mutation Resolvers ---------------------------------------------------------------------------

export async function borrowBook(userID: string, bookID: string): Promise<ITransaction> {
    let transID: string = '';
    await Transaction.countDocuments({ transID: /.*/ }, (_, count) => {
        transID = (count + 1).toString().padStart(9, '0');
    });

    const user = await User.findOne({ userID });
    const book = await Book.findOne({ bookID });
    if (!user || !book) throw new Error('invalid user or book');

    const pendingTransactions = await pending(userID);
    // check if borrow limit reached
    if (pendingTransactions.length >= (user.type === 'Student' ? 5 : 8))
        throw new Error('borrow limit reached');
    // check if book already pending return
    if (pendingTransactions.find((transaction) => transaction.bookID === bookID))
        throw new Error('book already borrowed');
    // check if book remaining in shelf
    if (book.quantity <= 0) throw new Error('book not in shelf');

    const transactionDoc: ITransactionDoc = await new Transaction({
        transID,
        userID,
        bookID,
        borrowDate: new Date(),
        returnDate: null
    }).save();

    // unsubscribe userID for bookID
    await unsubscribe(bookID, userID);

    // update book quantity
    await Book.updateOne({ bookID }, { $set: { quantity: book.quantity - 1 } });

    return { ...transactionDoc._doc };
}

export async function returnBook(transID: string): Promise<ITransaction | null> {
    const transaction = await Transaction.findOne({ transID });
    if (!transaction) throw new Error('no transaction found');
    // check if already returned
    if (transaction.returnDate) throw new Error('already returned');

    // update returnDate in transaction
    await Transaction.updateOne({ _id: transaction._id }, { $set: { returnDate: new Date() } });
    const updatedTransaction = await Transaction.findOne({ transID });

    // update book quantity
    const bookDoc = await Book.findOne({ bookID: transaction.bookID });
    if (bookDoc) {
        await Book.updateOne(
            { bookID: transaction.bookID },
            { $set: { quantity: bookDoc.quantity + 1 } }
        );
    }

    return !updatedTransaction ? null : updatedTransaction._doc;
}

// -- Temporary ------------------------------------------------------------------------------------

export async function tempTransactionAction(): Promise<ITransaction[]> {
    return transformTransactions(await Transaction.find({}));
}
