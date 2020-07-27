# `@stencil/megatron`

> Abstraction for Network adapter extending native fetch with node-fetch for server-side interaction, with in-built support of error logging on failure, short-circuiting, and other controls

## Usage

```
import Megatron from '@stencil/megatron';

await Megatron({
  name: 'API name',
  type: 'GET' | 'POST',
  url,
  credentials: optional,
  requestData: optional,
  headers: optional,
});
```
