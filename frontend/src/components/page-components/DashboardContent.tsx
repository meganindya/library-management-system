import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IUser } from '../../@types/user';
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
  };

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
      <h2>Pending returns</h2>
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
                  <td>{dateString(dueDateMillis(transaction.borrowDate, allowedDays))}</td>
                  <td>
                    <button
                      className={
                        remainingDays(transaction.borrowDate, allowedDays) < 0
                          ? 'return-btn-due'
                          : 'return-btn-ok'
                      }
                      onClick={() => {
                        setReturning(transaction.transID);
                        returnHandler(transaction.transID);
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
      <h2>Outstanding transactions</h2>
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
