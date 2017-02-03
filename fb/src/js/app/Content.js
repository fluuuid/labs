import React, { PropTypes } from 'react';
import classnames from 'classnames';
// import ColourPalette from './ColourPallete';
import MovieScript from './MovieScript';

const Content = ({ className, content }) => {
  const classList = classnames(className, 'content');
  return (
    <div className={classList}>
      {/* <ColourPalette content={content} /> */}
      <MovieScript content={content} />
    </div>
  );
};

Content.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

Content.defaultProps = {
  className: '',
};

export default Content;
