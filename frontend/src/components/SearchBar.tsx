import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss';

export default function SearchBar() {
  const searchEl: React.RefObject<HTMLInputElement> = React.createRef();

  const [hasText, setHasText] = useState(false);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  const toggleClear = () => {
    setHasText(
      searchEl.current !== null && searchEl.current.value.trim() !== ''
        ? true
        : false
    );
  };

  const clearSearch = () => {
    if (searchEl.current) {
      searchEl.current.value = '';
      setHasText(false);
      const inputField = document.getElementById('search-field');
      if (inputField) inputField.focus();
    }
  };

  return (
    <form onSubmit={submitHandler} className="search-bar">
      <button type="submit">
        <FontAwesomeIcon icon={faSearch} className="input-field-icon" />
      </button>
      <input
        id="search-field"
        type="text"
        placeholder="Search"
        onChange={toggleClear}
        ref={searchEl}
        autoComplete="off"
      />
      {hasText && (
        <button onClick={clearSearch}>
          <FontAwesomeIcon icon={faTimes} className="input-field-icon" />
        </button>
      )}
    </form>
  );
}
