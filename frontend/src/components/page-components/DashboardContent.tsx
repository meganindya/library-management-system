import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IUser } from '../../@types/user';
import { IAwaiting } from '../../@types/awaiting';
import { ITransaction } from '../../@types/transaction';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';
import {
  dateString,
  dueDateMillis,
  outstanding,
  remainingDays,
  remainingDaysString
} from '../../utils/DateUtils';

import BookDetailsModal from '../BookDetailsModal';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const browserHistory = useHistory();

  const [allowedDays, setAllowedDays] = useState(999);
  // set user allowed borrowing days when user type changes
  useEffect(() => {
    if (authContext.type) {
      setAllowedDays(authContext.type === 'Student' ? 30 : 180);
    }
  }, [authContext.type]);

  // -- Data Fetch Operations ----------------------------------------------------------------------

  const [userDetails, setUserDetails] = useState<
    (Pick<IUser, 'userID' | 'email' | 'type' | 'notifications'> & { name: string }) | null
  >(null);
  // fetch user details on mount
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
          notifications {
            bookID
            quantity
          }
        }
      }`,
        { userID: authContext.userID },
        'user details fetch failed'
      );

      if (!response) return;

      const { firstName, middleName, lastName } = response.data.user;
      const name = (
        (firstName.trim() + ' ' + middleName.trim()).trim() +
        ' ' +
        lastName.trim()
      ).trim();

      setUserDetails({
        userID: response.data.user.userID,
        name,
        email: response.data.user.email,
        type: response.data.user.type,
        notifications: response.data.user.notifications
      });
    })();
  }, []);

  const [awaiting, setAwaiting] = useState<IAwaiting[]>([]);
  const [awaitingList, setAwaitingList] = useState<string[]>([]);
  const [awaitingFetched, setAwaitingFetched] = useState(false);
  const [waitingClear, setWaitingClear] = useState<string | null>(null);
  // fetch awaiting transactions on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query awaiting($userID: String!) {
          awaiting(userID: $userID, type: "") {
            book {
              bookID
            }
            type
            createdAt
          }
        }`,
        { userID: authContext.userID },
        'awaiting transactions fetch failed'
      );

      if (!response) return;

      setAwaiting(response.data.awaiting);
      setAwaitingList(
        response.data.awaiting.map((transaction: IAwaiting) => transaction.book.bookID)
      );
      setAwaitingFetched(true);
    })();
  }, []);

  const [userPending, setUserPending] = useState<ITransaction[]>([]);
  const [pendingFetched, setPendingFetched] = useState(false);
  // fetch pending transactions on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query pending($userID: String!) {
          pending(userID: $userID) {
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
        'pending transactions fetch failed'
      );

      if (!response) return;

      if (response.errors) {
        console.error(response.errors[0].message);
      } else {
        setUserPending(response.data.pending);
        setPendingFetched(true);
      }
    })();
  }, []);

  const [userOutstanding, setUserOutstanding] = useState<ITransaction[]>([]);
  const [outstandingFetched, setOutstandingFetched] = useState(false);
  // fetch outstanding transactions on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query outstanding($userID: String!) {
          outstanding(userID: $userID) {
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
        'outstanding transactions fetch failed'
      );

      if (!response) return;

      if (response.errors) {
        console.error(response.errors[0].message);
      } else {
        setUserOutstanding(response.data.outstanding);
        setOutstandingFetched(true);
      }
    })();
  }, []);

  // -- Transient states ---------------------------------------------------------------------------

  const [viewingBookID, setViewingBookID] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);

  // -- Callbacks ----------------------------------------------------------------------------------

  const unsubscribeHandler = async (bookID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation unsubscribe($userID: String!, $bookID: String!) {
        unsubscribe(userID: $userID, bookID: $bookID) {
          bookID
        }
      }`,
      { userID: authContext.userID, bookID },
      ''
    );

    if (!response) return;

    if (response.errors) alert(response.errors.map((err: any) => err.message));
  };

  const clearAwaitingHandler = async (bookID: string): Promise<void> => {
    const response = await fetchGraphQLResponse(
      `mutation clearAwaiting($userID: String!, $bookID: String!) {
          clearAwaiting(userID: $userID, bookID: $bookID) {
            createdAt
          }
        }`,
      { userID: authContext.userID, bookID },
      'awaiting transaction clear failed'
    );

    if (!response) return;

    if (response.errors) alert(response.errors.map((err: any) => err.message));

    setWaitingClear(null);
    browserHistory.push(`/dashboard`);
  };

  const returnHandler = async (bookID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation awaitTransaction($userID: String!, $bookID: String!) {
        awaitTransaction(userID: $userID, bookID: $bookID, type: "return") {
          createdAt
        }
      }`,
      { userID: authContext.userID, bookID },
      'Return Failed'
    );

    if (!response) return;

    if (response.errors) alert(response.errors.map((err: any) => err.message));

    browserHistory.push('/browse');
  };

  // -- Render -------------------------------------------------------------------------------------

  return (
    <div id="dashboard-content" className="container">
      {!userDetails && <div className="rolling-2"></div>}
      {userDetails && (
        <div id="user-details">
          <div id="user-details-type">{userDetails.type === 'Student' ? 'Student' : 'Faculty'}</div>
          <div id="user-details-name">{userDetails.name}</div>
          <div id="user-details-email">{userDetails.email}</div>
        </div>
      )}
      {userDetails && userDetails.notifications.length > 0 && (
        <div id="user-notifications">
          {userDetails.notifications.map((book) => (
            <div
              className="user-notification"
              id={`notification-${book.bookID}`}
              key={`notification-${book.bookID}`}
            >
              {book.quantity > 0 ? (
                <h4 className="user-notification-yes">
                  <span onClick={() => setViewingBookID(book.bookID)}>{book.bookID}</span>
                  is back in shelf
                </h4>
              ) : (
                <h4 className="user-notification-no">
                  <span onClick={() => setViewingBookID(book.bookID)}>{book.bookID}</span>
                  is not in shelf
                </h4>
              )}
              <div
                className="user-notification-remove"
                onClick={() => {
                  let thisElem = document.getElementById(`notification-${book.bookID}`);
                  if (thisElem) thisElem.style.display = 'none';
                  unsubscribeHandler(book.bookID);
                }}
              >
                &times;
              </div>
            </div>
          ))}
        </div>
      )}
      <h2>Awaiting Confirmation</h2>
      {!awaitingFetched && <div className="rolling"></div>}
      {awaitingFetched && awaiting.length > 0 && (
        <div id="user-awaiting-table" className="transaction-table">
          <table>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Created At</th>
                <th>Type</th>
                <th>Cancel</th>
              </tr>
            </thead>
            <tbody>
              {awaiting.map((transaction: IAwaiting, index) => (
                <tr key={`user-awaiting-item-${index}`}>
                  <td className="transaction-book-detail-btn">
                    <span onClick={() => setViewingBookID(transaction.book.bookID)}>
                      {transaction.book.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.createdAt)}</td>
                  <td style={{ fontWeight: 600, color: 'carbon' }}>
                    {transaction.type.toUpperCase()}
                  </td>
                  <td
                    className={
                      `awaiting-clear-btn` +
                      (waitingClear && waitingClear === transaction.book.bookID ? ' waiting' : '')
                    }
                  >
                    <div
                      onClick={() => {
                        if (waitingClear || returning) return;
                        setWaitingClear(transaction.book.bookID);
                        clearAwaitingHandler(transaction.book.bookID);
                      }}
                    >
                      &times;
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {awaitingFetched && awaiting.length === 0 && (
        <div className="no-transaction">No Awaiting Transactions</div>
      )}
      <h2>Pending Returns</h2>
      {!pendingFetched && <div className="rolling"></div>}
      {pendingFetched && userPending.length > 0 && (
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
                  <td
                    className={
                      awaitingList.indexOf(transaction.bookID) !== -1 ? 'awaiting-transID' : ''
                    }
                  >
                    {transaction.transID}
                  </td>
                  <td className="transaction-book-detail-btn">
                    {transaction.book.subscribers.length > 0 && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.borrowDate)}</td>
                  <td>{dateString(dueDateMillis(transaction.borrowDate, allowedDays))}</td>
                  <td>
                    <button
                      className={
                        awaitingList.indexOf(transaction.bookID) === -1
                          ? remainingDays(transaction.borrowDate, allowedDays) < 0
                            ? 'return-btn-due'
                            : 'return-btn-ok'
                          : remainingDays(transaction.borrowDate, allowedDays) < 0
                          ? 'return-btn-awaiting-due'
                          : 'return-btn-awaiting-ok'
                      }
                      onClick={() => {
                        if (
                          returning ||
                          waitingClear ||
                          awaitingList.indexOf(transaction.bookID) !== -1
                        )
                          return;
                        setReturning(transaction.transID);
                        returnHandler(transaction.bookID);
                      }}
                    >
                      {transaction.transID === returning && <div className="rolling-3"></div>}
                      {transaction.transID !== returning &&
                        remainingDaysString(transaction.borrowDate, allowedDays)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pendingFetched && userPending.length === 0 && (
        <div className="no-transaction">No Pending Transactions</div>
      )}
      <h2>Outstanding Transactions</h2>
      {!outstandingFetched && <div className="rolling"></div>}
      {outstandingFetched && userOutstanding.length > 0 && (
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
                  <td className="transaction-book-detail-btn">
                    {transaction.book.subscribers.length > 0 && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.borrowDate)}</td>
                  <td>{!transaction.returnDate ? '-' : dateString(transaction.returnDate)}</td>
                  <td>
                    {outstanding(transaction.borrowDate, transaction.returnDate, allowedDays)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* <div id="pay-outstanding">{totalOutstanding}</div> */}
        </div>
      )}
      {outstandingFetched && userOutstanding.length === 0 && (
        <div className="no-transaction">No Outstanding Transactions</div>
      )}
      {viewingBookID && (document.body.style.overflow = 'hidden') && (
        <BookDetailsModal book={null} bookID={viewingBookID} setBook={setViewingBookID} />
      )}
    </div>
  );
}
