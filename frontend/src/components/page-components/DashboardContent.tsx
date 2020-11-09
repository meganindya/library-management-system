import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

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

  const getRemainingDays = (borrowDate: string) => {
    let rdate = new Date(parseDate(borrowDate, 30)).valueOf();
    let cdate = new Date().valueOf();
    return Math.round((rdate - cdate) / (1000 * 60 * 60 * 24));
  };

  const getDiff = (borrowDate: string, returnDate: string) => {
    let bdate = new Date(borrowDate).valueOf();
    let rdate = new Date(returnDate).valueOf();
    return Math.round((rdate - bdate) / (1000 * 60 * 60 * 24));
  };

  const getRemainingString = (borrowDate: string) => {
    const days = getRemainingDays(borrowDate);
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else {
      return `${days} days remaining`;
    }
  };

  useEffect(() => {
    const nameRequestBody = {
      query: `
        query transactions($userID: String!) {
          transactions(userID: $userID) {
            transID
            bookID
            borrowDate
            returnDate
          }
        }
      `,
      variables: {
        userID: authContext.userID // || '11118001'
      }
    };

    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(nameRequestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        setDataFetched(true);
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('failed!');
        }
        return response.json();
      })
      .then((responseData) => {
        if (responseData.data.transactions) {
          const history = responseData.data.transactions;
          let pendingList: any = [],
            outstandingList: any = [];
          history.forEach((historyItem: any) => {
            if (
              historyItem.returnDate === '' ||
              historyItem.returnDate === null
            ) {
              pendingList.push(historyItem);
            }
          });
          setUserPending(
            pendingList.sort(
              (a: any, b: any) =>
                new Date(b.borrowDate).valueOf() -
                new Date(a.borrowDate).valueOf()
            )
          );
          history.forEach((historyItem: any) => {
            if (
              historyItem.returnDate === '' ||
              historyItem.returnDate === null
            ) {
              if (getRemainingDays(historyItem.borrowDate) < 0) {
                outstandingList.push(historyItem);
              }
            } else {
              if (
                getDiff(historyItem.borrowDate, historyItem.returnDate) > 30
              ) {
                outstandingList.push(historyItem);
              }
            }
          });
          setUserOutstanding(
            outstandingList.sort(
              (a: any, b: any) =>
                new Date(b.borrowDate).valueOf() -
                new Date(a.borrowDate).valueOf()
            )
          );
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const returnBook = (transID: string) => {
    const borrowReqBody = {
      query: `
          mutation returnBook($transID: String!) {
            returnBook(transID: $transID) {
              transID
            }
          }`,
      variables: {
        transID
      }
    };

    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(borrowReqBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('failed!');
        }
        return response.json();
      })
      .then((responseData) => {
        if (
          responseData.data.returnBook &&
          responseData.data.returnBook.transID
        ) {
          browserHistory.push('/history');
        } else {
          throw new Error('return failed');
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const calculateOutstanding = (historyItem: any) => {
    let currOutstanding =
      historyItem.returnDate === '' || historyItem.returnDate === null
        ? Math.abs(getRemainingDays(historyItem.borrowDate))
        : getDiff(historyItem.borrowDate, historyItem.returnDate) - 30;

    return currOutstanding;
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
              {userPending.map((historyItem: any, index) => (
                <tr key={`pending-item-${index}`}>
                  <td>{historyItem.transID}</td>
                  <td>{historyItem.bookID}</td>
                  <td>{parseDate(historyItem.borrowDate)}</td>
                  <td>{parseDate(historyItem.borrowDate, 30)}</td>
                  <td>
                    <button
                      className={
                        getRemainingDays(historyItem.borrowDate) < 0
                          ? 'return-btn-due'
                          : 'return-btn-ok'
                      }
                      onClick={() => returnBook(historyItem.transID)}
                    >
                      {getRemainingString(historyItem.borrowDate)}
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
              {userOutstanding.map((historyItem: any, index) => (
                <tr key={`outstanding-item-${index}`}>
                  <td>{historyItem.transID}</td>
                  <td>{historyItem.bookID}</td>
                  <td>{parseDate(historyItem.borrowDate)}</td>
                  <td>
                    {historyItem.returnDate === '' ||
                    historyItem.returnDate === null
                      ? '-'
                      : parseDate(historyItem.returnDate)}
                  </td>
                  <td>{calculateOutstanding(historyItem)}</td>
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
