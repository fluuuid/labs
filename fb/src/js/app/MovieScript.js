import React, { PropTypes } from 'react';
import { find } from 'lodash';
import sliders from './sliders-data';
// import { map, round } from './utils';

const scripts = {
  ttt: `<p>
    <i>(If they had tough times…)</i><br>
    Music key change: less cheerful, more heroic.<br>
    A card introduces this new segment.<br>
    <b>We’ve seen some tough times...</b><br>
    A photo flies in showing you and your friend at the end of a marathon, with the comment:<br>
    <b>“We survived!” – John</b><br>
    And then a comment from another post entirely.<br>
    <b>“Hey, man – sorry to hear the news. :( Get well soon.” – Marija</b><br>
    The music starts to pick up once more as we lead into the next segment.<br>
    A card flies in with the message:<br>
    <b>But we’ve always had our moments</b>
  </p>`,

  ttt_final: `
  And the final message appears, over a photo of the two of you together.<br>
  Thanks for always being there.<br>
  Happy friendversary!`,

  smc: `<p>
    <i>(If they have lots in common…)</i><br>
    Music remains upbeat.<br>
    A card introduces this new segment.<br>
    <b>We have so much in common...</b><br>
    A carousel whips by featuring profile/cover photos from your mutually-liked pages, sports, TV shows, movies, books. <br>
    <b>And we hang out so often...</b><br>
    We see the 3 top-rated photos featuring both friends.<br>
    This includes the top comments from either friend on each photo, if suitable.<br>
    <b>“Nice tie! ;)” – Marija</b><br>
    The music changes as we lead into the next segment.<br>
    A card flies in with the message:<br>
    <b>We’ve had our moments, big and small...</b><br>
  `,

  smc_final: `
  And the final message appears, over a photo of the two of you together.<br>
  Thanks for always being there.<br>
  Happy friendversary!`,

  nmhf: `<p>
    <i>(If they live far apart…)</i><br>
    Music key change: less cheerful, more wistful.<br>
    A card introduces this new segment.<br>
    <b>No matter how far apart...</b><br>
    A map of the world shows two flags indicating the two friends’ locations.<br>
    A photo flies in showing you raising a glass, with the comment:<br>
    <b>“Wish you were here!” – John</b><br>
    And a later wall post:<br>
    <b>“Happy birthday, man. When are you getting your ass over here to visit? :/” – Marija</b><br>
    The music starts to pick up once more as we lead into the next segment.<br>
    A card flies in with the message:<br>
    <b>We’ve always had our moments</b><br>
  </p>
  `,

  nmhf_final: `
  And the final message appears, over a photo of the two of you together.<br>
  Thanks for always being there.<br>
  Happy friendversary!`,
};

const timeline = content => [
  {
    content: '<p>Music begins.<br>A photo of you swoops in, cropped to your face.</p>',
  },
  {
    content: '<p>The photo of you is joined by a similar cropped photo of your friend, along with your names. There you are, both together: <b>John & Marija</b></p>',
  },
  {
    content: `<p>The photos whoosh out of shot and are replaced by a 3D version of the ‘Became friends with’ post from when one befriended the other. <br />John & Marija have been friends for <b><mark>${content['how-long-meet'] || 0} years</mark></b>`,
  },
  {
    content: `
    <p>
      Floating around that post are other words and images that reflect how you met – common locations, workplaces, schools or mutual friends from the same time and place.<br>
      <b><mark>${content['how-meet'] ? find(sliders[0].radio, { value: content['how-meet'] }).label : ''}<mark></b>
    </p>
    `,
  },
  {
    content: scripts[content.emotion],
  },
  {
    content: `<p>A 3D version of a post swoops in, surrounded by reels of celluloid, popcorn and stars.<br>
    <b><mark>${content.activities}<mark></b></p>`,
  },
  {
    content: `<p><b>Even if not everyone gets us</b><br>And there it is: an image of Weird Al Yankovic, taken from his fan page. <sub>${content.quirks}</sub></p>`,
  },
  {
    content: `<p>
      We pull back and, surprisingly, we’re now in orbit around a basketball.<br>
      <b>If we printed out all our comments on one line...</b><br>
      And that basketball drops through a hoop and the camera turns to show the whole length of the court – and another one, end to end.<br>
      <b><mark>${content.quantify}<mark></b><br>
      A stream of ticker tape unspools, to demonstrate.<br>`,
  },
  {
    content: `<p>
      The basketball courts fall away and we see a scoreboard, with its numbers whirring upwards from zero, with text appearing either side of it, until the numbers reach their target:<br>
      <b>Over the past <mark>${content['how-long-meet'] || 0}</mark> years, we’ve made each other smile ${content.smile} times.`,
  },
  {
    content: `<p>The screen is showered with 3D smiley emoticons, creating a wipe...<br>
      The music rises to a climax!
      ${scripts[`${content.emotion}_final`]}
      <p>`,
  },
  {
    content: 'Facebook logo',
  },
];

const MovieScript = ({ content }) => {
  return (
    <div className="jumbotron">
      {
        timeline(content).map((t, i) => <div className="timestamp" key={`block${i}`}>
          <p dangerouslySetInnerHTML={{ __html: String(t.content).replace(/undefined/, '') }} />
        </div>)
      }
    </div>);
};

MovieScript.propTypes = {
  content: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

export default MovieScript;
