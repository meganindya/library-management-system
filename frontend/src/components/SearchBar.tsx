import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

import './SearchBar.scss';

export default function SearchBar(props: {
  searchHandler: Function;
  initialValue: string;
  activeSearch: boolean;
}) {
  const [hasText, setHasText] = useState(false);

  const searchEl = React.createRef<HTMLInputElement>();

  const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
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
