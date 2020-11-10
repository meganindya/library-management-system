import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const [allowedDays, setAllowedDays] = useState(-1);
  useEffect(() => {
    if (authContext.type) {
      setAllowedDays(authContext.type === 'Student' ? 30 : 180);
    }
  }, [authContext.type]);

  const [dataFetched, setDataFetched] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    userID: string;
    name: string;
    email: string;
    type: string;
    points: number;
  } | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [userPending, setUserPending] = useState([]);
  const [userOutstanding, setUserOutstanding] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query user($userID: String!) {
        user(userID: $userID) {
          userID
          firstName
          middleName
          lastName
          email
          type
          points
        }
      }`,
        { userID: authContext.userID },
        'User Details Fetch Failed'
      );

      if (!response) return;

      console.log(response.data.user);

      const { userID, firstName, middleName, lastName, email, type, points } = response.data.user;
      const name = (
        (firstName.trim() + ' ' + middleName.trim()).trim() +
        ' ' +
        lastName.trim()
      ).trim();

      setUserDetails({ userID, name, email, type, points });
    })();
  }, []);

  const browserHistory = useHistory();

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

      setTransactions(response.data.transactions);
    })();
  }, []);

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
      (new Date(parseDate(borrowDate, allowedDays)).valueOf() - new Date().valueOf()) /
        (1000 * 60 * 60 * 24)
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
      : getDiff(borrowDate, returnDate) - allowedDays;
  };

  useEffect(() => {
    setUserPending(
      transactions
        .filter((transaction: any) => !transaction.returnDate)
        .sort(
          (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
        )
    );

    setUserOutstanding(
      transactions
        .filter((transaction: any) =>
          transaction.returnDate
            ? getDiff(transaction.borrowDate, transaction.returnDate) > allowedDays
            : getRemainingDays(transaction.borrowDate) < 0
        )
        .sort(
          (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
        )
    );
  }, [transactions]);

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
      {!userDetails && <div className="rolling-2"></div>}
      {userDetails && (
        <div id="user-details">
          <div id="user-details-type">{userDetails.type === 'Student' ? 'Student' : 'Faculty'}</div>
          <div id="user-details-name">{userDetails.name}</div>
          <div id="user-details-email">{userDetails.email}</div>
          <div id="user-details-points">
            <span>{userDetails.points}</span> points
          </div>
        </div>
      )}
      <h2>Pending returns</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && userPending.length > 0 && (
        <div id="pending-table" className="transaction-table">
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
                  <td>{parseDate(transaction.borrowDate, allowedDays)}</td>
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
      {dataFetched && userPending.length === 0 && (
        <div className="no-transaction">No Pending Transactions</div>
      )}
      <h2>Outstanding transactions</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && userOutstanding.length > 0 && (
        <div id="outstanding-table" className="transaction-table">
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
      {dataFetched && userOutstanding.length === 0 && (
        <div className="no-transaction">No Outstanding Transactions</div>
      )}
    </div>
  );
}
