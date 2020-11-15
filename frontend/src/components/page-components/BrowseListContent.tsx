import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

import { IBook } from '../../@types/book';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BookDetailsModal from '../BookDetailsModal';
import SearchBar from '../SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';

import AuthContext from '../../context/auth-context';

import './BrowseListContent.scss';

export default function BrowseListContent(props: {
  categories: string[];
  searchQuery: {
    query: string;
    category: string;
    author: boolean;
  };
  resetGlobalSearchQuery: Function;
}) {
  const authContext = useContext(AuthContext);
  const browserHistory = useHistory();

  const [borrowLimit, setBorrowLimit] = useState(-1);
  // update user borrowing limit when user type changes
  useEffect(() => {
    if (authContext.type) {
      setBorrowLimit(authContext.type === 'Student' ? 5 : 8);
    }
  }, [authContext.type]);

  // -- Data Fetch Operations ----------------------------------------------------------------------

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
    })();
  }, []);

  const [searchQuery, setSearchQuery] = useState<{
    query: string;
    category: string;
    author: boolean;
  }>(props.searchQuery);

  const [searchItemsList, setSearchItemsList] = useState<IBook[]>([]);
  const [searchItemListFetched, setSearchItemListFetched] = useState(false);
  // fetch search items list when search query changes
  useEffect(() => {
    (async () => {
      console.log('updating');
      const response = await fetchGraphQLResponse(
        `query bookSearch($query: String!, $author: Boolean!, $category: String!) {
          bookSearch(query: $query, author: $author, category: $category) {
            bookID
            title
            category
            authors {
              name
            }
            abstract
            quantity
          }
        }`,
        { ...searchQuery },
        'book search failed'
      );
      console.log(response);

      if (!response) return;

      console.log('updated');
      setSearchItemsList(
        response.data.bookSearch.map((book: IBook) => ({
          ...book,
          authors: book.authors.map((author) => author.name)
        }))
      );
      setSearchItemListFetched(true);
    })();
  }, [searchQuery.query, searchQuery.category]);

  // -- Callbacks ----------------------------------------------------------------------------------

  const borrowHandler = async (bookID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation awaitTransaction($userID: String!, $bookID: String!) {
        awaitTransaction(userID: $userID, bookID: $bookID, type: "borrow") {
          createdAt
        }
      }`,
      { userID: authContext.userID, bookID: bookID },
      ''
    );

    if (!response) return;

    browserHistory.push('/dashboard');
  };

  const subscribeHandler = async (bookID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation subscribe($userID: String!, $bookID: String!) {
        subscribe(userID: $userID, bookID: $bookID) {
          bookID
        }
      }`,
      { userID: authContext.userID, bookID: bookID },
      ''
    );

    if (!response) return;

    browserHistory.push('/dashboard');
  };

  // -- Transient states ---------------------------------------------------------------------------

  const [viewingBookDetails, setViewingBookDetails] = useState<IBook | null>(null);
  const [borrowingID, setBorrowingID] = useState<string | null>(null);
  const [subscribingID, setSubscribingID] = useState<string | null>(null);

  // -- Render -------------------------------------------------------------------------------------

  return (
    <React.Fragment>
      <div id="search-list-search-container">
        <div className="container">
          <div>
            <div id="search-list-back-to-greet">
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="input-field-icon"
                onClick={() => props.resetGlobalSearchQuery()}
              />
            </div>
            {borrowedCurr.length + awaiting.length >= borrowLimit && (
              <div id="borrow-limit-disclaimer">
                <span>You have reached borrow limit</span>
              </div>
            )}
          </div>
          <div id="search-list-search-bar-wrap">
            <SearchBar
              searchHandler={(query: string, activeSearch: boolean) => {
                setSearchItemListFetched(activeSearch);
                setSearchQuery({
                  query,
                  category: searchQuery.category,
                  author: searchQuery.author
                });
              }}
              initialValue={searchQuery.query}
              activeSearch={false}
            />
            <input
              type="checkbox"
              id="search-author"
              name="author"
              value="Author"
              style={{ marginLeft: '1rem' }}
              checked={searchQuery.author}
              onChange={() => {
                // setSearchItemListFetched(false);
                setSearchQuery({
                  query: searchQuery.query,
                  category: searchQuery.category,
                  author: !searchQuery.author
                });
              }}
            ></input>
            <span style={{ color: 'gray' }}>Author</span>
            <Select
              id="search-category-dropdown"
              options={[
                { value: 'Any Category', label: 'Any Category' },
                ...props.categories.map((category) => ({
                  value: `${category}`,
                  label: `${category}`
                }))
              ]}
              defaultValue={{ value: `${searchQuery.category}`, label: `${searchQuery.category}` }}
              onChange={(option: any) => {
                if (option) {
                  setSearchItemListFetched(false);
                  setSearchQuery({
                    query: searchQuery.query,
                    category: option.label,
                    author: searchQuery.author
                  });
                }
              }}
            ></Select>
          </div>
        </div>
      </div>
      {!searchItemListFetched && <div className="rolling" style={{ marginTop: '3rem' }}></div>}
      {searchItemListFetched && searchItemsList.length === 0 && (
        <h2 id="search-list-no-items" className="container">
          No Items Found
        </h2>
      )}
      {searchItemListFetched && (
        <div id="search-list-items" className="container">
          {searchItemsList.map((searchItem, index) => (
            <div className="search-item-block" key={index}>
              <div className="search-item-graphic"></div>
              <div className="search-item-content">
                <div>
                  <h4 className="search-item-id">Book ID: {searchItem.bookID}</h4>
                  <h1 className="search-item-title">{searchItem.title}</h1>
                  <h4 className="search-item-category">{searchItem.category}</h4>
                  <ul className="search-item-authors">
                    {searchItem.authors.map((author, index) => (
                      <li key={`search-item-author${index}`}>
                        <h4>{author}</h4>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p
                    className="search-item-see-details"
                    onClick={() => setViewingBookDetails(searchItem)}
                  >
                    see details
                  </p>
                  <div className="search-item-button-wrap">
                    {searchItem.quantity > 0 ? (
                      <h4>
                        In shelf:&nbsp;<b>{searchItem.quantity}</b>
                      </h4>
                    ) : (
                      <h4 style={{ color: 'coral' }}>Not in shelf</h4>
                    )}
                    {borrowedCurr.length >= borrowLimit && (
                      <button style={{ background: 'none', color: 'white' }}>.</button>
                    )}
                    {borrowedPrev.indexOf(searchItem.bookID) !== -1 && (
                      <div className="borrowed-prev">
                        <FontAwesomeIcon icon={faClock} className="input-field-icon" />
                      </div>
                    )}
                    {borrowedCurr.length + awaiting.length < borrowLimit &&
                      searchItem.quantity > 0 &&
                      borrowedCurr.indexOf(searchItem.bookID) === -1 &&
                      awaiting.indexOf(searchItem.bookID) === -1 && (
                        <button
                          className={`search-item-button-bor ${
                            searchItem.bookID === borrowingID ? 'search-item-button-rolling' : ''
                          }`}
                          onClick={() => {
                            if (borrowingID || subscribingID) return;
                            setBorrowingID(searchItem.bookID);
                            borrowHandler(searchItem.bookID);
                          }}
                        >
                          {searchItem.bookID === borrowingID && <div className="rolling-3"></div>}
                          {searchItem.bookID !== borrowingID && (
                            <React.Fragment>
                              BORROW
                              <FontAwesomeIcon icon={faArrowRight} className="input-field-icon" />
                            </React.Fragment>
                          )}
                        </button>
                      )}
                    {borrowedCurr.length + awaiting.length < borrowLimit &&
                      searchItem.quantity > 0 &&
                      borrowedCurr.indexOf(searchItem.bookID) === -1 &&
                      awaiting.indexOf(searchItem.bookID) !== -1 && (
                        <h4 className="search-item-no-btn-text search-item-borrowed">awaited</h4>
                      )}
                    {searchItem.quantity > 0 && borrowedCurr.indexOf(searchItem.bookID) !== -1 && (
                      <h4 className="search-item-no-btn-text search-item-borrowed">borrowed</h4>
                    )}
                    {borrowedCurr.length + awaiting.length < borrowLimit &&
                      searchItem.quantity <= 0 &&
                      notifications.indexOf(searchItem.bookID) === -1 && (
                        <button
                          className={`search-item-button-req ${
                            searchItem.bookID === subscribingID ? 'search-item-button-rolling' : ''
                          }`}
                          onClick={() => {
                            if (borrowingID || subscribingID) return;
                            setSubscribingID(searchItem.bookID);
                            subscribeHandler(searchItem.bookID);
                          }}
                        >
                          {searchItem.bookID === subscribingID && <div className="rolling-3"></div>}
                          {searchItem.bookID !== subscribingID && (
                            <React.Fragment>
                              NOTIFY
                              <FontAwesomeIcon icon={faArrowRight} className="input-field-icon" />
                            </React.Fragment>
                          )}
                        </button>
                      )}
                    {searchItem.quantity <= 0 &&
                      notifications.indexOf(searchItem.bookID) !== -1 && (
                        <h4 className="search-item-no-btn-text search-item-borrowed">borrowed</h4>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {viewingBookDetails && (document.body.style.overflow = 'hidden') && (
        <BookDetailsModal book={viewingBookDetails} bookID={null} setBook={setViewingBookDetails} />
      )}
    </React.Fragment>
  );
}
