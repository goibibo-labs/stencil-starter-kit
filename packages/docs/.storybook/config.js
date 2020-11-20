import React from 'react';
import {create} from '@storybook/theming';
import {ThemeProvider} from 'styled-components';
// import {defaultTheme} from '@stencil/build-theme';
// import {GlobalStyles} from '@stencil/global-style';

// import centered from './decorator-centered';
import {addParameters, configure, addDecorator} from '@storybook/react';
import {withPerformance} from 'storybook-addon-performance';

addDecorator(withPerformance);

// Option defaults:
addParameters({
  viewport: {
    // viewports: newViewports, // newViewports would be an ViewportMap. (see below for examples)
    defaultViewport: 'iphone6',
  },
  options: {
    storySort: (a, b) => {
      const sectionA = a[1].id.split('-')[0];
      const sectionB = b[1].id.split('-')[0];

      return sectionB.localeCompare(sectionA);
    },
    theme: create({
      base: 'light',
      brandTitle: 'Stencil',
      brandUrl: 'https://necolas.github.io/react-native-web',
      // To control appearance:
      // brandImage: 'http://url.of/some.svg',
    }),
    /**
     * regex for finding the hierarchy separator
     * @example:
     *   null - turn off hierarchy
     *   /\// - split by `/`
     *   /\./ - split by `.`
     *   /\/|\./ - split by `/` or `.`
     * @type {Regex}
     */
    hierarchySeparator: /\/|\./,
    /**
     * regex for finding the hierarchy root separator
     * @example:
     *   null - turn off multiple hierarchy roots
     *   /\|/ - split by `|`
     * @type {Regex}
     */
    hierarchyRootSeparator: /\|/,
    panelPosition: 'bottom',
  },
});

addDecorator(story => (
  <>
    {/* <ThemeProvider theme={defaultTheme}> */}
    {/* <GlobalStyles /> */}
    <div id="modal-root"></div>
    {story()}
    {/* </ThemeProvider> */}
  </>
));

const context = require.context('../src', true, /\.stories\.(js|mdx|ts|tsx)$/);

configure(context, module);
