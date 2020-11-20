import Aerospike from 'aerospike';
import logger from '@stencil/logger';

const aerospikeInstances = {};

export function initAerospike(options) {
  console.log(options);
  return new Promise(resolve => {
    const {ip, port, namespace} = options;
    const instanceKey = `${ip}:${port}-${namespace}`;
    if (aerospikeInstances[instanceKey]) {
      logger.verbose({
        type: '@stencil/aerospike-instance',
        message: 'Aerospike connection is already present',
        data: {
          ...options,
        },
      });
      resolve(aerospikeInstances[instanceKey]);
      return;
    }

    const client = Aerospike.client({
      hosts: [
        {
          addr: ip,
          port: port,
          namespace: namespace,
        },
      ],
    });
    client.connect(error => {
      if (error) {
        logger.error({
          type: '@stencil/aerospike-instance',
          message: 'Aerospike connection failed',
          data: {
            ...options,
          },
          // error: '',
        });
        resolve(undefined);
        return;
      } else {
        // handle success
        aerospikeInstances[instanceKey] = client;
        logger.info({
          type: '@stencil/aerospike-instance',
          message: 'Aerospike connection successful',
          data: {
            ...options,
          },
        });
        resolve(client);
        return;
      }
    });
  });
}

export async function getAerospike(options: {ip: string; port: number; namespace: string}) {
  const {ip, port, namespace} = options;
  const instanceKey = `${ip}:${port}-${namespace}`;
  let instance = aerospikeInstances[instanceKey];
  if (instance) {
    return instance;
  }

  return await initAerospike(options);
}
