// FE1
import styled from "styled-components";

const Wrapper = styled.footer`
  margin-top: 32px;
  padding-top: 16px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
`;

export default function Footer() {
  return (
    <Wrapper>© 2025 럭키비키학식맵 Team</Wrapper>
  );
}