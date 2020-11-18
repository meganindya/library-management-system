import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

import { IBook } from '../../@types/book';

// -- Utilities ------------------------------------------------------------------------------------

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

// -- Subcomponents --------------------------------------------------------------------------------

import BookDetailsModal from '../BookDetailsModal';
import SearchBar from '../SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';

// -- Context --------------------------------------------------------------------------------------

import AuthContext from '../../context/auth-context';

// -- Stylesheet -----------------------------------------------------------------------------------

import './BrowseListContent.scss';

// -- Component ------------------------------------------------------------------------------------

export default function BrowseListContent(props: {
  categories: string[];
  searchQuery: {
    query: string;
    category: string;
    author: boolean;
  };
  resetGlobalSearchQuery: Function;
  userBooks: {
    notifications: string[];
    borrowedCurr: string[];
    borrowedPrev: string[];
    awaiting: string[];
  };
  borrowLimit: number;
}) {
  const authContext = useContext(AuthContext);
  const browserHistory = useHistory();

  const [notifications] = useState<string[]>(props.userBooks.notifications);
  const [borrowedCurr] = useState<string[]>(props.userBooks.borrowedCurr);
  const [borrowedPrev] = useState<string[]>(props.userBooks.borrowedPrev);
  const [awaiting] = useState<string[]>(props.userBooks.awaiting);

  // -- Data Fetch Operations --------------------------------------------------

  const [searchQuery, setSearchQuery] = useState<{
    query: string;
    category: string;
    author: boolean;
  }>(props.searchQuery);

  const [searchItemsList, setSearchItemsList] = useState<(IBook & { actionState: string })[]>([]);
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

      if (!response) return;

      console.log('updated');

      const findState = (bookID: string, quantity: number): string => {
        let state = '';
        if (
          awaiting.indexOf(bookID) === -1 &&
          borrowedCurr.indexOf(bookID) === -1 &&
          notifications.indexOf(bookID) === -1
        ) {
          if (awaiting.length + borrowedCurr.length < props.borrowLimit) {
            state = quantity > 0 ? 'borrowable' : 'notifiable';
          }
        } else {
          if (borrowedCurr.indexOf(bookID) !== -1) {
            state = awaiting.indexOf(bookID) !== -1 ? 'awaiting' : 'borrowed';
          } else {
            state = awaiting.indexOf(bookID) !== -1 ? 'awaiting' : 'subscribed';
          }
        }
        return state;
      };

      setSearchItemsList(
        response.data.bookSearch.map((book: IBook) => ({
          ...book,
          authors: book.authors.map((author) => author.name),
          actionState: findState(book.bookID, book.quantity)
        }))
      );
      setSearchItemListFetched(true);
    })();
  }, [
    searchQuery.query,
    searchQuery.category,
    notifications,
    borrowedCurr,
    borrowedPrev,
    awaiting
  ]);

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

    if (response.errors) alert(response.errors[0].message);

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

    if (response.errors) alert(response.errors[0].message);

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
            {borrowedCurr.length + awaiting.length >= props.borrowLimit && (
              <div id="borrow-limit-disclaimer">
                <span>You have reached borrow limit</span>
              </div>
            )}
          </div>
          <div id="search-list-search-bar-wrap">
            <SearchBar
              searchHandler={(query: string, activeSearch: boolean) => {
                setSearchItemListFetched(activeSearch);
                console.log(query);
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
                    {borrowedCurr.length >= props.borrowLimit && (
                      <button style={{ background: 'none', color: 'white' }}>.</button>
                    )}
                    {borrowedPrev.indexOf(searchItem.bookID) !== -1 && (
                      <div className="borrowed-prev">
                        <FontAwesomeIcon icon={faClock} className="input-field-icon" />
                      </div>
                    )}

                    {(searchItem.actionState === 'awaiting' ||
                      searchItem.actionState === 'borrowed' ||
                      searchItem.actionState === 'subscribed') && (
                      <h4 className="search-item-no-btn-text search-item-borrowed">
                        {searchItem.actionState}
                      </h4>
                    )}
                    {searchItem.actionState === 'borrowable' && (
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
                    {searchItem.actionState === 'notifiable' && (
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
