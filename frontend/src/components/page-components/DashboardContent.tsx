import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../../context/auth-context';

import './DashboardContent.scss';

export default function DashboardContent() {
  const authContext = useContext(AuthContext);
  const [userPending, setUserPending] = useState([]);
  const [userOutstanding, setUserOutstanding] = useState([]);

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
          let pendingOnes: { transID: string; bookID: string }[] = [],
            outstandingOnes: any[] = [];
          history.forEach((historyItem: any) => {
            if (historyItem.returnDate === '') {
              let bDate = new Date(historyItem.borrowDate);
              let rDate = new Date();
              let diff = Math.round(
                (rDate.getMilliseconds() - bDate.getMilliseconds()) /
                  (1000 * 60 * 60 * 24)
              );
              console.log(diff);
              if (diff > 30) {
                outstandingOnes.push(historyItem);
              } else {
                pendingOnes.push(historyItem);
              }
            }
          });
          // setUserPending(pendingOnes);
          // setUserOutstanding(outstandingOnes);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const parseDate = (isodate: string) => {
    let date = new Date(isodate);
    return date.toUTCString();
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
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {userPending.map((historyItem: any, index) => (
              <tr key={`pending-item-${index}`}>
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
