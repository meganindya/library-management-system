import React, { useState } from 'react';

// -- Subcomponents --------------------------------------------------------------------------------

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

// -- Stylesheet -----------------------------------------------------------------------------------

import './SearchBar.scss';

// -- Component ------------------------------------------------------------------------------------

export default function SearchBar(props: {
  searchHandler: Function;
  initialValue: string;
  activeSearch: boolean;
}) {
  const [hasText, setHasText] = useState(false);

  // -- Referenced elements ----------------------------------------------------

  const searchEl = React.createRef<HTMLInputElement>();

  // -- Callbacks --------------------------------------------------------------

  const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    props.searchHandler(' ', false);
    props.searchHandler(searchEl.current?.value.trim() || '', false);
  };

  const toggleClear = () => {
    if (props.activeSearch) {
      props.searchHandler(searchEl.current?.value.trim() || '', true);
    }
    setHasText(searchEl.current !== null && searchEl.current.value.trim() !== '' ? true : false);
  };

  const clearSearch = () => {
    if (searchEl.current) {
      searchEl.current.value = '';
      setHasText(false);
      document.getElementById('search-field')?.focus();
    }
  };

  // -- Render -----------------------------------------------------------------

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
        defaultValue={props.initialValue}
        minLength={3}
      />
      {hasText && (
        <button onClick={clearSearch}>
          <FontAwesomeIcon icon={faTimes} className="input-field-icon" />
        </button>
      )}
    </form>
  );
}
