import React, { useContext, useEffect, useState } from 'react';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import AuthContext from '../../context/auth-context';

import './HistoryContent.scss';

export default function HistoryContent() {
  const authContext = useContext(AuthContext);
  const [dataFetched, setDataFetched] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

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
      setUserHistory(
        response.data.transactions.sort(
          (a: any, b: any) => new Date(b.borrowDate).valueOf() - new Date(a.borrowDate).valueOf()
        )
      );
    })();
  }, []);

  const parseDate = (isodate: string) => new Date(isodate).toUTCString();

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
                  <td>{historyItem.returnDate ? parseDate(historyItem.returnDate) : '-'}</td>
                  <td style={historyItem.returnDate ? { color: 'green' } : { color: 'red' }}>
                    {historyItem.returnDate ? 'returned' : 'pending'}
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
