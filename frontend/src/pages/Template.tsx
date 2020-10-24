import React from 'react';
import NavBar from '../components/NavBar';

import SideBar from '../components/SideBar';

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
      </div>
    </React.Fragment>
  );
}
