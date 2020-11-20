const webpackConfig = require('@stencil/webpack-config').default;
const path = require('path');

module.exports = {
  stories: [
    // '../../../verticals/app/src/**/*.stories.(js|mdx|ts|tsx)',
  ],
  addons: [
    {
      name: '@storybook/preset-typescript',
      options: {
        tsLoaderOptions: {
          configFile: path.resolve(__dirname, '../tsconfig.json'),
        },
        // include: [path.resolve(__dirname, '../src')],
      },
    },
    '@storybook/addon-viewport/register',
    '@storybook/addon-a11y/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-notes/register',
    'storybook-addon-performance/register',
  ],
  webpackFinal: async (config, {configType}) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    const webpackClientConfig = webpackConfig(
      configType === 'PRODUCTION' ? 'production' : 'development',
      {platform: 'client'},
    );

    config.resolve.extensions = webpackClientConfig.resolve.extensions;
    config.resolve.modules = webpackClientConfig.resolve.modules;
    config.module.rules = [...webpackClientConfig.module.rules];

    // Return the altered config
    return config;
  },
};
