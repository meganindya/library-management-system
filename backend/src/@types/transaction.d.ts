export interface ITransaction {
    transID: string;
    userID: string;
    userKey: string;
    bookID: string;
    bookKey: string;
    borrowDate: string;
    returnDate: string | null;
}
