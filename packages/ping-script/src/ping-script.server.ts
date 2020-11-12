export default function getPingScript({applicationName = '', flavour = ''}) {
  // to:do - make use of typescript to make sure applicationName and flavour is not empty
  return `
        <script type="text/javascript">
            function pageSeen(stage) {
                if (!starttime) {
                    // starttime should be defined on top of the page in the head
                    return;
                }
                try {
                    var endPoint = "//ingestionApiServer.domain.com/endpoint/";
                    var loc = window.location.pathname;
                    var timeStamp = (new Date() - starttime) / 1000;
                    var url = endPoint + "?jsLoaded=" + stage + "&pageseen=" + loc + "&timestamp=" + timeStamp + '&application=${applicationName}' + "&flavour=${flavour}" + "&docReferer=" + document.referrer + "&timelog=" + new Date().toISOString();
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.withCredentials = true;
                    xhr.send();
                } catch(err) {
                    console.log(err);
                }
            }
            // track raw page views
            pageSeen('FMP');
        </script>
    `;
}
