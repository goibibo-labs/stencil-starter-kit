import Aerospike from 'aerospike';
import {getAerospike} from '@stencil/aerospike-instance';
import zlib from 'zlib';
import {promisify} from 'util';
import logger from '@stencil/logger';

const instances = {};

const loggerType = '@stencil/external-inmemomry-cache-aerospike-connector';

export async function initAerospikeConnections(options: {
  ip: string;
  port: number;
  namespace: string;
}) {
  const {ip, port, namespace} = options;
  const instanceKey = `${ip}:${port}-${namespace}`;
  if (instances[instanceKey]) {
    // already initialised
    return;
  }

  const client = await getAerospike(options);

  if (!client) {
    logger.error({
      type: loggerType,
      message:
        'Aerospike instance not found. Initialise aerospike before initialising external-inmemory-key-value-cache',
      data: {
        ...options,
      },
    });
    return;
  }

  const getFromAerospike = promisify(client.get).bind(client);

  const setToAerospike = promisify(client.put).bind(client);

  const removeFromAerospike = promisify(client.remove).bind(client);

  instances[instanceKey] = {
    client,
    getFromAerospike,
    setToAerospike,
    removeFromAerospike,
  };

  logger.info({
    type: loggerType,
    message: 'external-inmemomry-cache-aerospike-connector initialised',
    data: {
      ...options,
    },
  });
}

export async function setKey({key, value}, options) {
  const {ip, port, namespace, set, ttl} = options;
  const instanceKey = `${ip}:${port}-${namespace}`;
  const {client, setToAerospike} = instances[instanceKey] || {};

  if (!client) {
    logger.error({
      type: loggerType,
      message: 'Aerospike instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: loggerType,
      message: `Caching failed`,
      data: {
        key,
      },
      error: 'Aerospike instances not found',
    });
    return false;
  }
  try {
    const gzipedValue = zlib.gzipSync(value);
    const aerospikeConfigKey = new Aerospike.Key(namespace, set, key);

    await setToAerospike(
      aerospikeConfigKey,
      {value: gzipedValue.toString('base64')},
      {
        ttl: parseInt(ttl, 10),
      },
    );

    logger.silly({
      type: loggerType,
      message: 'Cached successfully',
      data: {
        key,
      },
    });
    return true;
  } catch (err) {
    logger.error({
      type: loggerType,
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
  const {ip, port, namespace, set} = options;
  const instanceKey = `${ip}:${port}-${namespace}`;
  const {client, getFromAerospike} = instances[instanceKey] || {};
  if (!client) {
    logger.error({
      type: loggerType,
      message: 'Aerospike instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: loggerType,
      message: `Cache retrieve failed`,
      data: {
        key,
      },
      error: 'Aerospike instances not found',
    });
    return undefined;
  }
  try {
    const aerospikeConfigKey = new Aerospike.Key(namespace, set, key);
    const response = await getFromAerospike(aerospikeConfigKey);

    if (response && response.bins && response.bins.value) {
      const ungzipedData = zlib.gunzipSync(new Buffer(response?.bins?.value, 'base64'));
      logger.silly({
        type: loggerType,
        message: 'Cache retrieved successfully',
        data: {
          key,
        },
      });
      return ungzipedData.toString();
    }
  } catch (err) {
    logger.error({
      type: loggerType,
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
  const {ip, port, db} = options;
  const instanceKey = `${ip}:${port}-${db}`;
  const {client, removeFromAerospike} = instances[instanceKey] || {};
  if (!client) {
    logger.error({
      type: loggerType,
      message: 'Aerospike instances not found',
      data: {
        ...options,
      },
    });
    logger.error({
      type: loggerType,
      message: `Cache deletion failed`,
      data: {
        key,
      },
      error: 'Aerospike instances not found',
    });
    return false;
  }

  try {
    // set the same key with empty value and setting expire as 60 second as we don't have any delete api from aerospike
    await removeFromAerospike(key);
    logger.silly({
      type: loggerType,
      message: 'Cache deleted successfully',
      data: {
        key,
      },
    });
    return true;
  } catch (err) {
    logger.error({
      type: loggerType,
      message: `Cache deletion failed`,
      data: {
        key,
      },
      error: err,
    });
  }
  return false;
}
