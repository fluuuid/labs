/* globals FB */
import React, { Component, PropTypes } from 'react';

export default class Photo extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
  }

  state = {
    imgURL: null,
    id: null,
  }

  componentDidMount() {
    const { id } = this.props;
    FB.api(`/${id}?fields=images,id`, this.apiPhotoLoaded);
  }

  apiPhotoLoaded = (e) => {
    this.setState({ imgURL: e.images[0].source, id: e.id });
  }

  render() {
    if (!this.state.imgURL) return null;

    return (
      <img className="img-thumbnail" src={this.state.imgURL} alt={this.state.id} />
    );
  }
}
