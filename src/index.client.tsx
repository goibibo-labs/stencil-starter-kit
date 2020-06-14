import mountReactApp from 'mount-preact-app';
import {h} from 'preact';
/** @jsx h */

async function renderApp() {
  mountReactApp({
    routes: [
      {
        path: '/',
        component: () => <div>Hello world</div>,
        key: 'home',
      },
    ],
  });
}

renderApp();

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js');
//   });
// }
