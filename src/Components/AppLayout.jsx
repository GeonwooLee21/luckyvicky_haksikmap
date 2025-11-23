// FE1
// src/components/layout/AppLayout.jsx
import styled from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

const Outer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  background-color: transparent;  /* 가운데 카드 느낌만 낼 거면 투명 */
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 24px;
`;

export default function AppLayout({ children }) {
  return (
    <Outer>
      <Inner>
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Inner>
    </Outer>
  );
}
