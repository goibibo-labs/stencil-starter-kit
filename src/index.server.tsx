import express from 'express';
import getExpressReactSSRHandler from 'express-preact-ssr-handler';
import {h} from 'preact';
/** @jsx h */

export default function serverRenderer(options) {
  const {clientStats} = options;
  const router = express.Router();
  const {entrypoints, publicPath} = clientStats;
  router.use(
    '/',
    getExpressReactSSRHandler({
      routes: [
        {
          path: '/',
          component: () => <div>Hello world</div>,
          key: 'home',
        },
      ],
      clientStats: entrypoints['main'],
      publicPath,
    }),
  );
  return router;
}
