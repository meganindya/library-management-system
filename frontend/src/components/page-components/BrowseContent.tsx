import React, { useContext, useEffect, useState } from 'react';

import { ICategory } from '../../@types/book';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BrowseGreetContent from './BrowseGreetContent';
import BrowseListContent from './BrowseListContent';

import AuthContext from '../../context/auth-context';

export default function BrowseContent() {
  const authContext = useContext(AuthContext);

  // -- Data Fetch Operations ----------------------------------------------------------------------

  const [categories, setCategories] = useState<string[]>([]);
  // fetch list of categories on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query {
          categories {
            name
          }
        }`,
        {},
        'categories fetch failed'
      );

      if (!response) return;

      setCategories(response.data.categories.map((category: ICategory) => category.name));
    })();
  }, []);

  const [notifications, setNotifications] = useState<string[]>([]);
  const [borrowedCurr, setBorrowedCurr] = useState<string[]>([]);
  const [borrowedPrev, setBorrowedPrev] = useState<string[]>([]);
  const [awaiting, setAwaiting] = useState<string[]>([]);
  // fetch subscribed, currently borrowed, and previously borrowed bookIDs on mount
  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query user($userID: String!) {
          user(userID: $userID) {
            notifications {
              bookID
            }
            borrowedCurr
            borrowedPrev
          }
        }`,
        { userID: authContext.userID },
        'borrowed books fetch failed'
      );

      if (!response) return;

      setNotifications(
        response.data.user.notifications.map(
          (notification: { bookID: string }) => notification.bookID
        )
      );
      setBorrowedCurr(response.data.user.borrowedCurr);
      setBorrowedPrev(response.data.user.borrowedPrev);

      const responseAwaiting = await fetchGraphQLResponse(
        `query awaiting($userID: String!) {
          awaiting(userID: $userID, type: "") {
            book {
              bookID
            }
          }
        }`,
        { userID: authContext.userID },
        'awaiting transactions fetch failed'
      );

      if (!responseAwaiting) return;

      setAwaiting(
        responseAwaiting.data.awaiting.map(
          (entry: { book: { bookID: string } }) => entry.book.bookID
        )
      );

      console.log(notifications, borrowedCurr, borrowedPrev, awaiting);
    })();
  }, []);

  const [searchQuery, setSearchQuery] = useState<{
    query: string;
    category: string;
    author: boolean;
  } | null>(null);

  // -- Render -------------------------------------------------------------------------------------

  return searchQuery ? (
    <BrowseListContent
      categories={categories}
      searchQuery={searchQuery}
      resetGlobalSearchQuery={() => setSearchQuery(null)}
      userBooks={{ notifications, borrowedCurr, borrowedPrev, awaiting }}
      borrowLimit={authContext.type === 'Student' ? 5 : 8}
    />
  ) : (
    <BrowseGreetContent categories={categories} setSearchQuery={setSearchQuery} />
  );
}
