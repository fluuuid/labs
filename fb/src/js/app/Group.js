import React, { Component, PropTypes } from 'react';
import Slider from './Slider';

export default class Group extends Component {

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

  onChange = (e) => {
    this.values[e.id] = e.value;
    const { onChange } = this.props;
    const { outcome, id, outcomeLabels } = this.props.data;
    outcome.forEach((o) => {
      const valueFormula = o.formula(this.values);
      if (valueFormula) {
        onChange({ id, value: outcomeLabels ? outcomeLabels[valueFormula] : o.label });
      }
    });
  }

  render() {
    this.values = {};
    const { data, className } = this.props;
    return (
      <div className={className}>
        <h3>{data.label}</h3>
        <div>
          {data.group.map((s) => {
            this.values[s.id] = 0;
            return <Slider className="row slider-row" onChange={this.onChange} key={s.id} data={s} />;
          })}
        </div>
      </div>
    );
  }
}
