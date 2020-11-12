import React from 'react';
import serverResponseTemplate from '@stencil/server-response-template';
import {
  init as initRedisConnections,
  getKey as getKeyFromRedis,
  setKey as setKeyForRedis,
} from '@stencil/external-inmemory-key-value-cache';
import {
  initAerospikeConnections,
  getKey as getKeyFromAerospike,
  setKey as setKeyForAerospike,
} from '@stencil/external-inmemory-cache-aerospike-connector';
import createStore from '@stencil/create-redux-store';
import {matchPath} from 'react-router-dom';
import parseUrl from 'url';
import logger from '@stencil/logger';
import {shortCircuit} from '@stencil/promise-utils';
import App from '@stencil/mount-react-app';
import {ServerStyleSheet} from 'styled-components';
import {renderToString} from 'react-dom/server';
import {Helmet} from 'react-helmet';
import {IRouteObject} from '@stencil/types/route';
import {ISSRHandler} from '@stencil/types/express-react-ssr-handler';
import {IRequest, IResponse} from '@stencil/types/express-request-handler';
import newrelic from '@stencil/newrelic-instance';

const noOp = () => {};

export default function getExpressReactSSRHandler({
  routes,
  clientStats,
  reducers,
  applicationName,
  flavour,
  publicPath,
  footerParam,
  gtmId = '',
  hotJarDefault = false,
  sentryId = '',
  lcLpcScriptSrc = '',
  adScript = '',
  fontSrc = '',
  CustomGlobalStyle = '',
}: ISSRHandler) {
  const {assets} = clientStats;
  routes.forEach(route => {
    const {cacheConfig = {}, onServerInit = noOp} = route;
    const {redisConfig, aerospikeConfig} = cacheConfig;
    if (redisConfig) {
      initRedisConnections(redisConfig);
    }

    if (aerospikeConfig) {
      initAerospikeConnections(aerospikeConfig);
    }
    onServerInit();
  });
  /**
   * IRequest, IResponse is added to define the usage of request and response so that it can be mocked easily
   * Currently it is getting mocked for hotels detail page warmer
   * In case in future we start using a new key from the request or response then it will automatically break hotels detail warmer mocking during the build process
   */
  return async function expressReactSSRHandler(
    request: IRequest,
    response: IResponse,
    next: Function,
  ) {
    // Step 1 - initialisation
    let nrCustomParam: {[key: string]: string | number | Boolean} = {};
    let matchedRoute: IRouteObject | {} = {};
    let matchedRouteObject: IRouteObject | {} = {};
    let shouldCache = false;
    let hideHeader = false;
    let hideFooter = false;
    let responseStatus = 200;
    const url = `${request.baseUrl}${request.path}`;
    const queryParams = parseUrl.parse(request.originalUrl);
    const searchQuery = queryParams.search ? queryParams.search : '';
    const cacheBurst = request.query.cb === '0';

    /**
     * localData is another hook for data
     * this can be used in a middleware before this handler to push some extra data
     * this will be passed to fillstoreonserver handler where it can be pushed to store
     */
    const localData = request.localData || {};
    const postData = request.body || {};
    response.locals.postData = postData; // this is consumed at middlewares, like collectAndSubmitNewRelicData

    // Step 2 - match
    routes.some(route => {
      const matchObj = matchPath(url, route);
      if (matchObj) {
        const {params = {}} = matchObj;
        matchedRouteObject = matchObj;
        matchedRoute = route;
        nrCustomParam = {
          ...nrCustomParam,
          ...params,
        };
      }
      return matchObj;
    });

    // Step 3 - collect inputs
    const {
      key = '',
      populateStoreFromUrl = noOp,
      toBeSSRed = true,
      toBeCached = false,
      cacheConfig = {},
      isModal = false,
      fillStoreOnServer = noOp,
      fillStoreWaitTime = 1000,
      isHotjarEnabled = hotJarDefault,
      directLanding = true,
      showHeader = true,
      showFooter = true,
      actionsBeforeRenderOnServer = noOp,
      customTransactionForCacheHitTracing = false,
      getNameForCustomTransaction = ({fromCache, cacheBurst, screen}) => {
        return `${screen}_cache:${fromCache}_cb:${cacheBurst}`;
      },
      overrideGTMId = '',
    } = matchedRoute;
    const {getCacheKey = noOp, aerospikeConfig, redisConfig} = cacheConfig;
    const cacheKey = getCacheKey({
      params: matchedRouteObject.params || {},
      searchString: searchQuery,
    });
    const finalGTMId = overrideGTMId || gtmId;
    hideHeader = !showHeader;
    hideFooter = !showFooter;
    nrCustomParam.searchQuery = searchQuery;
    nrCustomParam.hideHeader = hideHeader;
    nrCustomParam.hideFooter = hideFooter;
    nrCustomParam.screen = key;
    nrCustomParam.ssr = toBeSSRed;
    nrCustomParam.cacheIt = toBeCached;
    nrCustomParam.modal = isModal;
    nrCustomParam.directLanding = directLanding;
    nrCustomParam.cacheBurst = cacheBurst;
    nrCustomParam.cacheKey = cacheKey;
    nrCustomParam.fromCache = false;
    nrCustomParam.customTransactionForCacheHitTracing = customTransactionForCacheHitTracing;
    shouldCache = toBeCached;

    response.locals.getNameForCustomTransaction = getNameForCustomTransaction;

    // Step 4 - try to serve from cache
    if (toBeSSRed && cacheKey && !cacheBurst) {
      nrCustomParam.fromCache = false;
      let responseFromCache = '';
      if (aerospikeConfig) {
        responseFromCache = await getKeyFromAerospike({key: cacheKey}, aerospikeConfig);
      }

      if (redisConfig) {
        responseFromCache = await getKeyFromRedis({key: cacheKey}, redisConfig);
      }
      if (responseFromCache) {
        nrCustomParam.fromCache = true;
        const responseFromCacheAsObject = JSON.parse(responseFromCache);
        const {responseStatus} = responseFromCacheAsObject;

        response.status(responseStatus);

        response.send(
          serverResponseTemplate(
            {...responseFromCacheAsObject, assets, publicPath, isHotjarEnabled},
            {
              applicationName,
              flavour,
              gtmId: finalGTMId,
              fontSrc,
              sentryId,
              lcLpcScriptSrc,
              adScript,
            },
          ),
        );
        response.locals.nrCustomParam = nrCustomParam;
        next();
        return;
      }
    }

    // STEP 5 - CHECK FOR REDIRECT BASED ON ROUTE CONFIG
    if (directLanding === false) {
      const {params = {}} = matchedRouteObject;
      // redirect to base path
      const {basePath} = params;
      const redirectPath = `/${basePath}/${searchQuery}`;
      response.redirect(redirectPath);
      nrCustomParam.redirectFrom = request.originalUrl;
      nrCustomParam.redirectTo = redirectPath;
      response.locals.nrCustomParam = nrCustomParam;
      next();
      return;
    }

    // STEP 6 - INITIALISE STORE AND POPULATE STORE FROM URL
    const store = createStore({reducers});

    try {
      const {params = {}} = matchedRouteObject;
      populateStoreFromUrl(
        {
          params,
          searchString: searchQuery,
          url: request.originalUrl,
        },
        store.dispatch,
      );
    } catch (err) {
      shouldCache = false;
      nrCustomParam.psfuError = true;
      nrCustomParam.errorMsg = err.toString();
      logger.error({
        type: '@stencil/express-react-ssr-handler',
        message: 'Populate store from Url failed',
        data: {
          url,
          searchQuery,
        },
        error: err,
      });
    }

    // STEP 7 - Call fillstore with a short circuit
    try {
      const {params = {}} = matchedRouteObject;
      const action = await shortCircuit(
        fillStoreOnServer({
          state: store.getState(),
          localData,
          postData,
          params,
          searchString: searchQuery,
        }),
        fillStoreWaitTime,
      );

      if (action) {
        if (Array.isArray(action)) {
          action.forEach(element => {
            store.dispatch(element);
          });
        } else {
          store.dispatch(action);
        }
      }
    } catch (err) {
      shouldCache = false;
      nrCustomParam.fsError = true;
      nrCustomParam.errorMsg = err.toString();
      logger.error({
        type: '@stencil/express-react-ssr-handler',
        message: 'Fill store on server failed',
        data: {
          url,
          searchQuery,
        },
        error: err,
      });
    }

    // response status code, shouldCache, redirect, delete cache
    try {
      const {params = {}} = matchedRouteObject;
      const {status = 200, redirectUrl = '', toBeCached = shouldCache, cookies = []} =
        actionsBeforeRenderOnServer({
          state: store.getState(),
          params,
          searchString: searchQuery,
        }) || {};
      responseStatus = status;
      shouldCache = toBeCached;
      if (cookies) {
        cookies.forEach(cookie => response.cookie(cookie.name, cookie.value, cookie.options));
      }
      if (redirectUrl) {
        response.redirect(responseStatus, redirectUrl);
        nrCustomParam.redirectFrom = request.originalUrl;
        nrCustomParam.redirectTo = redirectUrl;
        response.locals.nrCustomParam = nrCustomParam;
        next();
        return;
      }
    } catch (err) {
      shouldCache = false;
      nrCustomParam.abrError = true;
      nrCustomParam.errorMsg = err.toString();
      logger.error({
        type: '@stencil/express-react-ssr-handler',
        message: 'Action before render on server failed',
        data: {
          url,
          searchQuery,
        },
        error: err,
      });
    }

    let appContent = '';
    let headCss = '';
    try {
      const sheet = new ServerStyleSheet();
      appContent = renderToString(
        sheet.collectStyles(
          <App
            routes={routes}
            CustomGlobalStyle={CustomGlobalStyle}
            store={store}
            url={request.originalUrl}
            footerParam={footerParam}
            hideHeader={hideHeader}
            hideFooter={hideFooter}
          />,
        ),
      );
      headCss = sheet.getStyleTags(); // or sheet.getStyleElement();
    } catch (err) {
      shouldCache = false;
      nrCustomParam.rtsError = true;
      nrCustomParam.errorMsg = err.toString();
      logger.error({
        type: '@stencil/express-react-ssr-handler',
        message: 'Render to String failed',
        data: {
          url,
          searchQuery,
        },
        error: err,
      });
    }

    const helmet = Helmet.renderStatic();
    const helmetObj = {
      htmlAttributes: helmet.htmlAttributes.toString(),
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      link: helmet.link.toString(),
    };

    const now = new Date();
    const cachedAt = now.toLocaleString();
    const data = {
      appContent,
      headCss,
      storeJson: store.getState(),
      helmetObj,
      cachedAt,
      responseStatus,
    };
    response.status(responseStatus);
    response.send(
      serverResponseTemplate(
        {...data, assets, publicPath, isHotjarEnabled},
        {
          applicationName,
          flavour,
          gtmId: finalGTMId,
          fontSrc,
          sentryId,
          lcLpcScriptSrc,
          adScript,
        },
      ),
    );

    // STEP 14 - STORE DATA IN REDIS IF REQUIRED
    if (shouldCache && toBeCached && cacheKey) {
      if (aerospikeConfig)
        setKeyForAerospike({key: cacheKey, value: JSON.stringify(data)}, aerospikeConfig);
      if (redisConfig) setKeyForRedis({key: cacheKey, value: JSON.stringify(data)}, redisConfig);
    }
    response.locals.nrCustomParam = nrCustomParam;
    next();
  };
}

export function collectAndSubmitNewRelicData(request, response, next) {
  let {nrCustomParam, getNameForCustomTransaction, postData} = response.locals;
  const {
    customTransactionForCacheHitTracing = false,
    screen = '',
    fromCache = false,
    cacheBurst,
  } = nrCustomParam;

  if (customTransactionForCacheHitTracing) {
    newrelic.setTransactionName(
      getNameForCustomTransaction({fromCache, cacheBurst, screen, postData}),
    );
  }

  newrelic.addCustomAttributes(nrCustomParam);
  next();
}
