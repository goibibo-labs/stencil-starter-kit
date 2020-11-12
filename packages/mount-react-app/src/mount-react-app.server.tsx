import React from 'react';
import {Provider} from 'react-redux';
import {ThemeProvider} from 'styled-components';
import {defaultTheme} from '@stencil/build-theme';
import {GlobalStyles} from '@stencil/global-style';
import {StaticRouter, Switch, Route} from 'react-router-dom';
import commonHelmetJson from 'common-helmet-json';
import {Helmet} from 'react-helmet';

const App: React.FC = ({store, routes, CustomGlobalStyle, url}) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Helmet {...commonHelmetJson} />
      <Provider store={store}>
        {CustomGlobalStyle ? <CustomGlobalStyle /> : <GlobalStyles />}
        <StaticRouter location={url}>
          <Switch>
            {routes.map(route => (
              <Route {...route} />
            ))}
          </Switch>
        </StaticRouter>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
