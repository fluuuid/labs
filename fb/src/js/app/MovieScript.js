import React, { PropTypes } from 'react';
import { map, round } from './utils';

const scripts = [
  '1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis ultricies justo. Maecenas aliquam nibh id dolor pharetra mattis. Nunc eleifend erat in odio malesuada gravida. Morbi at ex tempor, ornare nulla nec, lacinia massa. Donec placerat venenatis erat, ac convallis lectus auctor et. In congue ultricies semper. Nam eget odio at magna congue euismod ut at odio. Fusce auctor ornare eros at mattis. Quisque id nunc vitae ipsum semper malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam vitae justo non libero fringilla mattis nec luctus sem.',
  '2 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis ultricies justo. Maecenas aliquam nibh id dolor pharetra mattis. Nunc eleifend erat in odio malesuada gravida. Morbi at ex tempor, ornare nulla nec, lacinia massa. Donec placerat venenatis erat, ac convallis lectus auctor et. In congue ultricies semper. Nam eget odio at magna congue euismod ut at odio. Fusce auctor ornare eros at mattis. Quisque id nunc vitae ipsum semper malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam vitae justo non libero fringilla mattis nec luctus sem.',
  '3 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis ultricies justo. Maecenas aliquam nibh id dolor pharetra mattis. Nunc eleifend erat in odio malesuada gravida. Morbi at ex tempor, ornare nulla nec, lacinia massa. Donec placerat venenatis erat, ac convallis lectus auctor et. In congue ultricies semper. Nam eget odio at magna congue euismod ut at odio. Fusce auctor ornare eros at mattis. Quisque id nunc vitae ipsum semper malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam vitae justo non libero fringilla mattis nec luctus sem.',
  '4 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis ultricies justo. Maecenas aliquam nibh id dolor pharetra mattis. Nunc eleifend erat in odio malesuada gravida. Morbi at ex tempor, ornare nulla nec, lacinia massa. Donec placerat venenatis erat, ac convallis lectus auctor et. In congue ultricies semper. Nam eget odio at magna congue euismod ut at odio. Fusce auctor ornare eros at mattis. Quisque id nunc vitae ipsum semper malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam vitae justo non libero fringilla mattis nec luctus sem.',
  '5 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis ultricies justo. Maecenas aliquam nibh id dolor pharetra mattis. Nunc eleifend erat in odio malesuada gravida. Morbi at ex tempor, ornare nulla nec, lacinia massa. Donec placerat venenatis erat, ac convallis lectus auctor et. In congue ultricies semper. Nam eget odio at magna congue euismod ut at odio. Fusce auctor ornare eros at mattis. Quisque id nunc vitae ipsum semper malesuada. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam vitae justo non libero fringilla mattis nec luctus sem.',
];

const MovieScript = ({ index }) => {
  const scriptIndex = round(map(index, 0, 1, 0, scripts.length - 1));
  const script = scripts[scriptIndex];
  return (<div className="jumbotron">
    <p>{script}</p>
  </div>);
};

MovieScript.propTypes = {
  index: PropTypes.number.isRequired,
};

export default MovieScript;
