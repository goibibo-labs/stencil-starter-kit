// import {EnvConfigPath} from 'application-config';

const EnvConfig = __ENV_CONFIG__;

export default function ConfigFromEnv(key?: string) {
  if (key === undefined) {
    return EnvConfig;
  }

  return EnvConfig[key];
}
