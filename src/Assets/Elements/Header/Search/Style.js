import styled from "styled-components";
import Paper from "@material-ui/core/Paper";
import {ExpansionPanelDetails, ExpansionPanelSummary} from "@material-ui/core";
import IconValueComponent from "./DrawThisTable/IconValueComponent";

export default styled.div`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  justify-content: space-around;
  position: relative;
  min-width: 244px;
  min-height: 40px;
  background-color: #ffffff;
  border-radius: 23px;
  @media (min-width: 1025px) {
    margin-left: 10%;
  }
`;


export const StyledPaper = styled(Paper)`
    width: 744px;
    height: auto;
    border-radius: 2px;
    box-shadow: 0 0 10px 0 rgba(152,151,151,0.3);
    background-color: #ffffff;
    position: absolute;
    margin: 26% -56%;
    border-top: 0;
`;

export const StyledTriangle = styled.div`
    content: '';
    position: absolute;
    height: 23px;
    width: 53px;
    top: 100%;
    right: -2%;
    clip-path: polygon(50% 0%,0% 100%,100% 100%);
    z-index: 1;
    background-color: #ffffff;
`;

export const StyledPaperBottom = styled(Paper)`
  height: 60px;
  box-shadow: 0 -2px 10px 0 rgba(152, 151, 151, 0.3);
  background-color: #ffffff;

  display: flex;
  justify-content: center;
`;

export const StyledIconValueComponent = styled(IconValueComponent)`

`;

export const StyledPaperContainer = styled.div`
overflow:auto;

    max-height: calc(100vh - 88px - 60px);
`;
