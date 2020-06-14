import querystring from 'query-string';
import logger from '@stencil/logger';
import fetch from './fetch';
/**
 * Objective of this module is to provide following features:
 * - [x] Simple wrapper for making network requests
 * - [ ] Latency Tracking
 * - [ ] Auto push GA analytics related to API endpoints
 * - [ ] Cancel if existing request over the air
 * - [ ] Retry as per specified count
 * - [ ] Short-Circuit request as per defined time
 * - [ ] Priority fetching
 * - [ ] No network response
 * - [ ] Logging utility logger/index.ts or logger.server.ts
 */

// https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
// can implement fetch cancel request via AbortController, but require polyfill, AbortController also supported under node-fetch

export type xhrType = 'GET' | 'POST';

interface IXhrHelper<RequestDataGeneric> {
  name: string;
  type: xhrType;
  url: string;
  headers?: object;
  requestData?: object | string;
  credentials?: string;
}

export default async function megatron<RequestDataGeneric, ResponseDataGeneric>({
  name,
  headers,
  type,
  url,
  requestData,
  credentials,
}: IXhrHelper<RequestDataGeneric>): Promise<ResponseDataGeneric> {
  try {
    let params = requestData;

    // const headers = new Headers();

    var options = {
      headers,
      credentials: credentials || 'include',
      method: type,
    };

    if (type === 'POST') {
      options.body = params;
    }
    const rawResponse = await fetch(url, options);
    const respJson = await rawResponse.json();
    return respJson;
  } catch (err) {
    logger.error({
      type: '@stencil/megatron',
      message: 'call failed',
      data: {
        name,
        url,
      },
      error: err,
    });
    return undefined;
  }
}

export async function get(url, {name, logLevel = 'verbose'}) {
  try {
    const response = await fetch(url);
    const responseJson = await response.json();
    logger[logLevel]({
      type: '@stencil/megatron',
      message: 'api response',
      data: {
        name,
        url,
        data: responseJson,
      },
    });
    return {data: responseJson};
  } catch (err) {
    logger.error({
      type: '@stencil/megatron',
      message: 'get call failed',
      data: {
        name,
        url,
      },
      error: err,
    });
    return {data: undefined};
  }
}
