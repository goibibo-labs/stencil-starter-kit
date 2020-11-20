export const defaultSpacingThemeProperties = {
  unit: 1,
};

export default function buildSpacing(spacingThemeProperties = defaultSpacingThemeProperties) {
  return {
    nospacing: 0,
    xxsmall: spacingThemeProperties.unit * 0.1 + 'rem', // 1px | 0.1rem
    xsmall: spacingThemeProperties.unit * 0.2 + 'rem', // 2px | 0.2rem
    small: spacingThemeProperties.unit * 0.5 + 'rem', // 5px | 0.5rem
    base: spacingThemeProperties.unit + 'rem', // 10px | 1rem
    large: spacingThemeProperties.unit * 1.5 + 'rem', // 15px | 1.5rem
    xlarge: spacingThemeProperties.unit * 2 + 'rem', // 20px | 2rem
    xxlarge: spacingThemeProperties.unit * 2.5 + 'rem', // 25px | 2.5rem
    custom: (
      multiplier: 3 | 4 | 6 | 7 | 8 | 12, // 3px 4px 6px 7px 8px | 0.3rem 0.4rem etc...
    ) => spacingThemeProperties.unit * (multiplier * 0.1) + 'rem',
  };
}
