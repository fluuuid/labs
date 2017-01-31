import React, { PropTypes } from 'react';
import { map, round } from './utils';

const palettes = [
  ['#765B64', '#4E344D', '#431E41', '#D84370', '#FEEDA8'],
  ['#B10039', '#D08C9F', '#B10057', '#1E1348', '#EFDECE'],
  ['#765946', '#5D4E40', '#584941', '#47362D', '#0A0101'],
  ['#3C72D3', '#3C82D3', '#EFE94F', '#EFAE38', '#B2601E'],
  ['#34BFFF', '#2100E7', '#FFCF0D', '#E2331E', '#A200FF'],
];

const ColourPalette = ({ index }) => {
  const paletteIndex = round(map(index, 0, 1, 0, palettes.length - 1));
  const palette = palettes[paletteIndex];
  return (
    <div className="palette">
      {palette.map((e) => {
        return (
          <div
            key={e}
            className="palette-color"
            style={{
              backgroundColor: e,
              width: `${100 / palette.length}%`,
            }}
          />
        );
      })}
    </div>
  );
};

ColourPalette.propTypes = {
  index: PropTypes.number.isRequired,
};

export default ColourPalette;
