import React, { useContext, useEffect, useState } from 'react';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BookDetailsModal from '../BookDetailsModal';

import AuthContext from '../../context/auth-context';

import './HistoryContent.scss';

export default function HistoryContent() {
  const authContext = useContext(AuthContext);
  const [allowedDays, setAllowedDays] = useState(-1);
  useEffect(() => {
    if (authContext.type) {
      setAllowedDays(authContext.type === 'Student' ? 30 : 180);
    }
  }, [authContext.type]);

  const [dataFetched, setDataFetched] = useState(false);
  const [userHistory, setUserHistory] = useState<
    { transID: string; bookID: string; borrowDate: string; returnDate: string | null }[]
  >([]);
  const [notificationStatus, setNotificationStatus] = useState<{ [key: string]: boolean }>({});
  const [viewingBookID, setViewingBookID] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query transactions($userID: String!) {
          transactions(userID: $userID) {
            transID
            bookID
            borrowDate
            returnDate
          }
        }`,
        { userID: authContext.userID },
        'Transactions Fetch Failed'
      );

      if (!response) return;

      setDataFetched(true);

      setUserHistory(
        response.data.transactions.sort(
          (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
        )
      );

      const getSubscriptionStatus = async (bookID: string): Promise<boolean> => {
        const response = await fetchGraphQLResponse(
          `query book($bookID: String!) {
          book(bookID: $bookID) {
            subscribers
          }
        }`,
          { bookID },
          'Subscription Status Fetch Failed'
        );

        if (!response) return false;

        return response.data.book.subscribers.length > 0;
      };

      const notificationStatusObj: { [key: string]: boolean } = {};
      for (let transaction of response.data.transactions) {
        if (!transaction.returnDate) {
          notificationStatusObj[transaction.bookID] = await getSubscriptionStatus(
            transaction.bookID
          );
        }
      }
      setNotificationStatus(notificationStatusObj);
    })();
  }, []);

  const parseDate = (isodate: string) => new Date(isodate).toUTCString();

  const getTransactionStatusStyle = (
    borrowDateISO: string,
    returnDateISO: string | null
  ): string => {
    const borrowDateMills = new Date(borrowDateISO).valueOf();
    let dueDate = new Date(borrowDateISO);
    dueDate.setDate(dueDate.getDate() + allowedDays);
    const dueDateMills = dueDate.valueOf();
    const returnDateMills = returnDateISO ? new Date(returnDateISO).valueOf() : null;

    if (returnDateMills) {
      return (returnDateMills - borrowDateMills) / (1000 * 60 * 60 * 24) > allowedDays
        ? 'status-returned-overdue'
        : 'status-returned';
    } else {
      return new Date().valueOf() - dueDateMills > 0 ? 'status-pending-overdue' : 'status-pending';
    }
  };

  const getRemainingDays = (borrowDate: string): number | null => {
    const parseDate = (isodate: string, addToDate?: number) => {
      let date = new Date(isodate);
      if (addToDate) date.setDate(date.getDate() + addToDate);
      return date.toUTCString();
    };
    const days = Math.round(
      (new Date(parseDate(borrowDate, allowedDays)).valueOf() - new Date().valueOf()) /
        (1000 * 60 * 60 * 24)
    );
    return days <= 5 && days >= 0 ? days : null;
  };

  return (
    <div id="history-content" className="container">
      <h2>History of transactions</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && userHistory.length > 0 && (
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
              {userHistory.map((transaction: any, index) => (
                <tr key={`history-item-${index}`}>
                  <td>{transaction.transID}</td>
                  <td className="transaction-book-detail-btn">
                    {notificationStatus[transaction.bookID] && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{parseDate(transaction.borrowDate)}</td>
                  <td>{transaction.returnDate ? parseDate(transaction.returnDate) : '-'}</td>
                  <td
                    className={getTransactionStatusStyle(
                      transaction.borrowDate,
                      transaction.returnDate
                    )}
                  >
                    {getRemainingDays(transaction.borrowDate) && (
                      <div className="history-days-warning">
                        {getRemainingDays(transaction.borrowDate)}
                      </div>
                    )}
                    {transaction.returnDate ? 'returned' : 'pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dataFetched && userHistory.length === 0 && (
        <div className="no-transaction">No Transaction History</div>
      )}
      {viewingBookID && (document.body.style.overflow = 'hidden') && (
        <BookDetailsModal book={null} bookID={viewingBookID} setBook={setViewingBookID} />
      )}
    </div>
  );
}
