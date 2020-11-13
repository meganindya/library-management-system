import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

import { fetchGraphQLResponse } from '../../utils/HttpUtils';

import BookDetailsModal from '../BookDetailsModal';
import SearchBar from '../SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';

import AuthContext from '../../context/auth-context';

import './BrowseListContent.scss';

interface IBook {
  bookID: string;
  title: string;
  category: string;
  authors: { name: string }[];
  abstract: string;
  quantity: number;
}

export default function BrowseListContent(props: {
  categories: string[];
  searchQuery: {
    queryString: string;
    queryCategory: string;
  };
  resetGlobalSearchQuery: Function;
}) {
  const authContext = useContext(AuthContext);
  const [borrowLimit, setBorrowLimit] = useState(-1);
  useEffect(() => {
    if (authContext.type) {
      setBorrowLimit(authContext.type === 'Student' ? 5 : 8);
    }
  }, [authContext.type]);

  const [searchQuery, setSearchQuery] = useState<{
    queryString: string;
    queryCategory: string;
  }>(props.searchQuery);
  const [loading, setLoading] = useState(true);
  const [prevBorrowedIDs, setPrevBorrowedIDs] = useState<string[]>([]);
  const [borrowedIDs, setBorrowedIDs] = useState<string[]>([]);
  const [searchItemsList, setSearchItemsList] = useState<IBook[]>([]);
  const [viewingBookDetails, setViewingBookDetails] = useState<IBook | null>(null);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const browserHistory = useHistory();

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query transactions($userID: String!) {
          transactions(userID: $userID) {
            bookID
            returnDate
          }
        }`,
        { userID: authContext.userID },
        'Borrowed Books Fetch Failed'
      );

      if (!response) return;

      setPrevBorrowedIDs(
        response.data.transactions
          .filter((entry: { bookID: string; returnDate: string | null }) => entry.returnDate)
          .map((entry: Partial<{ bookID: string }>) => entry.bookID)
      );

      setBorrowedIDs(
        response.data.transactions
          .filter((entry: { bookID: string; returnDate: string | null }) => !entry.returnDate)
          .map((entry: Partial<{ bookID: string }>) => entry.bookID)
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetchGraphQLResponse(
        `query bookSearch($queryString: String!) {
            bookSearch(queryString: $queryString) {
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
        { queryString: searchQuery.queryString },
        'Book Search Failed'
      );

      if (!response) return;

      setSearchItemsList(
        response.data.bookSearch
          .map((book: IBook) => ({
            ...book,
            authors: book.authors.map((author) => author.name)
          }))
          .filter((book: IBook) => {
            if (searchQuery.queryCategory === 'Any category') return true;
            else return book.category === searchQuery.queryCategory;
          })
      );
      setLoading(false);
    })();
  }, [searchQuery]);

  const borrowHandler = async (bookID: string) => {
    const response = await fetchGraphQLResponse(
      `mutation borrowBook($userID: String!, $bookID: String!) {
        borrowBook(userID: $userID, bookID: $bookID) {
          transID
        }
      }`,
      { userID: authContext.userID, bookID: bookID },
      ''
    );

    if (!response) return;

    browserHistory.push('/history');
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
            {borrowedIDs.length >= borrowLimit && (
              <div id="borrow-limit-disclaimer">
                <span>You have reached borrow limit</span>
              </div>
            )}
          </div>
          <div id="search-list-search-bar-wrap">
            <SearchBar
              searchHandler={(queryString: string, activeSearch: boolean) => {
                setLoading(!activeSearch);
                setSearchQuery({
                  queryString: queryString,
                  queryCategory: searchQuery.queryCategory
                });
              }}
              initialValue={searchQuery.queryString}
              activeSearch={true}
            />
            <Select
              id="search-category-dropdown"
              options={[
                { value: 'Any category', label: 'Any category' },
                ...props.categories.map((category) => ({
                  value: `${category}`,
                  label: `${category}`
                }))
              ]}
              defaultValue={{
                value: `${searchQuery.queryCategory}`,
                label: `${searchQuery.queryCategory}`
              }}
              onChange={(option: any) => {
                if (option) {
                  setLoading(true);
                  setSearchQuery({
                    queryString: searchQuery.queryString,
                    queryCategory: option.label
                  });
                }
              }}
            ></Select>
          </div>
        </div>
      </div>
      {loading && <div className="rolling" style={{ marginTop: '3rem' }}></div>}
      {!loading && (
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
                      <li key={`"${index}"`}>
                        <h4>{author}</h4>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p
                    className="search-item-abstract"
                    onClick={() => setViewingBookDetails(searchItem)}
                  >
                    see details
                  </p>
                  <div className="search-item-button-wrap">
                    {searchItem.quantity > 0 ? (
                      <h4>
                        <React.Fragment>
                          In shelf:&nbsp;<b>{searchItem.quantity}</b>
                        </React.Fragment>
                      </h4>
                    ) : (
                      <h4 style={{ color: 'coral' }}>Not in shelf</h4>
                    )}
                    {borrowedIDs.length >= borrowLimit && (
                      <button style={{ background: 'none', color: 'white' }}>.</button>
                    )}
                    {prevBorrowedIDs.indexOf(searchItem.bookID) !== -1 && (
                      <div className="borrowed-prev">
                        <FontAwesomeIcon icon={faClock} className="input-field-icon" />
                      </div>
                    )}
                    {borrowedIDs.length < borrowLimit &&
                      borrowedIDs.indexOf(searchItem.bookID) === -1 &&
                      (searchItem.quantity > 0 ? (
                        <button
                          className={`search-item-button-bor ${
                            searchItem.bookID === borrowing ? 'search-item-button-rolling' : ''
                          }`}
                          onClick={() => {
                            setBorrowing(searchItem.bookID);
                            borrowHandler(searchItem.bookID);
                          }}
                        >
                          {searchItem.bookID === borrowing && <div className="rolling-3"></div>}
                          {searchItem.bookID !== borrowing && (
                            <React.Fragment>
                              BORROW
                              <FontAwesomeIcon icon={faArrowRight} className="input-field-icon" />
                            </React.Fragment>
                          )}
                        </button>
                      ) : (
                        <button
                          className={`search-item-button-req ${
                            searchItem.bookID === subscribing ? 'search-item-button-rolling' : ''
                          }`}
                          onClick={() => {
                            setSubscribing(searchItem.bookID);
                            subscribeHandler(searchItem.bookID);
                          }}
                        >
                          {searchItem.bookID === subscribing && <div className="rolling-3"></div>}
                          {searchItem.bookID !== subscribing && (
                            <React.Fragment>
                              NOTIFY
                              <FontAwesomeIcon icon={faArrowRight} className="input-field-icon" />
                            </React.Fragment>
                          )}
                        </button>
                      ))}
                    {borrowedIDs.indexOf(searchItem.bookID) !== -1 && (
                      <h4 className="search-item-borrowed">borrowed</h4>
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
