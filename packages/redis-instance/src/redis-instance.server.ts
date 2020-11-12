import redis from 'redis';
import logger from '@stencil/logger';

const redisInstances = {};

export function initRedis(options) {
  console.log(options);
  return new Promise(resolve => {
    const {host, port, db} = options;
    const instanceKey = `${host}:${port}-${db}`;
    if (redisInstances[instanceKey]) {
      logger.verbose({
        type: '@stencil/redis-instance',
        message: 'Redis connection is already present',
        data: {
          ...options,
        },
      });
      resolve(redisInstances[instanceKey]);
      return;
    }
    const client = redis.createClient(options);
    client.on('connect', () => {
      redisInstances[instanceKey] = client;
      logger.info({
        type: '@stencil/redis-instance',
        message: 'Redis connection successful',
        data: {
          ...options,
        },
      });
      resolve(client);
      return;
    });

    client.on('error', err => {
      logger.error({
        type: '@stencil/redis-instance',
        message: 'Redis connection failed',
        data: {
          ...options,
        },
        error: err,
      });
      resolve(undefined);
      return;
    });
  });
}

export async function getRedis(options) {
  const {host, port, db} = options;
  const instanceKey = `${host}:${port}-${db}`;
  let instance = redisInstances[instanceKey];
  if (instance) {
    return instance;
  }

  return await initRedis(options);
}
