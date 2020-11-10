import React, { useContext, useEffect, useState } from 'react';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

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
  const [userHistory, setUserHistory] = useState([]);

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
                  <td>{transaction.bookID}</td>
                  <td>{parseDate(transaction.borrowDate)}</td>
                  <td>{transaction.returnDate ? parseDate(transaction.returnDate) : '-'}</td>
                  <td
                    className={getTransactionStatusStyle(
                      transaction.borrowDate,
                      transaction.returnDate
                    )}
                  >
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
    </div>
  );
}
