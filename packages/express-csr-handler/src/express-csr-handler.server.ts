import serverResponseTemplate from '@stencil/server-response-template';

export default function getExpressCSRHandler({
  routes,
  clientStats,
  publicPath,
  applicationName,
  flavour,
}) {
  const {assets} = clientStats;
  return function expressCSRHandler(request, response, next) {
    response.send(
      serverResponseTemplate(
        {
          appContent: '',
          headCss: '',
          storeJson: {},
          helmetObj: {},
          cachedAt: new Date(),
          assets,
          publicPath,
        },
        {
          applicationName,
          flavour,
        },
      ),
    );
  };
}
