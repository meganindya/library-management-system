import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

import './MainNav.scss';

export default function MainNav(props: { currentPage: string }) {
  return (
    <nav style={{ height: `${props.currentPage === 'browse' ? 13 : 6}rem` }}>
      <div className="nav-row">
        <div className="logo"></div>
        <ul>
          {props.currentPage !== 'browse' && (
            <li>
              <Link to="/browse">Browse</Link>
            </li>
          )}
          {props.currentPage !== 'history' && (
            <li>
              <Link to="/history">History</Link>
            </li>
          )}
          {props.currentPage !== 'dashboard' && (
            <li>
              <Link to="/">Dashboard</Link>
            </li>
          )}
          <li>
            <Link to="/">Log Out</Link>
          </li>
        </ul>
      </div>
      {props.currentPage === 'browse' && <SearchBar />}
    </nav>
  );
}
