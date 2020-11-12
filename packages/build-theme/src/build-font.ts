// kept only for reference
// const unit = 2;
// const ico8 = unit * 4 + 'px'; // xsmall
// const ico10 = unit * 5 + 'px'; // small
// const ico12 = unit * 6 + 'px'; // regular
// const ico18 = unit * 9 + 'px'; // large

export const defaultFontThemeProperties = {
  fontFamily: 'Quicksand',
  unit: 1.2,
  unitScale: 1,
  unitScaleStartingPoint: 0.2,
};

export default function buildFont(fontThemeProperties = defaultFontThemeProperties) {
  return {
    fontFamily: fontThemeProperties.fontFamily,
    base: fontThemeProperties.unit + 'rem', // 12px | 1.2rem
    small: fontThemeProperties.unit - fontThemeProperties.unitScaleStartingPoint + 'rem', // 10px | 1rem
    xsmall: fontThemeProperties.unit - fontThemeProperties.unitScaleStartingPoint * 2 + 'rem', // 8px | 0.8rem
    large: fontThemeProperties.unit + fontThemeProperties.unitScaleStartingPoint * 3 + 'rem', // 18px | 1.8rem
    lineHeight: {
      base: 1.33,
    },
    custom: (
      multiplier: 14 | 16 | 20 | 22 | 24, // 14 - 14px | 16 - 16px | 20px 22px 24px
    ) => multiplier * 0.1 + 'rem',
  };
}
