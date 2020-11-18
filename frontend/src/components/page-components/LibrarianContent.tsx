import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IAwaiting } from '../../@types/awaiting';

// -- Utilities ------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../../utils/HttpUtils';
import { dateString } from '../../utils/DateUtils';

// -- Subcomponents --------------------------------------------------------------------------------

import BookDetailsModal from '../BookDetailsModal';

// -- Stylesheet -----------------------------------------------------------------------------------

import './LibrarianContent.scss';

// -- Component ------------------------------------------------------------------------------------

export default function LibrarianContent(props: { pageName: string }) {
  const browserHistory = useHistory();

  // -- Data Fetch Operations --------------------------------------------------

  const [awaiting, setAwaiting] = useState<IAwaiting[]>([]);
  const [awaitingFetched, setAwaitingFetched] = useState(false);
  const [waiting, setWaiting] = useState<{ userID: string; bookID: string; action: string } | null>(
    null
  );
  // fetch awaiting transactions on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query awaiting($userID: String!, $type: String!) {
          awaiting(userID: $userID, type: $type) {
            user {
              userID
            }
            book {
              bookID
            }
            type
            createdAt
          }
        }`,
        {
          userID: '',
          type: props.pageName === 'awaiting' ? '' : props.pageName
        },
        'awaiting transactions fetch failed'
      );

      if (!response) return;

      setAwaiting(response.data.awaiting);
      setAwaitingFetched(true);
    })();
  }, [waiting]);

  // -- Callbacks --------------------------------------------------------------

  const confirmAwaitingHandler = async (userID: string, bookID: string): Promise<void> => {
    const response = await fetchGraphQLResponse(
      `mutation confirmAwaiting($userID: String!, $bookID: String!) {
          confirmAwaiting(userID: $userID, bookID: $bookID) {
            createdAt
          }
        }`,
      { userID, bookID },
      'awaiting transaction confirmation failed'
    );

    if (!response) return;

    setWaiting(null);
    browserHistory.push(`/${props.pageName}`);
  };

  const clearAwaitingHandler = async (userID: string, bookID: string): Promise<void> => {
    const response = await fetchGraphQLResponse(
      `mutation clearAwaiting($userID: String!, $bookID: String!) {
          clearAwaiting(userID: $userID, bookID: $bookID) {
            createdAt
          }
        }`,
      { userID, bookID },
      'awaiting transaction clear failed'
    );

    if (!response) return;

    setWaiting(null);
    browserHistory.push(`/${props.pageName}`);
  };

  // -- Transient states -------------------------------------------------------

  const [viewingBookID, setViewingBookID] = useState<string | null>(null);

  // -- Render -----------------------------------------------------------------

  return (
    <div id="awaiting-content" className="container">
      {props.pageName === 'awaiting' && <h2>All Awaiting Transactions</h2>}
      {props.pageName === 'borrow' && <h2>Awaiting Borrow Transactions</h2>}
      {props.pageName === 'return' && <h2>Awaiting Return Transactions</h2>}
      {!awaitingFetched && <div className="rolling"></div>}
      {awaitingFetched && awaiting.length > 0 && (
        <div id="awaiting-table" className="transaction-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Book ID</th>
                <th>Created</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {awaiting.map((transaction, index) => (
                <tr key={`awaiting-item-${index}`}>
                  <td>{transaction.user.userID}</td>
                  <td className="transaction-book-detail-btn">
                    <span onClick={() => setViewingBookID(transaction.book.bookID)}>
                      {transaction.book.bookID}
                    </span>
                  </td>
                  <td>{dateString(transaction.createdAt)}</td>
                  <td
                    className={
                      `awaiting-confirm-btn` +
                      (waiting &&
                      waiting.action === 'confirm' &&
                      waiting.userID === transaction.user.userID &&
                      waiting.bookID === transaction.book.bookID
                        ? ' waiting'
                        : '')
                    }
                  >
                    <div
                      onClick={() => {
                        if (waiting) return;
                        setWaiting({
                          userID: transaction.user.userID,
                          bookID: transaction.book.bookID,
                          action: 'confirm'
                        });
                        confirmAwaitingHandler(transaction.user.userID, transaction.book.bookID);
                      }}
                    >
                      {transaction.type}
                    </div>
                  </td>
                  <td
                    className={
                      `awaiting-clear-btn` +
                      (waiting &&
                      waiting.action === 'clear' &&
                      waiting.userID === transaction.user.userID &&
                      waiting.bookID === transaction.book.bookID
                        ? ' waiting'
                        : '')
                    }
                  >
                    <div
                      onClick={() => {
                        if (waiting) return;
                        setWaiting({
                          userID: transaction.user.userID,
                          bookID: transaction.book.bookID,
                          action: 'clear'
                        });
                        clearAwaitingHandler(transaction.user.userID, transaction.book.bookID);
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
      {viewingBookID && (document.body.style.overflow = 'hidden') && (
        <BookDetailsModal book={null} bookID={viewingBookID} setBook={setViewingBookID} />
      )}
    </div>
  );
}
