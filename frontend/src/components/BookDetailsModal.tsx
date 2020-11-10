import React from 'react';

import './BookDetailsModal.scss';

interface IBook {
  bookID: string;
  title: string;
  category: string;
  authors: { name: string }[];
  abstract: string;
  quantity: number;
}

export default function BookDetailsModal(props: { book: IBook | null; setBook: Function }) {
  return props.book ? (
    <div id="book-details-modal">
      <div id="book-details-modal-body" style={{ marginTop: window.scrollY }}>
        <div id="details-modal-close" onClick={() => props.setBook(null)}>
          &times;
        </div>
        <h4 className="search-item-id">Book ID: {props.book.bookID}</h4>
        <h1 className="search-item-title">{props.book.title}</h1>
        <h4 className="search-item-category">{props.book.category}</h4>
        <ul className="search-item-authors">
          {props.book.authors.map((author, index) => (
            <li key={`"${index}"`}>
              <h4>{author}</h4>
            </li>
          ))}
        </ul>
        <p className="search-item-abstract">{props.book.abstract}</p>
      </div>
    </div>
  ) : (
    <React.Fragment></React.Fragment>
  );
}
