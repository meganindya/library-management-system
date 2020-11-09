import React, { useEffect, useState } from 'react';

import './BrowseContent.scss';
import SearchBar from '../SearchBar';
import StudyDesk from '../StudyDesk';
import CategorySprite from '../CategorySprite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function BrowseContent(this: any) {
  const [searched, setSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState('Any category');
  const [categoryNames, setCategoryNames] = useState([]);

  useEffect(() => {
    const nameRequestBody = {
      query: `
        query {
          categories {
            categoryName
          }
        }`
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
        if (responseData.data.categories) {
          setCategoryNames(responseData.data.categories);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const categories = categoryNames.map(
    (categoryItem: { categoryName: string }) => ({
      name: categoryItem.categoryName,
      sprite: <CategorySprite />
    })
  );

  const categoryClickHandler = (category: string): void => {
    setSearched(true);
    setCurrentCategory(category);
  };

  const searchQueryHandler = (queryString: string): void => {
    setSearched(true);
    console.log(searchQuery, queryString);
    setSearchQuery(queryString);
    console.log(searchQuery);
  };

  const browseGreetContent = (
    <div id="browse-content" className="container">
      <div id="browse-greet-box">
        <div id="browse-banner-wrap">
          <StudyDesk />
        </div>
        <div id="browse-search-wrap">
          <h1>Hello there!</h1>
          <h2>Pick your mind with some keywords</h2>
          <div id="browse-search-bar-wrap">
            <SearchBar
              searchHandler={searchQueryHandler}
              initialValue=""
              activeSearch={false}
            />
          </div>
        </div>
      </div>
      <div id="browse-category">
        <h2>Or, select by category</h2>
        <div id="browse-category-blocks">
          {categories.map((category, index) => (
            <div
              className="browse-category-block"
              key={`category-block-${index}`}
              onClick={() => categoryClickHandler(category.name)}
            >
              <div>{category.sprite}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const searchRequestBody = {
      query: `
        query bookSearch($queryString: String!) {
          bookSearch(queryString: $queryString) {
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
        queryString: 'India'
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
          setSearchItemsList(responseData.data.bookSearch);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [searchQuery, currentCategory]);

  interface ISearchItem {
    title: string;
    category: string;
    authors: { name: string }[];
    abstract: string;
    quantity: number;
  }

  const [searchItemsList, setSearchItemsList] = useState<ISearchItem[]>([]);

  const searchItems = searchItemsList.map((searchItem) => ({
    title: searchItem.title,
    category: searchItem.category,
    authors: searchItem.authors.map((author) => author.name),
    abstract:
      searchItem.abstract.length > 256
        ? searchItem.abstract.substring(0, 256) + ' ...'
        : searchItem.abstract,
    quantity: searchItem.quantity
  }));

  const browseSearchList = (
    <React.Fragment>
      <div id="search-list-search-container">
        <div className="container">
          <div>
            <div id="search-list-back-to-greet">
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="input-field-icon"
                onClick={() => {
                  setSearched(false);
                  setSearchQuery('');
                  setCurrentCategory('Any category');
                }}
              />
            </div>
          </div>
          <div id="search-list-search-bar-wrap">
            <SearchBar
              searchHandler={searchQueryHandler}
              initialValue={searchQuery}
              activeSearch={true}
            />
            <select
              id="search-category-dropdown"
              defaultValue={currentCategory}
            >
              <option value="Any category">Any category</option>
              {categories.map((category, index) => (
                <option value={`${category.name}`} key={index}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div id="search-list-items" className="container">
        {searchItems.map((searchItem, index) => (
          <div className="search-item-block" key={index}>
            <div className="search-item-graphic"></div>
            <div className="search-item-content">
              <div className="search-item-content-text">
                <h1 className="search-item-title">{searchItem.title}</h1>
                <h4 className="search-item-category">{searchItem.category}</h4>
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
                      In stock:&nbsp;<b>{searchItem.quantity}</b>
                    </React.Fragment>
                  </h4>
                ) : (
                  <h4 style={{ color: 'coral' }}>Not in stock</h4>
                )}

                {searchItem.quantity > 0 ? (
                  <button className="search-item-button-bor">
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );

  return !searched ? browseGreetContent : browseSearchList;
}
