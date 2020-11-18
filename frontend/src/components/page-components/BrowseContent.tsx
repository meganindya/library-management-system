import React, { useContext, useEffect, useState } from 'react';

import { IUser } from '../../@types/user';
import { ICategory } from '../../@types/book';

// -- Utilities ------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

// -- Subcomponents --------------------------------------------------------------------------------

import BrowseGreetContent from './BrowseGreetContent';
import BrowseListContent from './BrowseListContent';

// -- Context --------------------------------------------------------------------------------------

import AuthContext from '../../context/auth-context';
import { IAwaiting } from '../../@types/awaiting';

// -- Component ------------------------------------------------------------------------------------

export default function BrowseContent() {
  const authContext = useContext(AuthContext);

  // -- Data Fetch Operations --------------------------------------------------

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

      if (response.errors) {
        alert(response.errors.map((error: Error) => error.message));
        return;
      }

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

      if (response.errors) {
        alert(response.errors.map((error: Error) => error.message));
      } else {
        const responseData: IUser = response.data.user;
        setNotifications(responseData.notifications.map((notification) => notification.bookID));
        setBorrowedCurr(responseData.borrowedCurr);
        setBorrowedPrev(responseData.borrowedPrev);
      }

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

      if (responseAwaiting.errors) {
        alert(responseAwaiting.errors.map((error: Error) => error.message));
      } else {
        const responseAwaitingData: IAwaiting[] = responseAwaiting.data.awaiting;
        setAwaiting(responseAwaitingData.map((transaction) => transaction.book.bookID));
      }
    })();
  }, []);

  const [searchQuery, setSearchQuery] = useState<{
    query: string;
    category: string;
    author: boolean;
  } | null>(null);

  // -- Render -----------------------------------------------------------------

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
