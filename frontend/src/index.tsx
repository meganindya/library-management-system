import React from 'react';
import ReactDOM from 'react-dom';

// -- Subcomponents --------------------------------------------------------------------------------

import App from './App';

// -- Stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- Renderer -------------------------------------------------------------------------------------

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
