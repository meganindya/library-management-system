import React, { useContext } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import SideBar from '../components/SideBar';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import BrowseContent from '../components/page-components/BrowseContent';
import HistoryContent from '../components/page-components/HistoryContent';
import DashboardContent from '../components/page-components/DashboardContent';
import LibrarianContent from '../components/page-components/LibrarianContent';

import AuthContext from '../context/auth-context';

import './Template.scss';

export default function TemplatePage(props: { pageName: string }) {
  const authContext = useContext(AuthContext);

  useIdleTimer({
    timeout: 1000 * 60 * 60 * authContext.tokenExpiration,
    // timeout: 1000 * 10,
    onIdle: () => {
      if (
        authContext.tokenExpiration &&
        new Date().valueOf() - authContext.tokenExpiration.valueOf() >= 0
      ) {
        console.log('Session expired, logging out');
        authContext.logout();
      }
    },
    debounce: 500
  });

  // -- Render -------------------------------------------------------------------------------------

  return (
    <React.Fragment>
      <div id="sidebar-wrap">
        <SideBar activeLinkName={props.pageName} isLibrarian={authContext.type === 'Librarian'} />
      </div>
      <div id="page-body">
        <div id="navbar-wrap">
          <NavBar />
        </div>
        <div id="template-content">
          {props.pageName === 'browse' && <BrowseContent />}
          {props.pageName === 'history' && <HistoryContent />}
          {props.pageName === 'dashboard' && <DashboardContent />}
          {props.pageName === 'awaiting' && <LibrarianContent pageName={props.pageName} />}
          {props.pageName === 'borrow' && <LibrarianContent pageName={props.pageName} />}
          {props.pageName === 'return' && <LibrarianContent pageName={props.pageName} />}
        </div>
        <div id="footer-wrap">
          <Footer />
        </div>
      </div>
    </React.Fragment>
  );
}
