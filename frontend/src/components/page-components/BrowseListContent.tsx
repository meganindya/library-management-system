import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';

import AuthContext from '../../context/auth-context';

import SearchBar from '../SearchBar';

import './BrowseListContent.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function BrowseListContent(props: {
  categories: string[];
  searchQuery: {
    queryString: string;
    queryCategory: string;
  };
  resetUpperSearchQuery: Function;
}) {
  const history = useHistory();
  const authContext = useContext(AuthContext);

  interface IQuery {
    queryString: string;
    queryCategory: string;
  }
  const [searchQuery, setSearchQuery] = useState<IQuery>(props.searchQuery);

  const [loading, setLoading] = useState(true);

  const [userBookIDs, setUserBookIDs] = useState<string[]>([]);

  useEffect(() => {
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
          console.log(responseData.data.transactions);
          setUserBookIDs(
            responseData.data.transactions
              .filter(
                (entry: { bookID: string; returnDate: string | null }) =>
                  entry.returnDate === null || entry.returnDate === ''
              )
              .map(
                (entry: { bookID: string; returnDate: string | null }) =>
                  entry.bookID
              )
          );
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  interface ISearchItem {
    bookID: string;
    title: string;
    category: string;
    authors: { name: string }[];
    abstract: string;
    quantity: number;
  }
  const [searchItemsList, setSearchItemsList] = useState<ISearchItem[]>([]);

  useEffect(() => {
    const searchRequestBody = {
      query: `
          query bookSearch($queryString: String!) {
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
      variables: {
        queryString: searchQuery.queryString
      }
    };

    fetch('http://localhost:8000/api', {
      method: 'POST',
      body: JSON.stringify(searchRequestBody),
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
        if (responseData.data.bookSearch) {
          setSearchItemsList(
            responseData.data.bookSearch
              .map((searchItem: ISearchItem) => ({
                bookID: searchItem.bookID,
                title: searchItem.title,
                category: searchItem.category,
                authors: searchItem.authors.map((author) => author.name),
                abstract:
                  searchItem.abstract.length > 256
                    ? searchItem.abstract.substring(0, 256) + ' ...'
                    : searchItem.abstract,
                quantity: searchItem.quantity
              }))
              .filter((item: ISearchItem) => {
                if (searchQuery.queryCategory === 'Any category') return true;
                else return item.category === searchQuery.queryCategory;
              })
          );
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [searchQuery]);

  const borrowBook = (bookID: string) => {
    const borrowReqBody = {
      query: `
          mutation borrowBook($userID: String!, $bookID: String!) {
            borrowBook(userID: $userID, bookID: $bookID) {
              transID
            }
          }`,
      variables: {
        userID: authContext.userID, //|| '11118001',
        bookID: bookID
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
          responseData.data.borrowBook &&
          responseData.data.borrowBook.transID
        ) {
          history.push('/history');
        } else {
          throw new Error('borrow failed');
        }
      })
      .catch((e) => {
        console.error(e);
      });
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
                onClick={() => props.resetUpperSearchQuery()}
              />
            </div>
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
      {loading && <div className="rolling"></div>}
      {!loading && (
        <div id="search-list-items" className="container">
          {searchItemsList.map((searchItem, index) => (
            <div className="search-item-block" key={index}>
              <div className="search-item-graphic"></div>
              <div className="search-item-content">
                <div className="search-item-content-text">
                  <h1 className="search-item-title">{searchItem.title}</h1>
                  <h4 className="search-item-category">
                    {searchItem.category}
                  </h4>
                  <ul className="search-item-authors">
                    {searchItem.authors.map((author, index) => (
                      <li key={`"${index}"`}>
                        <h4>{author}</h4>
                      </li>
                    ))}
                  </ul>
                  <p className="search-item-abstract">{searchItem.abstract}</p>
                </div>
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
                  {userBookIDs.length >= 5 && (
                    <button style={{ background: 'none', color: 'white' }}>
                      .
                    </button>
                  )}
                  {userBookIDs.length < 5 &&
                    userBookIDs.indexOf(searchItem.bookID) === -1 &&
                    (searchItem.quantity > 0 ? (
                      <button
                        className="search-item-button-bor"
                        onClick={() => {
                          borrowBook(searchItem.bookID);
                        }}
                      >
                        BORROW
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="input-field-icon"
                        />
                      </button>
                    ) : (
                      <button className="search-item-button-req">
                        REQUEST
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="input-field-icon"
                        />
                      </button>
                    ))}
                  {userBookIDs.indexOf(searchItem.bookID) !== -1 && (
                    <h4 className="search-item-borrowed">borrowed</h4>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
