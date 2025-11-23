// FE1
// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./Components/MainPage";
import CafeteriaMain from "./Components/CafeteriaPage";
import VotePage from "./Components/VotePage";
import styled from "styled-components";

import GlobalStyle from "./Styles/GlobalStyles";
import { theme } from "./Styles/Theme";
//import AppLayout from "./Components/Layout/AppLayout";

function App() {
  return (
    <Router>
      <AppWrapper>
        <Title>럭키비키학식당</Title>

        <Routes>
          {/* 첫 화면: 학식당 리스트 */}
          <Route path="/" element={<MainPage />} />

          {/* 상세 화면: /Cafeteria/Gongstaurant, /Cafeteria/Cheomseong, /Cafeteria/Gamggot */}
          <Route path="/Cafeteria/:name" element={<CafeteriaMain />} />

          {/* 투표 화면 */}
          <Route path="/vote/:name" element={<VotePage />} />
        </Routes>
      </AppWrapper>
    </Router>
  );
}

export default App;

// ---- styled-components ----
const AppWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 40px;
  color: #ff66cc;
  text-decoration: underline;
  text-underline-offset: 10px;
`;