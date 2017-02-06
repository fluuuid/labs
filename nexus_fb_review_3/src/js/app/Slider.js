import React, { Component, PropTypes } from 'react';
import { RadioGroup, Radio } from 'react-radio-group';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';

export default class Slider extends Component {

  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.oneOfType([
      PropTypes.object,
    ]).isRequired,
  };

  static defaultProps = {
    className: '',
  };

  state = {
    value: 0,
  }

  onChange = (e) => {
    const { id } = this.props.data;
    let value;
    switch (true) {
      case Array.isArray(e):
        value = e.join(',');
        break;

      case e === Object(e):
        value = e.currentTarget.value;
        break;

      default:
        value = e;
    }

    this.setState({ value });
    this.props.onChange({ id, value });
  }

  getHelperText() {
    const { description } = this.props.data;
    if (Array.isArray(description)) {
      return <h6>{description[this.state.value]}</h6>;
    }

    if (description.length < 1) {
      return <h6 />;
    }

    return <h6>{JSON.stringify(this.state.value)} {description}</h6>;
  }

  getValue = () => {
    return this.input.value;
  }

  getInputs() {
    const { range, id, radio, checkbox } = this.props.data;
    if (!radio && !checkbox && range) {
      return (<input
        value={this.state.value}
        onChange={this.onChange}
        type="range"
        id={id}
        ref={(e) => { this.input = e; }}
        min={range[0]}
        max={range[1]}
      />);
    } else if (checkbox && !radio && !range) {
      return (<CheckboxGroup onChange={this.onChange} name={id}>
        {checkbox.map(c => <label style={{ display: 'block' }} key={c.value}>
          <Checkbox value={c.value} style={{ marginRight: '5px' }} />{c.label}
        </label>)}
      </CheckboxGroup>);
    }

    return (
      <RadioGroup name={id} selectedValue={this.state.value} onChange={this.onChange}>
        {radio.map(r => <label style={{ display: 'block' }} key={r.value}>
          <Radio key={r.value} value={r.value} style={{ marginRight: '5px' }} />{r.label}
        </label>)}
      </RadioGroup>
    );
  }

  render() {
    const { className, data } = this.props;
    const { label, id } = data;
    return (
      <div className={className}>
        <label htmlFor={id}>
          {label}<br />{this.getHelperText()}
        </label>

        { this.getInputs() }

      </div>
    );
  }
}
