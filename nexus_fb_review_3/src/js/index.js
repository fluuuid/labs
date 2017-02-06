/* global document window */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App';

window.start = () => {
  const main = document.getElementById('main');
  ReactDOM.render(
    <App />,
    main,
  );
};
