import React from 'react';
import { Link } from 'react-router-dom';

// -- Subcomponents --------------------------------------------------------------------------------

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookReader,
  faCashRegister,
  faColumns,
  faPlane,
  faPlaneDeparture,
  faPlaneArrival
} from '@fortawesome/free-solid-svg-icons';

// -- Stylesheet -----------------------------------------------------------------------------------

import './SideBar.scss';

// -- Component ------------------------------------------------------------------------------------

export default function SideBar(props: { activeLinkName: string; isLibrarian: boolean }) {
  // -- Render -----------------------------------------------------------------

  return (
    <div id="sidebar">
      <div id="sidebar-overlay"></div>
      <div id="sidebar-inner-shadow"></div>
      <ul>
        {!props.isLibrarian ? (
          <React.Fragment>
            <li className={props.activeLinkName === 'browse' ? 'link-active' : ''}>
              <Link to="/browse">
                <FontAwesomeIcon icon={faBookReader} />
                <span>Browse</span>
              </Link>
            </li>
            <li className={props.activeLinkName === 'history' ? 'link-active' : ''}>
              <Link to="/history">
                <FontAwesomeIcon icon={faCashRegister} />
                <span>History</span>
              </Link>
            </li>
            <li className={props.activeLinkName === 'dashboard' ? 'link-active' : ''}>
              <Link to="/dashboard">
                <FontAwesomeIcon icon={faColumns} />
                <span>Dashboard</span>
              </Link>
            </li>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <li className={props.activeLinkName === 'awaiting' ? 'link-active' : ''}>
              <Link to="/awaiting">
                <FontAwesomeIcon icon={faPlane} />
                <span>All</span>
              </Link>
            </li>
            <li className={props.activeLinkName === 'borrow' ? 'link-active' : ''}>
              <Link to="/borrow">
                <FontAwesomeIcon icon={faPlaneDeparture} />
                <span>Borrow</span>
              </Link>
            </li>
            <li className={props.activeLinkName === 'return' ? 'link-active' : ''}>
              <Link to="/return">
                <FontAwesomeIcon icon={faPlaneArrival} />
                <span>Return</span>
              </Link>
            </li>
          </React.Fragment>
        )}
      </ul>
    </div>
  );
}
