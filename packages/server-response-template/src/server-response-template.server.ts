import serialize from 'serialize-javascript';

export default function serverResponseTemplate({
  appContent = '',
  headCss = '',
  storeJson = {},
  helmetObj = {},
  cachedAt,
  assets,
  publicPath,
}) {
  // to:do - sentry, branch
  return `
    <!DOCTYPE html>
    <html lang="en" ${helmetObj.htmlAttributes || ''}>
      <head>
        <script>
          var starttime = new Date();
        </script>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        ${helmetObj.title || ''}
        ${helmetObj.meta || ''}
        ${helmetObj.link || ''}
        ${headCss}
        <link
          href="https://fonts.googleapis.com/css?family=Work+Sans:400,500,600,700&display=swap"
          rel="stylesheet"
        />
        ${assets
          .map(asset => {
            if (asset.endsWith('.css')) {
              return `<link href="${publicPath}${asset}" rel="stylesheet" type="text/css">`;
            }

            return '';
          })
          .join('')}
          <style>
            body {
              background-color: rgb(247,247,249);
              padding:0;
              margin:0;
            }
          </style>
      </head>
      <body>
        <noscript>
          You need to enable JavaScript to run this app.
        </noscript>
        <div id="root">${appContent}</div>
        <div id="modal-root"></div>
        <script charSet="UTF-8">
          window.cachedAt="${cachedAt}";
          window.__initial_state__=${serialize(storeJson)};
        </script>
        ${assets
          .map(asset => {
            if (asset.endsWith('.js')) {
              return `<script src="${publicPath}${asset}"></script>`;
            }
            return '';
          })
          .join('')}
      </body>
    </html>
  `;
}
