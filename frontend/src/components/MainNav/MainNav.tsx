import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

import './MainNav.scss';

interface INavProps {
  currentPage: string;
}

interface INavState {}

export default class MainNav extends React.Component<INavProps, INavState> {
  render() {
    return (
      <nav
        style={{ height: `${this.props.currentPage === 'browse' ? 13 : 6}rem` }}
      >
        <div className="nav-row">
          <div className="logo"></div>
          <ul>
            {this.props.currentPage !== 'browse' && (
              <li>
                <Link to="/browse">Browse</Link>
              </li>
            )}
            {this.props.currentPage !== 'history' && (
              <li>
                <Link to="/history">History</Link>
              </li>
            )}
            {this.props.currentPage !== 'dashboard' && (
              <li>
                <Link to="/">Dashboard</Link>
              </li>
            )}
            {
              <li>
                <Link to="/">Log Out</Link>
              </li>
            }
          </ul>
        </div>
        {this.props.currentPage === 'browse' && <SearchBar />}
      </nav>
    );
  }
}
