import {h} from 'preact';
import Router from 'preact-router';
import ServerDataContext from '@stencil/server-data-context';
/** @jsx h */

const App: React.FC = ({routes, url, initialState}) => {
  return (
    <ServerDataContext.Provider value={initialState}>
      <Router url={url}>
        {routes.map(route => {
          const {path, component: Comp, showHeader} = route;
          return <Comp path={path} />;
        })}
      </Router>
    </ServerDataContext.Provider>
  );
};

export default App;

{
  /* <>
  {(showHeader && <Header />) || null}
</> */
}
