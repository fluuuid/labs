import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Slider from './Slider';
import Group from './Group';
import sliders from './sliders-data';

export default class Sliders extends Component {

  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    className: '',
  };

  constructor() {
    super();
    this.sliders = {};
  }

  shouldComponentUpdate() {
    return false;
  }

  onChange = (e) => {
    const { onChange } = this.props;
    this.outcomes[e.id] = e.value;
    onChange(this.outcomes);
  }

  render() {
    this.outcomes = {};
    const { className } = this.props;
    const classList = classnames(className);
    return (
      <div className={classList} style={{ padding: '0 45px' }}>
        {sliders.map((s, index) => {
          const { id } = s;
          if (s.group) {
            this.outcomes[id] = '';
            return (
              <div key={id}>
                <Group onChange={this.onChange} className="row group" data={s} />
                <hr />
              </div>
            );
          }

          this.outcomes[id] = '';
          return (
            <div key={id}>
              <Slider
                onChange={this.onChange}
                className="row slider-row"
                data={s}
                ref={(e) => { sliders[index].component = e; }}
              />
              <hr />
            </div>
          );
        })}

      </div>
    );
  }
}
