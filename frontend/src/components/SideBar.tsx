import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookReader, faCashRegister, faColumns } from '@fortawesome/free-solid-svg-icons';

import './SideBar.scss';

export default function SideBar(props: { activeLinkName: string }) {
  // -- Render -------------------------------------------------------------------------------------

  return (
    <div id="sidebar">
      <div id="sidebar-overlay"></div>
      <div id="sidebar-inner-shadow"></div>
      <ul>
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
      </ul>
    </div>
  );
}
