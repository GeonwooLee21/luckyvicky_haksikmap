// FE1
// src/Styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
    background-color: #f7f7fb;
    color: #222;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  button {
    font-family: inherit;
  }
`;

export default GlobalStyle;
