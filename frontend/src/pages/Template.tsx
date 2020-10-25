import React from 'react';

import SideBar from '../components/SideBar';
import NavBar from '../components/NavBar';
import BrowseContent from '../components/page-components/BrowseContent';

import './Template.scss';

interface ITemplatePage {
  pageName: string;
}

export default function TemplatePage(props: ITemplatePage) {
  return (
    <React.Fragment>
      <div id="sidebar-wrap">
        <SideBar activeLinkName={props.pageName} />
      </div>
      <div id="page-body">
        <NavBar />
        {props.pageName === 'browse' && <BrowseContent />}
      </div>
    </React.Fragment>
  );
}
