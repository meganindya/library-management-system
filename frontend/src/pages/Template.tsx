import React from 'react';

import SideBar from '../components/SideBar';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import BrowseContent from '../components/page-components/BrowseContent';
import HistoryContent from '../components/page-components/HistoryContent';
import DashboardContent from '../components/page-components/DashboardContent';

import './Template.scss';

export default function TemplatePage(props: { pageName: string }) {
  return (
    <React.Fragment>
      <div id="sidebar-wrap">
        <SideBar activeLinkName={props.pageName} />
      </div>
      <div id="page-body">
        <div id="navbar-wrap">
          <NavBar />
        </div>
        <div id="template-content">
          {props.pageName === 'browse' && <BrowseContent />}
          {props.pageName === 'history' && <HistoryContent />}
          {props.pageName === 'dashboard' && <DashboardContent />}
        </div>
        <div id="footer-wrap">
          <Footer />
        </div>
      </div>
    </React.Fragment>
  );
}
