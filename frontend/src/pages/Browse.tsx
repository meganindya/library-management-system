import React from 'react';

import BookList from '../components/BookList/BookList';
import MainNav from '../components/MainNav/MainNav';

import './Browse.scss';

export default class BrowsePage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <MainNav currentPage="browse" />
        <section id="book-list-section">
          <BookList />
        </section>
      </React.Fragment>
    );
  }
}
