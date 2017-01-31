/* global FB window fb */

import React, { Component } from 'react';
import Sliders from './Sliders';
import Content from './Content';

export default class App extends Component {

  state = {
    content: 0,
  }

  onChange = (content) => {
    this.setState({ content });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <Sliders onChange={this.onChange} className="col-md-4" />
          <Content content={this.state.content} className="col-md-8" />
        </div>
      </div>
    );
  }
}
