import React, { useEffect, useState } from 'react';

import './BrowseContent.scss';
import SearchBar from '../SearchBar';
import StudyDesk from '../StudyDesk';
import CategorySprite from '../CategorySprite';
import { Link } from 'react-router-dom';

export default function BrowseContent() {
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

  return (
    <div id="browse-content" className="container">
      <div id="browse-greet-box">
        <div id="browse-banner-wrap">
          <StudyDesk />
        </div>
        <div id="browse-search-wrap">
          <h1>Hello there!</h1>
          <h2>Pick your mind with some keywords</h2>
          <div id="search-bar-wrap">
            <SearchBar />
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
            >
              <Link to="/">
                <div>{category.sprite}</div>
                <h3>{category.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
