import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../../context/auth-context';

import BrowseGreetContent from './BrowseGreetContent';
import BrowseListContent from './BrowseListContent';

export default function BrowseContent() {
  const authContext = useContext(AuthContext);

  const [categories, setCategories] = useState<string[]>([]);
  const [userBookIDs, setUserBookIDs] = useState<string[]>([]);

  interface IQuery {
    queryString: string;
    queryCategory: string;
  }
  const [searchQuery, setSearchQuery] = useState<IQuery | null>(null);

  useEffect(() => {
    const catReqBody = {
      query: `
        query {
          categories {
            categoryName
          }
        }`
    };

    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(catReqBody),
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
        if (responseData.data.categories) {
          setCategories(
            responseData.data.categories.map(
              (categoryItem: { categoryName: string }) =>
                categoryItem.categoryName
            )
          );
        }
      })
      .catch((e) => {
        console.error(e);
      });

    const userBooksReqBody = {
      query: `
        query transactions($userID: String!) {
          transactions(userID: $userID) {
            bookID
            returnDate
          }
        }`,
      variables: {
        userID: authContext.userID
      }
    };

    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(userBooksReqBody),
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
          setUserBookIDs(
            responseData.data.transactions.filter(
              (entry: { bookID: string; returnDate: string | null }) =>
                entry.returnDate !== null && entry.returnDate !== ''
            )
          );
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return searchQuery ? (
    <BrowseListContent
      categories={categories}
      userBookIDs={userBookIDs}
      searchQuery={searchQuery}
      resetUpperSearchQuery={() => setSearchQuery(null)}
    />
  ) : (
    <BrowseGreetContent
      categories={categories}
      setSearchQuery={setSearchQuery}
    />
  );
}
