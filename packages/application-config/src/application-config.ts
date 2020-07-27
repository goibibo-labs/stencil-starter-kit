import {resolve} from 'path';

const cwd = process.cwd();

export const appName = 'Aarogya-Setu-Web';
export const rootPath = cwd;
export const webpackContext = cwd;
export const webpackClientEntry = {
  main: resolve(cwd, 'src', 'index'),
};
export const webpackServerEntry = {
  main: resolve(cwd, 'src', 'index'),
};
export const webpackClientOutput = resolve(cwd, 'client-build');
export const webpackServerOutput = resolve(cwd, 'server-build');

export const serverPort = 3000;
export const serverLogLevel = 'info';

export const EnvConfigPath = ({BUILD_ENV, isClient, isEnvDevelopment}) =>
  resolve(__dirname, `../../../src/env/${BUILD_ENV}.json`);

export const webpackPublicDomain = process.env.BUILD_ENV === 'prod' ? '' : '';

export const webpackPublicPath =
  process.env.BUILD_ENV === 'prod' ? '/s3/stencil/' : '/stencil/assets/';

export const enablePreact = true;
