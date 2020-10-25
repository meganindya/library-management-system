import React from 'react';

import './BrowseContent.scss';
import SearchBar from '../SearchBar';
import StudyDesk from '../StudyDesk';
import CategorySprite from '../CategorySprite';
import { Link } from 'react-router-dom';

export default function BrowseContent() {
  const categories = [
    { name: 'Category 1', sprite: <CategorySprite /> },
    { name: 'Category 2', sprite: <CategorySprite /> },
    { name: 'Category 3', sprite: <CategorySprite /> },
    { name: 'Category 4', sprite: <CategorySprite /> },
    { name: 'Category 5', sprite: <CategorySprite /> }
  ];

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
          {categories.map((category) => (
            <div className="browse-category-block">
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
