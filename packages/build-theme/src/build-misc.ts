export const defaultMiscThemeProperties = {
  borderRadius: {
    unit: 0.4,
    unitScale: 0.2,
  },
  border: {
    unit: 0.1,
  },
  breakpoints: {
    md: 60 + 'rem', // 600px
  },
};

export default function buildMisc(miscThemeProperties = defaultMiscThemeProperties) {
  return {
    borderRadius: {
      base: miscThemeProperties.borderRadius.unit + 'rem', // 4px | 0.4rem

      // 2px | 0.2rem
      small:
        miscThemeProperties.borderRadius.unit - miscThemeProperties.borderRadius.unitScale + 'rem',

      // 6px | 0.6rem
      large:
        miscThemeProperties.borderRadius.unit + miscThemeProperties.borderRadius.unitScale + 'rem',

      // 8px | 0.8rem
      xlarge:
        miscThemeProperties.borderRadius.unit +
        miscThemeProperties.borderRadius.unitScale * 2 +
        'rem',
      // 10px | 1rem
      xxlarge:
        miscThemeProperties.borderRadius.unit +
        miscThemeProperties.borderRadius.unitScale * 3 +
        'rem',
      // 12px | 1.2rem
      xxxlarge:
        miscThemeProperties.borderRadius.unit +
        miscThemeProperties.borderRadius.unitScale * 4 +
        'rem',

      round: '50%',

      // 15px | 1.5rem
      custom: (
        multiplier: 12 | 15 | 20 | 25 | 0, // 15 - 15px, 20 - 20px
      ) => multiplier * 0.1 + 'rem',
    },
    border: {
      base: miscThemeProperties.border.unit + 'rem', // 1px
    },
    zIndex: {
      xxsmall: '2',
      xsmall: '3',
      small: '4',
      base: '5',
      large: '6',
      xlarge: '9',
      xxlarge: '99',
      xxxlarge: '999',
      maximum: '1999',
    },
  };
}
