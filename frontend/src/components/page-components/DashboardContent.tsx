import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const [userPending, setUserPending] = useState([]);
  const [userOutstanding, setUserOutstanding] = useState([]);

  const browserHistory = useHistory();

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
        userID: authContext.userID || '11118001'
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
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('failed!');
        }
        return response.json();
      })
      .then((responseData) => {
        if (responseData.data.transactions) {
          const history = responseData.data.transactions;
          // let pendingOnes: { transID: string; bookID: string }[] = [],
          //   outstandingOnes: any[] = [];
          let pendingList: any = [];
          history.forEach((historyItem: any) => {
            if (
              historyItem.returnDate === '' ||
              historyItem.returnDate === null
            ) {
              pendingList.push(historyItem);
              // let bDate = new Date(historyItem.borrowDate).valueOf();
              // let rDate = new Date().valueOf();
              // let diff = Math.round((rDate - bDate) / (1000 * 60 * 60 * 24));
              // console.log(diff);
              // if (diff > 30) {
              //   outstandingOnes.push(historyItem);
              // } else {
              //   pendingOnes.push(historyItem);
              // }
            }
          });
          setUserPending(
            pendingList.sort(
              (a: any, b: any) =>
                new Date(b.borrowDate).valueOf() -
                new Date(a.borrowDate).valueOf()
            )
          );
          // setUserPending(pendingOnes);
          // setUserOutstanding(outstandingOnes);
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

  const getRemainingString = (borrowDate: string) => {
    const days = getRemainingDays(borrowDate);
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else {
      return `${days} days remaining`;
    }
  };

  return (
    <div id="dashboard-content" className="container">
      <h2>Pending returns</h2>
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
      <h2>Outstanding transactions</h2>
      <div id="outstanding-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Book ID</th>
              <th>Borrow Date</th>
              <th>Deadline</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {userOutstanding.map((historyItem: any, index) => (
              <tr key={`outstanding-item-${index}`}>
                <td>{historyItem.transID}</td>
                <td>{historyItem.bookID}</td>
                <td>{parseDate(historyItem.borrowDate)}</td>
                <td>{parseDate(historyItem.borrowDate)}</td>
                <td>{55}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
