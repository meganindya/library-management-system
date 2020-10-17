import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss';

export default class SearchBar extends React.Component {
  render() {
    return (
      <form action="" className="search-box">
        <FontAwesomeIcon icon={faSearch} className="input-field-icon" />
        <input type="text" placeholder="Search" />
        <input type="submit" value="Go" />
      </form>
    );
  }
}
