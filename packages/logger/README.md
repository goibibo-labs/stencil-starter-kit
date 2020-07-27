# `@stencil/logger`

> Exposes custom logging implementation for client / server consumption. On server-side, exposes custom formatted winston logger with prefix based on configurations from application-config, for proper segregation of logs on server side for ingestion. Client side logging can be extended on the same format of winston with any customized implementation.

## Usage

```
import logger from '@stencil/logger';

logger.error({
  type,
  message,
  data,
  error,
});
```
