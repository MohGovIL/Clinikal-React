import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';

const StyledTextField = styled(TextField)`
  width: ${(props) => props.width && props.width};
  background-color: #f8faff;
  border-radius: 10px;
  margin: 24px 0 24px 0;
  transform-origin: ${(props) =>
    props.direction === 'rtl' ? 'top right' : 'top left'};
  .MuiInputBase-root {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  .MuiInputLabel-formControl {
    right: ${(props) => (props.direction === 'rtl' ? '0' : 'unset')};
    left: ${(props) => (props.direction === 'rtl' ? 'unset' : '0')};
  }
  .MuiInputLabel-shrink {
    ${(props) => console.log(props.direction)}
    transform-origin: ${(props) =>
      props.direction === 'rtl' ? 'top right' : 'top left'};
    opacity: 0.6;
    color: #1e2132;
  }
  .MuiSvgIcon-root {
    color: ${(props) => props.iconColor};
  }
  .MuiInputBase-root {
    color: #000b40;
  }
  .MuiFormHelperText-root {
    text-align: ${(props) => (props.direction === 'rtl' ? 'right' : 'left')};
  }
`;

export default StyledTextField;