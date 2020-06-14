import webpackConfig from '@stencil/webpack-config';
import webpack from 'webpack';

const webpackClientConfig = webpackConfig('production', {platform: 'client'});
const webpackServerConfig = webpackConfig('production', {platform: 'server'});
// @ts-ignore
const webpackCompiler = webpack([webpackClientConfig, webpackServerConfig]);

webpackCompiler.run((err, stats) => {
  console.error(err);
  // console.info(stats.toJson('minimal'));
});
