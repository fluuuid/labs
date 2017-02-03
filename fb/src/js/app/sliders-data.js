const sliders = [
  {
    id: 'how-meet',
    label: 'Meet',
    radio: [
      {
        label: 'Living in the same location',
        value: 'same-living-location',
      },
      {
        label: 'Study/Work at same institution',
        value: 'same-work-location',
      },
    ],
    description: 'How did you meet each other',
  },
  {
    id: 'how-long-meet',
    label: 'How Long',
    range: [0, 10],
    description: 'How long have you known each other for',
  },
  {
    id: 'emotion',
    label: 'Emotions',
    outcome: [
      {
        label: 'ttt',
        formula: (value) => {
          return (Number(value['ups-and-downs']) >= Number(value.likes) && value['different-location'] === 1);
        },
      },
      {
        label: 'smc',
        formula: (value) => {
          return (Number(value.likes) > Number(value['ups-and-downs']) && value['different-location'] === 1);
        },
      },
      {
        label: 'nmhf',
        formula: (value) => {
          return value['different-location'] === 0;
        },
      },
    ],
    group: [
      {
        id: 'ups-and-downs',
        label: 'Ups and Downs',
        range: [0, 10],
        description: 'a lot of emotional ups and downs between you and the friend (lots of likes, sad faces, reactions)',
      },
      {
        id: 'likes',
        label: 'Amount of likes of each other posts',
        range: [0, 10],
        description: 'a lot of emotional ups and downs between you and the friend (lots of likes, sad faces, reactions)',
      },
      {
        id: 'different-location',
        label: 'Current situation',
        radio: [
          {
            label: 'Yes',
            value: 1,
            selected: true,
          },
          {
            label: 'No',
            value: 0,
          },
        ],
        description: 'Living in different locations',
      },
    ],
  },
  {
    id: 'activities',
    label: 'Friends tagged',
    checkbox: [
      {
        label: 'Travelling',
        value: 'travel',
      },
      {
        label: 'Eating',
        value: 'eat',
      },
      {
        label: 'Watching a movie',
        value: 'movie',
      },
    ],
    description: 'Living in different locations',
  },
  {
    id: 'quirks',
    label: 'Friendship quirks',
    outcome: [
      {
        label: 'Weird friend',
        formula: (value) => {
          return Number(value['weird-time']) >= Number(value['same-group']) &&
                 Number(value['weird-time']) >= Number(value['same-event']);
        },
      },
      {
        label: 'Belong to the same group',
        formula: (value) => {
          return Number(value['same-group']) >= Number(value['weird-time']) &&
                 Number(value['same-group']) >= Number(value['same-event']);
        },
      },
      {
        label: 'Always going to the same events',
        formula: (value) => {
          return Number(value['same-event']) >= Number(value['weird-time']) &&
                 Number(value['same-event']) >= Number(value['first-like']);
        },
      },
    ],
    group: [
      {
        id: 'weird-time',
        label: 'Weird timing',
        range: [0, 10],
        description: 'How many times the user interact with post in weird times',
      },
      {
        id: 'same-group',
        label: 'Share same group',
        range: [0, 10],
        description: 'How many groups user and friend share in common',
      },
      {
        id: 'same-event',
        label: 'Went to same event',
        range: [0, 10],
        description: 'How many events user and friends went together',
      },
    ],
  },
  {
    id: 'quantify',
    label: 'Quantify friendship',
    outcomeLabels: {
      low: 'You could have written 100 amount pages',
      medium: 'you could have written Harry Potter book',
      high: 'It would stretch the length of two basketball courts',
      emoji: 'We communicate in emojis',
    },
    outcome: [
      {
        label: 'We communicate in words',
        formula: (value) => {
          if (Number(value.words) >= Number(value.emoji)) {
            switch (true) {
              case value.words > 0 && value.words <= 1000:
                return 'low';
              case value.words > 1000 && value.words <= 50000:
                return 'medium';
              default:
                return 'high';
            }
          }

          return false;
        },
      },
      {
        label: 'We communicate in emojis',
        formula: (value) => {
          return Number(value.emoji) >= Number(value.words) ? 'emoji' : false;
        },
      },
    ],
    group: [
      {
        id: 'words',
        label: 'Quantify text',
        range: [0, 100000],
        description: 'How many events user and friends went together',
      },
      {
        id: 'emoji',
        label: 'Quantify emoji/reactions',
        range: [0, 100000],
        description: 'How many events user and friends went together',
      },
    ],
  },
  {
    id: 'smile',
    label: 'Smile =)',
    range: [0, 1000],
    description: 'How many times you made each other smile',
  },
];

export default sliders;
