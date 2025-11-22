// src/MainPage.js
import styled from "styled-components";
import { Link } from "react-router-dom";

function MainPage() {
  return (
    <Container>
      <CardLink to="/Cafeteria/Gongstaurant">
        <Left>공식당</Left>
        <Right>🥵</Right>
      </CardLink>

      <CardLink to="/Cafeteria/Cheomseong">
        <Left>복지관</Left>
        <Right>😐</Right>
      </CardLink>

      <CardLink to="/Cafeteria/Gamggoteria">
        <Left>감꽃식당</Left>
        <Right>🥳</Right>
      </CardLink>
    </Container>
  );
}

export default MainPage;

// ---- styled-components ----
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
`;

const CardLink = styled(Link)`
  width: 500px;
  height: 90px;
  border: 3px solid black;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: inherit;
  background-color: #f5f5f5;

  &:hover {
    background-color: #eaeaea;
  }
`;

const Left = styled.div`
  flex: 1;
  text-align: center;
  font-size: 28px;
  font-weight: 600;
`;

const Right = styled.div`
  width: 150px;
  text-align: center;
  font-size: 45px;
`;
