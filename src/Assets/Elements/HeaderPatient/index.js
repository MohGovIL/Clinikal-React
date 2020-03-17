import React from 'react';
import StyledAppBar, {StyledBreadcrumbs, StyledIconButton} from "./Style";
import {Link, Typography} from "@material-ui/core";
import {NavigateNext, NavigateBefore} from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';

const HeaderPatient = ({breadcrumbs, languageDirection, onCloseClick, edit_mode}) => {
    const NavigateIcon = languageDirection === 'rtl' ? NavigateBefore : NavigateNext;

    return (
        <React.Fragment>
            <StyledAppBar position="fixed" edit_mode={edit_mode}>
                <StyledBreadcrumbs aria-label="breadcrumb" separator={<NavigateIcon fontSize="small"/>}>
                    {breadcrumbs.map((option, optionIndex) => {
                        if (option["separator"] !== false) {
                            return <Typography key={optionIndex}>{option["text"]}</Typography>
                        } else {
                            return <Link color="inherit" href={option.url} key={optionIndex}>{option.text}</Link>
                        }
                    })}
                </StyledBreadcrumbs>
                <StyledIconButton onClick={onCloseClick} language_direction={languageDirection}>
                    <CloseIcon htmlColor={"#ffffff"}/>
                </StyledIconButton>
            </StyledAppBar>
        </React.Fragment>
    );
};
export default HeaderPatient;
