import serverResponseTemplate from '@stencil/server-response-template';
import App from '@stencil/mount-preact-app';
import {h} from 'preact';
import render from 'preact-render-to-string';
// import sampleData from './sampleData.json';

/** @jsx h */
const noOp = () => {};

export default function getExpressReactSSRHandler({routes, clientStats, publicPath}) {
  const {assets} = clientStats;
  routes.forEach(route => {
    const {onServerInit = noOp} = route;
    onServerInit();
  });
  return async function expressReactSSRHandler(request, response) {
    // Step 1 - initialisation
    const {responseStatus = 200} = request.localData || {};
    const serverData = {
      // ...sampleData,
      ...(request.localData || {}),
    };
    const {helmetObj} = serverData;
    let appContent = '';
    let headCss = '';
    try {
      appContent = render(
        <App routes={routes} url={request.originalUrl} initialState={serverData} />,
      );
    } catch (err) {
      console.log(err);
    }

    const now = new Date();
    const cachedAt = now.toLocaleString();
    const data = {
      appContent,
      headCss,
      storeJson: serverData,
      cachedAt,
      responseStatus,
      helmetObj,
    };

    response.status(responseStatus);
    response.send(serverResponseTemplate({...data, assets, publicPath}));
  };
}
