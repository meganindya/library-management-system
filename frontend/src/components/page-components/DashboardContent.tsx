import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BookDetailsModal from '../BookDetailsModal';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const browserHistory = useHistory();

  // -- Data Fetch Operations ----------------------------------------------------------------------

  const [userDetails, setUserDetails] = useState<{
    userID: string;
    name: string;
    email: string;
    type: string;
    notifications: string[];
  } | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{ [key: string]: boolean }>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ [key: string]: boolean }>({});
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
          notifications
        }
      }`,
        { userID: authContext.userID },
        'User Details Fetch Failed'
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

  // get notification status of subscribed books
  useEffect(() => {
    (async () => {
      const getNotificationStatus = async (bookID: string): Promise<boolean> => {
        const response = await fetchGraphQLResponse(
          `query book($bookID: String!) {
          book(bookID: $bookID) {
            quantity
          }
        }`,
          { bookID },
          'Subscription Status Fetch Failed'
        );

        if (!response) return false;

        return response.data.book.quantity > 0;
      };

      if (userDetails) {
        const notificationStatusObj: { [key: string]: boolean } = {};
        for (let bookID of userDetails.notifications) {
          notificationStatusObj[bookID] = await getNotificationStatus(bookID);
        }
        setNotificationStatus(notificationStatusObj);
      }
    })();
  }, [userDetails]);

  const [pendingFetched, setPendingFetched] = useState(false);
  const [userPending, setUserPending] = useState<
    {
      transID: string;
      bookID: string;
      borrowDate: string;
      returnDate: string | null;
    }[]
  >([]);
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
          }
        }`,
        { userID: authContext.userID },
        'Pending Transactions Fetch Failed'
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

  const [outstandingFetched, setOutstandingFetched] = useState(false);
  const [userOutstanding, setUserOutstanding] = useState<
    {
      transID: string;
      bookID: string;
      borrowDate: string;
      returnDate: string | null;
    }[]
  >([]);
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
          }
        }`,
        { userID: authContext.userID },
        'Outstanding Transactions Fetch Failed'
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

  useEffect(() => {
    (async () => {
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

      if (userPending && userOutstanding) {
        const subscriptionStatusObj: { [key: string]: boolean } = {};
        for (let transaction of [...userPending, ...userOutstanding]) {
          subscriptionStatusObj[transaction.bookID] = await getSubscriptionStatus(
            transaction.bookID
          );
        }
        setSubscriptionStatus(subscriptionStatusObj);
      }
    })();
  }, [userPending, userOutstanding]);

  // -----------------------------------------------------------------------------------------------

  const [allowedDays, setAllowedDays] = useState(999);
  useEffect(() => {
    if (authContext.type) {
      setAllowedDays(authContext.type === 'Student' ? 30 : 180);
    }
  }, [authContext.type]);

  const [viewingBookID, setViewingBookID] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);

  // -- Date Operations ----------------------------------------------------------------------------

  const dayMillis = 24 * 60 * 60 * 1000;

  const dateString = (isodate: string | number): string => new Date(isodate).toUTCString();

  const inMillis = (isodate: string | number): number => new Date(isodate).getTime();

  const dueDateMillis = (borrowDate: string): number => {
    return inMillis(inMillis(borrowDate) + allowedDays * dayMillis);
  };

  const remainingDays = (borrowDate: string): number => {
    return Math.round((dueDateMillis(borrowDate) - new Date().getTime()) / dayMillis);
  };

  const remainingDaysString = (borrowDate: string): string => {
    const remaining = remainingDays(borrowDate);
    return `${Math.abs(remaining)} days ${remaining < 0 ? 'overdue' : 'remaining'}`;
  };

  const outstanding = (borrowDate: string, returnDate: string | null): number => {
    return !returnDate
      ? Math.abs(remainingDays(borrowDate))
      : Math.round((inMillis(returnDate) - dueDateMillis(borrowDate)) / dayMillis);
  };

  // -----------------------------------------------------------------------------------------------

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
          {userDetails.notifications.map((bookID) => (
            <div className="user-notification" id={`notification-${bookID}`}>
              {notificationStatus[bookID] ? (
                <h4 className="user-notification-yes">
                  <span onClick={() => setViewingBookID(bookID)}>{bookID}</span>is back in shelf
                </h4>
              ) : (
                <h4 className="user-notification-no">
                  <span onClick={() => setViewingBookID(bookID)}>{bookID}</span>is not in shelf
                </h4>
              )}
              <div
                className="user-notification-remove"
                onClick={() => {
                  let thisElem = document.getElementById(`notification-${bookID}`);
                  if (thisElem) thisElem.style.display = 'none';
                  unsubscribeHandler(bookID);
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
                    {subscriptionStatus[transaction.bookID] && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.borrowDate)}</td>
                  <td>{dateString(dueDateMillis(transaction.borrowDate))}</td>
                  <td>
                    <button
                      className={
                        remainingDays(transaction.borrowDate) < 0
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
                        remainingDaysString(transaction.borrowDate)}
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
                    {subscriptionStatus[transaction.bookID] && (
                      <div className="book-requested"></div>
                    )}
                    <span onClick={() => setViewingBookID(transaction.bookID)}>
                      {transaction.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.borrowDate)}</td>
                  <td>{!transaction.returnDate ? '-' : dateString(transaction.returnDate)}</td>
                  <td>{outstanding(transaction.borrowDate, transaction.returnDate)}</td>
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
