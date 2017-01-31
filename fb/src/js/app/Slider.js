import React, { Component, PropTypes } from 'react';

export default class Slider extends Component {

  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    range: PropTypes.arrayOf(PropTypes.number).isRequired,
    description: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.string,
    ]).isRequired,
  };

  static defaultProps = {
    className: '',
  };

  state = {
    value: 0,
  }

  onChange = (e) => {
    this.setState({ value: e.currentTarget.value });
    this.props.onChange(this.state.value);
  }

  getHelperText() {
    const { description } = this.props;
    if (Array.isArray(description)) {
      return <h6>{description[this.state.value]}</h6>;
    }

    return <h6>{description} - {this.state.value}</h6>;
  }

  getValue = () => {
    return this.input.value;
  }

  render() {
    const { className, label, range, id } = this.props;
    return (
      <div className={className}>
        <label htmlFor={id}>
          {label}<br />{this.getHelperText()}
        </label>
        <input
          value={this.state.value}
          onChange={this.onChange}
          type="range"
          id={id}
          ref={(e) => { this.input = e; }}
          min={range[0]}
          max={range[1]}
        />
      </div>
    );
  }
}
