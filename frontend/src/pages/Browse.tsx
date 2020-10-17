import React from 'react';
import { Link } from 'react-router-dom';
import BookList from '../components/BookList/BookList';

import SearchBar from '../components/SearchBar/SearchBar';

import './Browse.scss';

export default class BrowsePage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <nav>
          <div className="nav-row">
            <div className="logo"></div>
            <ul>
              <li>
                <Link to="/">History</Link>
              </li>
              <li>
                <Link to="/">Dashboard</Link>
              </li>
              <li>
                <Link to="/">Log Out</Link>
              </li>
            </ul>
          </div>
          <SearchBar />
        </nav>
        <section>
          <BookList />
        </section>
      </React.Fragment>
    );
  }
}
