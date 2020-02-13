import styled from "styled-components";
import {Select} from "@material-ui/core";

export default styled(Select)`
  background-color: ${props => props.background_color ? props.background_color : null};
  border-radius: 15px;
  color: ${props => props.text_color ? props.text_color : null};
  font-weight: bold;
  margin: 0px 5px 0px 5px;
  padding: 5px;
  border-bottom: 0px !important;

  .MuiSelect-select {
    padding-right: 0px;
    padding-left: 24px;
  }

  .MuiSelect-select option {
    background-color: ${props => props.background_color ? props.background_color : null};
  }

  & .MuiSelect-icon {
    color: ${props => props.icon_color ? props.icon_color : null} !important;
    left: 0;
    right: unset;
  }
  ::before{
    border-bottom: none;
  }
`;
