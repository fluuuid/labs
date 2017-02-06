import React, { PropTypes } from 'react';
import { find } from 'lodash';
import sliders from './sliders-data';
// import { map, round } from './utils';
//

const getYearsMet = (y) => {
  const years = Math.max(1, y || 1);
  return `${years} ${(years > 1 ? 'years' : 'year')}`;
};

const friendTagCopy = {
  movie: `<mark>A 3D version of a post swoops in, surrounded by reels of celluloid, popcorn and stars.<br>
    <b>John is watching <i>2001: A Space Odyssey – with Marija, 3 Feb 2013</i></b></mark>`,
  feeling: `<mark>A 3D version of a post swoops in, surrounded by halos and angels.<br>
      <b>John is feeling <i>blessed</i> – with Marija, <i>3 Feb 2013</i></b></mark>`,
  travel: `<mark>A 3D version of a post swoops in, surrounded by planes and tickets.<br>
        <b>John is travelling to Reykjavic – with Marija, <i>3 Feb 2013</i></b></mark>`,
};

const scripts = {
  ttt: `<p><mark>
    <i>(If they had tough times…)</i><br>
      Music key change: less cheerful, more heroic.<br>
  The colour palette darkens a little and the movement slows down. A card drifts in:<br>
  <br><b>We’ve seen some tough times...</b><br><br>
  A photo rises up, showing you and your friend at the end of a marathon, with the comment:<br>
  <br><b>“We survived!” – John</b><br><br>
  That falls over backwards and in its place rises a comment from another post entirely.<br>
  <br><b>“Hey, man – sorry to hear the news. :( Get well soon.” – Marija</b><br><br>
  The music starts to pick up once more as we lead into the next segment.<br>
  Another card rises up with the message:<br>
  <br><b>But we’ve always had our moments</b>
  </mark>
  </p>`,

  ttt_final: `
  <mark>And the final message appears, over a photo of the two of you together.<br>
  <br><b>Thanks for always being there.<br>
  Happy friendversary!</b></mark>`,

  smc: `<p><mark>
    <i>(If they have lots in common…)</i><br>
Music remains upbeat.<br>
Two halves of a card fly in and conjoin to form the message:<br>
<br><b>We have so much in common</b><br><br>
Two parallel streams of identical images rush up the screen, showing profile/cover photos from your mutually-liked pages, sports, TV shows, movies, books. <br>
<br><b>And we hang out so often...</b><br><br>
More photos come together in separate halves and conjoin. We see the 3 top-rated photos featuring both friends.<br>
This includes the top comments from either friend on each photo, if suitable.<br>
<br><b>“Nice tie! ;)” – Marija</b><br><br>
The music changes as we lead into the next segment.<br>
Two halves of a card conjoin forming the message:<br>
<br><b>We’ve had our moments, big and small...</b>
</mark></p>
  `,

  smc_final: `<mark>
  And the final message appears, over a photo of the two of you together.<br>
  <br><b>Thanks for sharing so much with me.<br>
  Happy friendversary!</b></mark>`,

  nmhf: `<p><mark>
    <i>(If they live far apart...)</i><br>
Music key change: less cheerful, more wistful.<br>
A globe shows two flags indicating the friends’ locations.<br>
<br><b>London&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;San Francisco</b><br><br>
A postcard floats in, text side facing us:<br>
<br><b>No matter how far apart</b><br><br>
And the postcard flips over to reveal a photo of you raising a glass, with the ‘handwritten’ comment:<br>
<br><b>“Wish you were here!” – John</b><br><br>
Another postcard flies in from the other direction, showing a later wall post from your friend:<br>
<br><b>“Happy birthday, man. When are you getting your ass over here to visit? :/” – Marija</b><br>
The music starts to pick up once more as we lead into the next segment.<br>
Another postcard flies in with the message:<br>
<br><b>We’ve always had our moments</b><mark>
  </p>
  `,

  nmhf_final: `<mark>
  And the final message appears, over a photo of the two of you together.<br>
  <br><b>Even when we’re not there, we’re there for each other.<br>
  Happy friendversary!</b><mark>`,
};

const timeline = content => [
  {
    content: '<p>Music begins, upbeat and cheerful.<br>A photo of you swoops in, cropped to your face.</p>',
  },
  {
    content: `<p>The photo of you is joined by a similar cropped photo of your friend, along with your names. <br>
              <br>A hero shot of your portraits for a moment, both together:
              <b>John & Marija</b></p>`,
  },
  {
    content: `<p>The photos whoosh out of shot and are replaced by a 3D version of the ‘Became friends with’ post from when one befriended the other.
              <br><br><b>We have been friends for <b><mark>${getYearsMet(content['how-long-meet'])}</mark></b>`,
  },
  {
    content: `
    <p>
      Floating around that post are other words and images that reflect how you met – common locations, workplaces, schools or mutual friends from the same time and place.
      <br><b>
      ${content['places-met'] ? content['places-met'].split(',').map(a => `<br><mark>${find(sliders[1].checkbox, { value: a }).output}</mark>`) : ''}
      </b>
    </p>
    `,
  },
  {
    content: `${scripts[content.emotion]}`,
  },
  {
    content: `<p>${friendTagCopy[content.activities]}</p>`,
  },
  {
    content: `<p><b>Even if not everyone likes what we like</b><br>
      And there it is: an image of Weird Al Yankovic, taken from his fan page.</p>`,
  },
  {
    content: `<p>
      Another gear change, from micro to macro. We pull back and, surprisingly, we’re now in orbit around a basketball.<br>
      <br><b>If we printed out all our comments on one line...</b><br>
        And that basketball drops through a hoop and the camera turns to show the whole length of the court.<br>
      <b><mark>${content.quantify}<mark></b><br>
      A stream of ticker tape unspools, to demonstrate.<br>`,
  },
  {
    content: `<p>
      The basketball courts fall away and we see a scoreboard, with its numbers whirring upwards from zero, with text appearing either side of it, until the numbers reach their target:<br>
      <b>Over the past <mark>${content['how-long-meet'] || 0}</mark> years, we’ve made each other smile <mark>${content.smile}</mark> times.`,
  },
  {
    content: `<p>The screen is showered with 3D smiley emoticons, creating a wipe...<br>
      The music rises to a climax!
      <p>${scripts[`${content.emotion}_final`]}</p>
    </p>`,
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
