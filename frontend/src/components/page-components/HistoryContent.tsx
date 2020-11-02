import { faDivide } from '@fortawesome/free-solid-svg-icons';
import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../../context/auth-context';

import './HistoryContent.scss';

export default function HistoryContent() {
  const authContext = useContext(AuthContext);
  const [userHistory, setUserHistory] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

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
        setDataFetched(true);
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('failed!');
        }
        return response.json();
      })
      .then((responseData) => {
        if (responseData.data.transactions) {
          setUserHistory(responseData.data.transactions);
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
    <div id="history-content" className="container">
      <h2>History of transactions</h2>
      {!dataFetched && <div className="rolling"></div>}
      {dataFetched && (
        <div id="history-table">
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
              {userHistory.map((historyItem: any, index) => (
                <tr key={`history-item-${index}`}>
                  <td>{historyItem.transID}</td>
                  <td>{historyItem.bookID}</td>
                  <td>{parseDate(historyItem.borrowDate)}</td>
                  <td>
                    {historyItem.returnDate === ''
                      ? '-'
                      : parseDate(historyItem.returnDate)}
                  </td>
                  <td
                    style={
                      historyItem.returnDate === ''
                        ? { color: 'red' }
                        : { color: 'green' }
                    }
                  >
                    {historyItem.returnDate === '' ? 'pending' : 'returned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
