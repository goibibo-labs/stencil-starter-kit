const colorPalette = {
  downriver: {
    base: '#141823',
    dark: '#46484d',
    medium: '#777777',
    light: '#C2C2C2',
  },

  ash: {
    base: '#647A97',
    dark: '#E1E7EE',
    medium: '#EFF3F8',
    light: '#F4F7FA',
  },

  shadow: {
    light: 'rgba(0, 0, 0, 0.13)',
    base: 'rgba(0,0,0,0.25)',
    dark: 'rgba(0,0,0,0.5)',
  },

  Numbering: {
    base: 'rgba(216, 216, 216, 0.4)',
  },
};

export function buildColors() {
  return colorPalette;
}
