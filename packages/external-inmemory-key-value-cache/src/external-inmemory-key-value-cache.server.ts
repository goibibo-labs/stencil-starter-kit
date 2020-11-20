import {getRedis} from '@stencil/redis-instance';
import zlib from 'zlib';
import {promisify} from 'util';
import logger from '@stencil/logger';

const instances = {};

export async function init(options) {
  const {host, port, db} = options;
  const instanceKey = `${host}:${port}-${db}`;
  if (instances[instanceKey]) {
    // already initialised
    return;
  }
  const client = await getRedis(options);
  if (!client) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message:
        'Redis instance not found. Initialise redis before initialising external-inmemory-key-value-cache',
      data: {
        ...options,
      },
    });
    return;
  }
  const getFromRedis = promisify(client.get).bind(client);
  const setToRedis = promisify(client.set).bind(client);
  instances[instanceKey] = {
    client,
    getFromRedis,
    setToRedis,
  };

  logger.info({
    type: '@stencil/external-inmemomry-key-value-cache',
    message: 'external-inmemomry-key-value-cache initialised',
    data: {
      ...options,
    },
  });
}

export async function setKey({key, value}, options) {
  const {host, port, db, ttl} = options;
  const instanceKey = `${host}:${port}-${db}`;
  const {client, setToRedis} = instances[instanceKey] || {};
  if (!client) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: 'Redis instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Caching failed`,
      data: {
        key,
      },
      error: 'Redis instances not found',
    });
    return false;
  }
  try {
    const gzipedValue = zlib.gzipSync(value);
    await setToRedis(key, gzipedValue.toString('base64'), 'EX', parseInt(ttl, 10));
    logger.silly({
      type: '@stencil/external-inmemory-key-value-cache',
      message: 'Cached successfully',
      data: {
        key,
      },
    });
    return true;
  } catch (err) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Caching failed`,
      data: {
        key,
      },
      error: err,
    });
  }
  return false;
}

export async function getKey({key}, options) {
  const {host, port, db, ttl} = options;
  const instanceKey = `${host}:${port}-${db}`;
  const {client, getFromRedis} = instances[instanceKey] || {};
  if (!client) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: 'Redis instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Cache retrieve failed`,
      data: {
        key,
      },
      error: 'Redis instances not found',
    });
    return undefined;
  }
  try {
    const value = await getFromRedis(key);
    if (value) {
      const ungzipedData = zlib.gunzipSync(new Buffer(value, 'base64'));
      logger.silly({
        type: '@stencil/external-inmemory-key-value-cache',
        message: 'Cache retrieved successfully',
        data: {
          key,
        },
      });
      return ungzipedData.toString();
    }
  } catch (err) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Cache retrieve failed`,
      data: {
        key,
      },
      error: err,
    });
  }
  return undefined;
}

export async function deleteKey({key}, options) {
  const {host, port, db, ttl} = options;
  const instanceKey = `${host}:${port}-${db}`;
  const {client, setToRedis} = instances[instanceKey] || {};
  if (!client) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: 'Redis instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Cache deletion failed`,
      data: {
        key,
      },
      error: 'Redis instances not found',
    });
    return false;
  }

  try {
    // set the same key with empty value and setting expire as 60 second as we don't have any delete api from redis
    await setToRedis(key, '', 'EX', 60);
    logger.silly({
      type: '@stencil/external-inmemory-key-value-cache',
      message: 'Cache deleted successfully',
      data: {
        key,
      },
    });
    return true;
  } catch (err) {
    logger.error({
      type: '@stencil/external-inmemory-key-value-cache',
      message: `Cache deletion failed`,
      data: {
        key,
      },
      error: err,
    });
  }
  return false;
}
