# `@stencil/express-preact-ssr-handler`

> Returns configured Express app handler for serving all requests and enabling server-side rendering for the app

## Usage

```
import getExpressReactSSRHandler from 'express-preact-ssr-handler';

expressRouter.use(
  '/',
  getExpressReactSSRHandler({
    routes,
    clientStats,
    publicPath,
  }),
);
```
