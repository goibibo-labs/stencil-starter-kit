import {
  webpackContext,
  webpackClientEntry,
  webpackServerEntry,
  webpackClientOutput,
  webpackServerOutput,
  webpackPublicPath,
  webpackPublicDomain,
  EnvConfigPath,
  enablePreact,
} from 'application-config';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import autoprefixer from 'autoprefixer';
import ManifestPlugin from 'webpack-manifest-plugin';
import babelPresetStencil from '@stencil/babel-preset-stencil';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import {GenerateSW} from 'workbox-webpack-plugin';

export default function webpackConfig(env, argv) {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const platform = argv.platform || 'client';
  const isClient = platform === 'client';
  const isServer = !isClient;
  const {presets, plugins} = babelPresetStencil();
  const envJsonPath = EnvConfigPath({
    BUILD_ENV: process.env.BUILD_ENV || 'dev',
    isClient,
    isEnvDevelopment,
  });
  const envJson = require(envJsonPath);
  const hashToBeUsed = isEnvProduction ? 'contenthash' : 'hash';

  // because for client dev we need to inject HMR support
  const entry = {};
  Object.keys(webpackClientEntry).forEach(key => {
    if (isEnvDevelopment && !enablePreact) {
      entry[key] = [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        webpackClientEntry[key],
      ];
      return;
    }
    entry[key] = webpackClientEntry[key];
  });

  return {
    name: isClient ? 'client' : 'server',
    target: isClient ? 'web' : 'node',
    mode: env, // https://webpack.js.org/configuration/mode/#usage
    bail: true, // https://webpack.js.org/configuration/other-options/#bail
    context: webpackContext, // this is important since this config can be used from custom location as node_modules
    entry: isClient ? entry : webpackServerEntry,
    output: {
      path: isClient ? webpackClientOutput : webpackServerOutput,
      filename: `static/js/[name].[${hashToBeUsed}:8].js`,
      chunkFilename: `static/js/[name].[${hashToBeUsed}:8].chunk.js`,
      publicPath: `${webpackPublicDomain}${webpackPublicPath}`,
      libraryTarget: isServer ? 'commonjs2' : undefined,
    },
    devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets, // this is explicitly added here coz in the storybook setup babel config was not getting picked at all
              plugins,
            },
          },
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        {
          // For pure CSS (without CSS modules)
          test: /\.css$/i,
          // exclude: /\.module\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(woff|woff2|eot|ttf|png|gif|svg)?$/,
          exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'static/media',
                name(file) {
                  if (isEnvDevelopment) {
                    return '[path][name].[ext]';
                  }

                  return `[name]-[${hashToBeUsed}].[ext]`;
                },
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
            },
            /**
             * PostCSS converts CSS into AST format to be consumed by plugins/loaders
             * We are using AutoPrefixer to add browser based vendor prefixes
             * More on: https://github.com/postcss/postcss
             */
            {
              loader: 'postcss-loader',
              options: {
                autoprefixer: {
                  browsers: ['last 2 versions'],
                },
                plugins: () => [autoprefixer],
              },
            },
            {loader: 'less-loader'},
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      alias: {
        ...(enablePreact
          ? {
              react: 'preact/compat',
              'react-dom/test-utils': 'preact/test-utils',
              'react-dom': 'preact/compat',
            }
          : {}),
      },
      modules: ['packages', 'verticals', 'node_modules', 'hotels'],
      extensions: [
        isServer ? '.server.tsx' : '.client.tsx',
        isServer ? '.server.jsx' : '.client.jsx',
        isServer ? '.server.ts' : '.client.ts',
        isServer ? '.server.js' : '.client.js',
        '.web.tsx',
        '.web.jsx',
        '.web.ts',
        '.web.js',
        '.tsx',
        '.jsx',
        '.ts',
        '.js',
        '.json',
      ],
    },
    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
          },
        },
      },
    },
    plugins: [
      new GenerateSW(),
      new webpack.DefinePlugin({
        __DEV__: isEnvDevelopment,
        __SERVER__: isServer,
        __CLIENT__: isClient,
        __ENV_CONFIG__: JSON.stringify(envJson),
      }),
      isEnvDevelopment && isClient && new webpack.HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({
        filename: `static/css/[name].[${hashToBeUsed}:8].css`,
      }),
      isEnvProduction &&
        new ManifestPlugin({
          generate: (seed, files, entrypoints) => {
            const manifestFiles = files.reduce((manifest, file) => {
              manifest[file.name] = file.path.split(
                `${webpackPublicDomain}${webpackPublicPath}`,
              )[1];
              return manifest;
            }, seed);
            const entrypointFiles = {};
            Object.keys(entrypoints).forEach(ep => {
              const epData = entrypoints[ep];
              entrypointFiles[ep] = {
                assets: epData,
              };
            });

            return {
              publicPath: `${webpackPublicDomain}${webpackPublicPath}`,
              files: manifestFiles,
              entrypoints: entrypointFiles,
            };
          },
        }),
    ].filter(plugin => !!plugin),
    externals: isServer ? [nodeExternals()] : undefined,
  };
}
