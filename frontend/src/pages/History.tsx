import React from 'react';

import MainNav from '../components/MainNav/MainNav';
import HistoryList from '../components/HistoryList/HistoryList';

import './History.scss';

export default class HistoryPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <MainNav currentPage="history" />
        <section id="history-section">
          <HistoryList />
        </section>
      </React.Fragment>
    );
  }
}
