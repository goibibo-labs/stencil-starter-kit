import {hydrate, h} from 'preact';
import Router from 'preact-router';
import ServerDataContext from '@stencil/server-data-context';
import ClientDataContext from '@stencil/client-data-context';
/** @jsx h */

// Currently adding Header directly instead of detecting based on route match and showHeader flag, because not able to
// find any match route util from preact-router exposed
const App = ({routes, initialState, headers}) => {
  return (
    <ServerDataContext.Provider value={initialState}>
      <ClientDataContext.Provider value={headers}>
        <Router>
          {/* regex match and then store if header */}
          {routes.map(route => {
            const {path, component: Comp, showHeader} = route;
            return <Comp path={path} />;
          })}
        </Router>
      </ClientDataContext.Provider>
    </ServerDataContext.Provider>
  );
};

export default function mountReactApp({
  routes,
  initialState = window.__initial_state__,
  headers = {},
}) {
  hydrate(
    <App routes={routes} initialState={initialState} headers={headers} />,
    document.getElementById('root'),
  );
}
