const newrelic =
  process.env.BUILD_ENV === 'prod'
    ? require('newrelic')
    : {
        startBackgroundTransaction: (name, group, fn) => fn(),
        addCustomAttributes: console.info,
        getTransaction: () => ({end: noOp}),
        startWebTransaction: (url, fn) => fn(),
      };

function noOp() {}
export default newrelic;
