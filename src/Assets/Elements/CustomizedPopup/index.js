/**
 * @author Yuriy Gershem yuriyge@matrix.co.il
 * @returns {*}
 * @constructor
 */

import React, {useState, useEffect, useContext} from 'react';
import {Button, Dialog, Typography, DialogActions, DialogContent, IconButton} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import {StyledMuiDialogTitle, StyledDialogActions} from "./Style";
import {connect} from "react-redux";
import CustomizedTableButton from "../CustomizedTable/CustomizedTableButton";

const CustomizedPopup = ({children, isOpen, onClose, languageDirection, props}) => {
    return (
        <div>
            <Dialog onClose={onClose} aria-labelledby="customized-dialog-title" open={isOpen}>
                <StyledMuiDialogTitle disableTypography language_direction={languageDirection}>
                    <Typography variant="h6">{props.title}</Typography>
                    {onClose ? (
                        <IconButton aria-label="close" onClick={onClose}>
                            <CloseIcon/>
                        </IconButton>
                    ) : null}
                </StyledMuiDialogTitle>
                <DialogContent dividers={props.content_dividers ? props.content_dividers : false}>
                    {children}
                </DialogContent>
                <StyledDialogActions>
                    {props.bottomButtons && props.bottomButtons.map((button, buttonIndex) => {
                        return (
                            <CustomizedTableButton key={buttonIndex} {...button}/>
                        )
                    })}
                </StyledDialogActions>
            </Dialog>
        </div>
    );
};

const mapStateToProps = (state, ownProps) => {
    return {
        languageDirection: state.settings.lang_dir,
        props: ownProps,
    }
};
export default connect(mapStateToProps, null)(CustomizedPopup);