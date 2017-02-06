const sliders = [
  {
    id: 'how-long-meet',
    label: 'How long do we know',
    range: [0, 10],
    description: 'years',
  },
  {
    id: 'places-met',
    label: 'How we\'ve met',
    checkbox: [
      {
        label: 'City',
        value: 'london',
        output: 'London',
      },
      {
        label: 'College',
        value: 'college',
        output: 'UCL',
      },
      {
        label: 'Preexisting friends',
        value: 'friends',
        output: 'Sally and Ola',
      },
    ],
    description: '',
  },
  {
    id: 'emotion',
    label: 'Emotions',
    outcome: [
      {
        label: 'ttt',
        formula: (value) => {
          return (Number(value['ups-and-downs']) >= Number(value.likes) && value['different-location'] === 0);
        },
      },
      {
        label: 'smc',
        formula: (value) => {
          return (Number(value.likes) > Number(value['ups-and-downs']) && value['different-location'] === 0);
        },
      },
      {
        label: 'nmhf',
        formula: (value) => {
          return value['different-location'] === 1;
        },
      },
    ],
    group: [
      {
        id: 'ups-and-downs',
        label: 'Shared hardship',
        range: [0, 10],
        description: 'a lot of emotional ups and downs between you and the friend (lots of likes, sad faces, reactions)',
      },
      {
        id: 'likes',
        label: 'Common interests',
        range: [0, 10],
        description: 'a lot of emotional ups and downs between you and the friend (lots of likes, sad faces, reactions)',
      },
      {
        id: 'different-location',
        label: 'Living in different locations',
        radio: [
          {
            label: 'Yes',
            value: 1,
          },
          {
            label: 'No',
            value: 0,
          },
        ],
        description: '',
      },
    ],
  },
  {
    id: 'activities',
    label: 'Minutiae',
    radio: [
      {
        label: 'Travelling',
        value: 'travel',
      },
      {
        label: 'Feeling',
        value: 'feeling',
      },
      {
        label: 'Movies',
        value: 'movie',
      },
    ],
    description: '',
  },
  // {
  //   id: 'quirks',
  //   label: 'Friendship quirks',
  //   outcome: [
  //     {
  //       label: 'Weird friend',
  //       formula: (value) => {
  //         return Number(value['weird-time']) >= Number(value['same-group']) &&
  //                Number(value['weird-time']) >= Number(value['same-event']);
  //       },
  //     },
  //     {
  //       label: 'Belong to the same group',
  //       formula: (value) => {
  //         return Number(value['same-group']) >= Number(value['weird-time']) &&
  //                Number(value['same-group']) >= Number(value['same-event']);
  //       },
  //     },
  //     {
  //       label: 'Always going to the same events',
  //       formula: (value) => {
  //         return Number(value['same-event']) >= Number(value['weird-time']) &&
  //                Number(value['same-event']) >= Number(value['first-like']);
  //       },
  //     },
  //   ],
  //   group: [
  //     {
  //       id: 'weird-time',
  //       label: 'Weird timing',
  //       range: [0, 10],
  //       description: 'How many times the user interact with post in weird times',
  //     },
  //     {
  //       id: 'same-group',
  //       label: 'Share same group',
  //       range: [0, 10],
  //       description: 'How many groups user and friend share in common',
  //     },
  //     {
  //       id: 'same-event',
  //       label: 'Went to same event',
  //       range: [0, 10],
  //       description: 'How many events user and friends went together',
  //     },
  //   ],
  // },
  {
    id: 'quantify',
    label: 'Words exchanged count',
    outcomeLabels: {
      low: 'It would stretch the length of two basketball courts',
      medium: 'It would stretch the length of three basketball courts',
      high: 'It would stretch the length of four basketball courts',
    },
    outcome: [
      {
        label: 'We communicate in words',
        formula: (value) => {
          switch (true) {
            case value.words >= 0 && value.words <= 25000: {
              return 'low';
            }
            case value.words > 25000 && value.words <= 50000: {
              return 'medium';
            }
            default: {
              return 'high';
            }
          }
        },
      },
    ],
    group: [
      {
        id: 'words',
        label: 'Words exchanged count',
        range: [0, 100000],
        description: '',
      },
      // {
      //   id: 'emoji',
      //   label: 'Quantify emoji/reactions',
      //   range: [0, 100000],
      //   description: 'How many events user and friends went together',
      // },
    ],
  },
  {
    id: 'smile',
    label: 'Smiles',
    range: [0, 1000],
    description: '',
  },
];

export default sliders;
