import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss';

interface ISearchBarProps {
  searchHandler: Function;
  initialValue: string;
  activeSearch: boolean;
}

export default function SearchBar(props: ISearchBarProps) {
  const searchEl: React.RefObject<HTMLInputElement> = React.createRef();

  const [hasText, setHasText] = useState(false);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const searchQuery = searchEl.current?.value;
    props.searchHandler(searchQuery === null ? '' : searchQuery?.trim());
  };

  const toggleClear = () => {
    if (props.activeSearch) {
      // const searchQuery = searchEl.current?.value;
      // props.searchHandler(searchQuery === null ? '' : searchQuery?.trim());
    }
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
        defaultValue={props.initialValue}
      />
      {hasText && (
        <button onClick={clearSearch}>
          <FontAwesomeIcon icon={faTimes} className="input-field-icon" />
        </button>
      )}
    </form>
  );
}
