import React, { useState } from 'react';
import { IBook } from '../@types/book';

import { fetchGraphQLResponse } from '../utils/HttpUtils';

import './BookDetailsModal.scss';

export default function BookDetailsModal(props: {
  book: IBook | null;
  bookID: string | null;
  setBook: Function;
}) {
  const [viewingBook, setViewingBook] = useState<IBook | null>(props.book);

  if (!viewingBook) {
    (async () => {
      if (props.bookID) {
        const response = await fetchGraphQLResponse(
          `query book($bookID: String!) {
            book(bookID: $bookID) {
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
          { bookID: props.bookID },
          'book search failed'
        );

        if (!response) return;

        setViewingBook(response.data.book);
      }
    })();
  }

  // -- Render -------------------------------------------------------------------------------------

  return (
    <div id="book-details-modal">
      <div id="book-details-modal-body" style={{ marginTop: window.scrollY }}>
        <div
          id="details-modal-close"
          onClick={() => {
            document.body.style.overflow = 'auto';
            props.setBook(null);
          }}
        >
          &times;
        </div>
        {!viewingBook && <div className="rolling-2"></div>}
        {viewingBook && (
          <React.Fragment>
            <h4 className="search-item-id">Book ID: {viewingBook.bookID}</h4>
            <h1 className="search-item-title">{viewingBook.title}</h1>
            <h4 className="search-item-category">{viewingBook.category}</h4>
            <ul className="search-item-authors">
              {viewingBook.authors.map((author, index) => (
                <li key={`search-item-author-${index}`}>
                  <h4>{typeof author === 'string' ? author : author.name}</h4>
                </li>
              ))}
            </ul>
            <p className="search-item-abstract">{viewingBook.abstract}</p>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
