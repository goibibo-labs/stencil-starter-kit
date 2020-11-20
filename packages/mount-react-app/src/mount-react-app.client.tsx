import React, {Fragment, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {ThemeProvider} from 'styled-components';
import {BrowserRouter, Switch, Route, matchPath} from 'react-router-dom';

import createStore from '@stencil/create-redux-store';
import {defaultTheme} from '@stencil/build-theme';
import {GlobalStyles} from '@stencil/global-style';
import commonHelmetJson from 'common-helmet-json';
import {Helmet} from 'react-helmet';
import {withAppErrorBoundary} from '@stencil/app-error-boundary';

import traceWebVitals from '@stencil/client-side-analytics/src/trace-web-vitals';

// Common user widget integeration
// Ping did mount integeration
// Component did catch error tracking
// Modal support

const withHotelAppErrorBoundary = Component =>
  withAppErrorBoundary(Component, {
    appName: 'avatarClient',
  });

const App = ({routes, store, CustomGlobalStyle}) => {
  let hideHeader = false;
  let hideFooter = false;

  const RouteComponent = props => {
    const {location} = props;
    const {pathname} = location;
    let traceVitalsConfig = null;

    routes.some(route => {
      const matchObj = matchPath(pathname, route);
      if (matchObj) {
        const {
          showHeader = true,
          showFooter = true,
          traceVitalsConfig: traceVitalsConfigFromRoute = '',
        } = route;
        traceVitalsConfig = traceVitalsConfigFromRoute;
        hideHeader = !showHeader;
        hideFooter = !showFooter;
      }
      return matchObj;
    });

    useEffect(() => {
      if (traceVitalsConfig) {
        traceWebVitals(traceVitalsConfig);
      }
    }, []);

    return (
      <Fragment>
        <Switch>
          {routes.map((route, i) => (
            <Route {...route} key={i} />
          ))}
        </Switch>
      </Fragment>
    );
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <Helmet {...commonHelmetJson} />
      <Provider store={store}>
        {CustomGlobalStyle ? <CustomGlobalStyle /> : <GlobalStyles />}
        <BrowserRouter>
          <Route component={RouteComponent} />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
};

const AppWithErrorBoundary = withHotelAppErrorBoundary(App);

export default function mountReactApp({
  routes,
  reducers,
  CustomGlobalStyle,
  initialState = window.__initial_state__,
}) {
  const store = createStore({reducers, initialState});
  const urlPath = window.location.pathname;
  const searchString = window.location.search;
  routes.some(route => {
    const matchObj = matchPath(urlPath, route);
    if (matchObj) {
      const {params = {}} = matchObj;
      const {populateStoreFromUrl = () => {}, actionsBeforePageLoadOnClient = () => {}} = route;
      populateStoreFromUrl({params, searchString, url: urlPath}, store.dispatch);
      actionsBeforePageLoadOnClient({params, searchString}, store.dispatch);
    }
    return matchObj;
  });

  ReactDOM.hydrate(
    <AppWithErrorBoundary routes={routes} store={store} CustomGlobalStyle={CustomGlobalStyle} />,
    document.getElementById('root'),
  );

  window.pageSeen('TTI');
}
