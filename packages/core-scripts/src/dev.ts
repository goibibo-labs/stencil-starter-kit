import {rootPath, serverPort, webpackPublicPath, webpackServerEntry} from 'application-config';
import webpackConfig from '@stencil/webpack-config';
import webpack from 'webpack';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {resolve} from 'path';

const webpackClientConfig = webpackConfig('development', {platform: 'client'});
// update webpackClientConfig with HMR changes
// webpackClientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
const webpackServerConfig = webpackConfig('development', {platform: 'server'});

// @ts-ignore
const webpackCompiler = webpack([webpackClientConfig, webpackServerConfig]);
const subRoutes = Object.keys(webpackServerEntry); // to support multi vertical

const app = express();
app.use('/stencil-doc', express.static(resolve(rootPath, 'stencil-doc')));
app.use(
  webpackDevMiddleware(webpackCompiler, {
    serverSideRender: true,
    publicPath: webpackPublicPath,
  }),
);
// NOTE: Only the client bundle needs to be passed to `webpack-hot-middleware`.
app.use(
  webpackHotMiddleware(webpackCompiler.compilers.find(compiler => compiler.name === 'client')),
);

subRoutes.forEach(chunkName => {
  app.use(webpackHotServerMiddleware(webpackCompiler, {chunkName}));
});

app.listen(serverPort, () => console.info(`Stencil is listening on port ${serverPort}!`));
