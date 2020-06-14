require('@stencil/newrelic-instance');
import {
  rootPath,
  serverPort,
  webpackPublicPath,
  webpackServerEntry,
  webpackClientOutput,
  webpackServerOutput,
} from 'application-config';
import express from 'express';
import path from 'path';
import expressStaticGzip from 'express-static-gzip';
import {resolve} from 'path';

const clientStatsPath = path.join(webpackClientOutput, 'manifest.json');
const clientStats = require(clientStatsPath);

const serverStatsPath = path.join(webpackServerOutput, 'manifest.json');
const serverStats = require(serverStatsPath);

const subRoutes = Object.keys(webpackServerEntry); // to support multi vertical

const app = express();
subRoutes.forEach(chunkName => {
  const routePath = path.join(webpackServerOutput, serverStats.files[`${chunkName}.js`]);
  const serverRenderer = require(routePath).default;
  app.use(serverRenderer({clientStats}));
});

const startedAt = new Date();
app.use('/stencil-doc', express.static(resolve(rootPath, 'stencil-doc')));
app.use('/stencil/ping', (req, res) => {
  res.send({
    pong: true,
    serverStartedAt: startedAt.toString(),
  });
});

app.use(
  webpackPublicPath,
  expressStaticGzip(webpackClientOutput, {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    // setHeaders: function (res, path) {
    //   res.setHeader("Cache-Control", "public, max-age=378432000");
    // }
  }),
);

app.listen(serverPort, () => console.info(`Stencil is listening on port ${serverPort}!`));
