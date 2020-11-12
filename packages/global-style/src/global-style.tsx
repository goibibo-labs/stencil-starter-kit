import {createGlobalStyle} from 'styled-components';

export const GlobalStyles = createGlobalStyle`
html {
  font-size: 10px;
}

/* to enable native scrolling for browsers which support native scrolling
  ( https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView )
  as well as to allow 'scroll-container' class elements to allow native scrolling (this is useful for 'smooth-scroll-into-view-if-needed' package)
 */
html, .scroll-container {
  overflow-y: scroll;
}

html.modal-open, html.lock-scroll {
  overflow: hidden;
}

body.moda-open {
  overflow: inherit;
}

/* This senses uses's OS's native preferences for scroll, if someone has turned off
  they won't see scroll animation
 */
@media (prefers-reduced-motion) {
  html,
  .scroll-container {
    scroll-behavior: auto;
  }
}

*{
    padding:0;
    margin:0;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}

.headerBox{
  z-index:99;
}

.oh {
  height: 110vh;
  overflow-y: hidden;
  position:fixed;
  width:100%;
  margin:0px auto;
}

body{
    background: #eef4fd;
    color: #141823;
    font: 400 1.2rem/1.33 "Helvetica Neue",Helvetica,Arial,sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
`;
