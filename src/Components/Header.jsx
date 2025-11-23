// FE1
import styled from "styled-components";

const Wrapper = styled.header`
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 6px;
`;

const Subtitle = styled.p`
  margin: 12px 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

export default function Header() {
  return (
    <Wrapper>
      <Title>럭키비키학식당</Title>
      <Subtitle>지금 어디가 덜 붐비는지 한 눈에 확인해보세요 👀</Subtitle>
    </Wrapper>
  );
}