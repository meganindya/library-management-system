import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const [dataFetched, setDataFetched] = useState(false);
  const [userPending, setUserPending] = useState([]);
  const [userOutstanding, setUserOutstanding] = useState([]);

  const browserHistory = useHistory();

  const parseDate = (isodate: string, addToDate?: number) => {
    let date = new Date(isodate);
    if (addToDate) date.setDate(date.getDate() + addToDate);
    return date.toUTCString();
  };

  const getDiff = (borrowDate: string, returnDate: string): number => {
    return Math.round(
      (new Date(returnDate).valueOf() - new Date(borrowDate).valueOf()) / (1000 * 60 * 60 * 24)
    );
  };

  const getRemainingDays = (borrowDate: string): number => {
    return Math.round(
      (new Date(parseDate(borrowDate, 30)).valueOf() - new Date().valueOf()) / (1000 * 60 * 60 * 24)
    );
  };

  const getRemainingString = (borrowDate: string): string => {
    const remainingDays = getRemainingDays(borrowDate);
    return remainingDays < 0
      ? `${Math.abs(remainingDays)} days overdue`
      : `${remainingDays} days remaining`;
  };

  const getOutstanding = (borrowDate: string, returnDate: string) => {
    return !returnDate
      ? Math.abs(getRemainingDays(borrowDate))
      : getDiff(borrowDate, returnDate) - 30;
  };

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

      setUserPending(
        response.data.transactions
          .filter((transaction: any) => !transaction.returnDate)
          .sort(
            (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
          )
      );

      setUserOutstanding(
        response.data.transactions
          .filter(
            (transaction: any) =>
              (!transaction.returnDate && getRemainingDays(transaction.borrowDate)) ||
              getDiff(transaction.borrowDate, transaction.returnDate) > 30
          )
          .sort(
            (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
          )
      );
    })();
  }, []);

  const returnHandler = async (transID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation returnBook($transID: String!) {
        returnBook(transID: $transID) {
          transID
        }
      }`,
      { transID },
      'Return Failed'
    );

    if (!response) return;

    browserHistory.push('/history');
  };

  return (
    <div id="dashboard-content" className="container">
      <h2>Pending returns</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && (
        <div id="pending-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book ID</th>
                <th>Borrow Date</th>
                <th>Deadline</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {userPending.map((transaction: any, index) => (
                <tr key={`pending-item-${index}`}>
                  <td>{transaction.transID}</td>
                  <td>{transaction.bookID}</td>
                  <td>{parseDate(transaction.borrowDate)}</td>
                  <td>{parseDate(transaction.borrowDate, 30)}</td>
                  <td>
                    <button
                      className={
                        getRemainingDays(transaction.borrowDate) < 0
                          ? 'return-btn-due'
                          : 'return-btn-ok'
                      }
                      onClick={() => returnHandler(transaction.transID)}
                    >
                      {getRemainingString(transaction.borrowDate)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h2>Outstanding transactions</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && (
        <div id="outstanding-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book ID</th>
                <th>Borrow Date</th>
                <th>Return Date</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {userOutstanding.map((transaction: any, index) => (
                <tr key={`outstanding-item-${index}`}>
                  <td>{transaction.transID}</td>
                  <td>{transaction.bookID}</td>
                  <td>{parseDate(transaction.borrowDate)}</td>
                  <td>{!transaction.returnDate ? '-' : parseDate(transaction.returnDate)}</td>
                  <td>{getOutstanding(transaction.borrowDate, transaction.returnDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <div id="pay-outstanding">{totalOutstanding}</div> */}
        </div>
      )}
    </div>
  );
}
