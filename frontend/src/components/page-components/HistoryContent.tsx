import React, { useContext, useEffect, useState } from 'react';

import { ITransaction } from '../../@types/transaction';

// -- Utilities ------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../../utils/HttpUtils';
import { dateString, outstanding, remainingDays } from '../../utils/DateUtils';

// -- Subcomponents --------------------------------------------------------------------------------

import BookDetailsModal from '../BookDetailsModal';

// -- Context --------------------------------------------------------------------------------------

import AuthContext from '../../context/auth-context';

// -- Stylesheet -----------------------------------------------------------------------------------

import './HistoryContent.scss';

// -- Components -----------------------------------------------------------------------------------

export default function HistoryContent() {
  const authContext = useContext(AuthContext);

  const [allowedDays, setAllowedDays] = useState(999);
  // set user allowed borrowing days when user type changes
  useEffect(() => {
    if (authContext.type) {
      setAllowedDays(authContext.type === 'Student' ? 30 : 180);
    }
  }, [authContext.type]);

  // -- Data Fetch Operations --------------------------------------------------

  const [userHistory, setUserHistory] = useState<(ITransaction & { remaining: number })[]>([]);
  const [historyFetched, setHistoryFetched] = useState(false);
  // fetch user transaction history on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query transactions($userID: String!) {
          transactions(userID: $userID) {
            transID
            bookID
            borrowDate
            returnDate
            book {
              subscribers
            }
          }
        }`,
        { userID: authContext.userID },
        'Transactions Fetch Failed'
      );

      if (!response) return;

      setUserHistory(
        response.data.transactions
          .map((transaction: ITransaction) => ({
            ...transaction,
            remaining: remainingDays(
              transaction.borrowDate,
              authContext.type === 'Student' ? 30 : 180
            )
          }))
          .sort(
            (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
          )
      );
      setHistoryFetched(true);
    })();
  }, []);

  // -- Date operations --------------------------------------------------------

  const getTransactionStatusStyle = (
    borrowDateISO: string,
    returnDateISO: string | null
  ): string => {
    return !returnDateISO
      ? remainingDays(borrowDateISO, allowedDays) >= 0
        ? 'status-pending'
        : 'status-pending-overdue'
      : outstanding(borrowDateISO, returnDateISO, allowedDays) > 0
      ? 'status-returned-overdue'
      : 'status-returned';
  };

  // -- Transient states -------------------------------------------------------

  const [viewingBookID, setViewingBookID] = useState<string | null>(null);

  // -- Render -----------------------------------------------------------------

  return (
    <div id="history-content" className="container">
      <h2>History of transactions</h2>
      {!historyFetched && <div className="rolling"></div>}
      {historyFetched && userHistory.length > 0 && (
        <div id="history-table" className="transaction-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book ID</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userHistory.map((transaction, index) => (
                <tr key={`history-item-${index}`}>
                  <td>{transaction.transID}</td>
                  <td className="transaction-book-detail-btn">
                    {!transaction.returnDate && transaction.book.subscribers.length > 0 && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.borrowDate)}</td>
                  <td>{transaction.returnDate ? dateString(transaction.returnDate) : '-'}</td>
                  <td
                    className={getTransactionStatusStyle(
                      transaction.borrowDate,
                      transaction.returnDate
                    )}
                  >
                    {!transaction.returnDate &&
                      transaction.remaining >= 0 &&
                      transaction.remaining <= 5 && (
                        <div className="history-days-warning">{transaction.remaining}</div>
                      )}
                    {transaction.returnDate ? 'returned' : 'pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {historyFetched && userHistory.length === 0 && (
        <div className="no-transaction">No Transaction History</div>
      )}
      {viewingBookID && (document.body.style.overflow = 'hidden') && (
        <BookDetailsModal book={null} bookID={viewingBookID} setBook={setViewingBookID} />
      )}
    </div>
  );
}
