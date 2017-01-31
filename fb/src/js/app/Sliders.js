import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Slider from './Slider';

const sliders = [
  {
    id: 'reactions',
    label: 'Reactions',
    range: [0, 10],
    description: 'How much reactions affect your video',
    component: {},
    weight: 0.5,
  },
  {
    id: 'happiness',
    label: 'Happiness',
    range: [0, 10],
    description: 'How\'s your mood',
    component: {},
    weight: 0.3,
  },
  {
    id: 'time',
    label: 'Season',
    range: [0, 3],
    description: ['Spring', 'Summer', 'Autunm', 'Winter'],
    component: {},
    weight: 0.1,
  },
  {
    id: 'travel',
    label: 'Travel',
    range: [0, 10],
    description: 'How many checkins you want to see',
    component: {},
    weight: 0.05,
  },
  {
    id: 'social',
    label: 'Social',
    range: [0, 5],
    description: ['Single', 'In a Relashionship', 'It\'s complicated', 'Married', 'Graduated', 'Siblings'],
    component: {},
    weight: 0.05,
  },
];

const getTotal = () => {
  let total = 0;
  sliders.forEach((s) => {
    total += s.weight * s.range[1];
  });

  return total;
};

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

  state = {
    average: 0,
    total: getTotal(),
  }

  onChange = () => {
    let totalOfSliders = 0;
    sliders.forEach((s) => {
      totalOfSliders += parseFloat(s.component.getValue()) * s.weight;
    });

    // https://en.wikipedia.org/wiki/Weighted_arithmetic_mean

    this.setState({ average: totalOfSliders / this.state.total });
    this.props.onChange(this.state.average);
  }

  render() {
    const { className } = this.props;
    const classList = classnames(className);
    return (
      <div className={classList}>
        {sliders.map((s, index) => {
          const { id, label, range, description } = s;
          return (<Slider
            onChange={this.onChange}
            className="row slider-row"
            description={description}
            label={label}
            key={id}
            id={id}
            range={range}
            ref={(e) => { sliders[index].component = e; }}
          />);
        })}

      </div>
    );
  }
}
