// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import styled from "styled-components";
import MainPage from "./Pages/MainPage";
import Gongstaurant from "./Pages/Cafeteria/Gongstaurant";
import Cheomseong from "./Pages/Cafeteria/Cheomseong";
import Gamggoteria from "./Pages/Cafeteria/Gamggoteria";

function App() {
  return (
    <Router>
      <AppWrapper>
        <Title>럭키비키학식당</Title>

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/Cafeteria/Gongstaurant" element={<Gongstaurant />} />
          <Route path="/Cafeteria/Cheomseong" element={<Cheomseong />} />
          <Route path="/Cafeteria/Gamggoteria" element={<Gamggoteria />} />
        </Routes>
      </AppWrapper>
    </Router>
  );
}

export default App;

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
