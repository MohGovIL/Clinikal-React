import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import HeaderPatient from "../../../Assets/Elements/HeaderPatient";
import {useTranslation} from "react-i18next";
import * as Moment from "moment";
import {baseRoutePath} from "../../../Utils/Helpers/baseRoutePath";
import PatientDataBlock from "./PatientDataBlock";
import PatientDetailsBlock from "./PatientDetailsBlock";
import {StyledPatientRow, StyledDummyBlock, StyledBackdrop} from "./Style";
import {createNewEncounter} from '../../../Utils/Services/FhirAPI';
import normalizeFhirEncounter from '../../../Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirEncounter';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import {devicesValue} from "../../../Assets/Themes/BreakPoints";

const PatientAdmission = ({patient, encounter, languageDirection, formatDate, history, facility}) => {
    const {t} = useTranslation();

    // const [patientData, setPatientData] = useState({});
    // const [appointmentId, setAppointmentId] = useState('');
    // const [newEncounter, setNewEncounter] = useState({});
    const [edit, setEdit] = useState(0);

    const isTabletMode = useMediaQuery(`(max-width: ${devicesValue.tabletPortrait}px)`);

    // useEffect(() => {
    //     let appointmentIdFromURL = new URLSearchParams(location.search).get("index");

    //     setAppointmentId(appointmentIdFromURL);

    //     const participantPatient = appointments[appointmentIdFromURL].patient;

    //     setPatientData(patients[participantPatient]);

    //     (async () => {
    //         try {
    //             const encounterData = await createNewEncounter(appointments[appointmentIdFromURL], facility);
    //             setNewEncounter(normalizeFhirEncounter(encounterData.data));
    //         } catch (err) {
    //             console.log(err)
    //         }
    //     })()
    // }, [location, patients]);

    const allBreadcrumbs = [
        {
            text: t("Patient Admission"),
            separator: "NavigateNextIcon",
            url: "#",
        },
        {
            text: patient.firstName + " " + patient.lastName + " " + (!isTabletMode ? t("Encounter date") + ": " : "") + Moment(Moment.now()).format(formatDate),
            separator: false,
            url: "#"
        }
    ];

    const handleCloseClick = () => {
        history.push(`${baseRoutePath()}/imaging/patientTracking`);
    };


    const handleEditButtonClick = isEdit => {
        setEdit(isEdit);
    };

    return (
        <React.Fragment>
            <HeaderPatient breadcrumbs={allBreadcrumbs} languageDirection={languageDirection}
                           onCloseClick={handleCloseClick} edit_mode={edit}/>
            <StyledPatientRow>
                <StyledBackdrop open={true} edit_mode={edit}>
                    {Object.values(patient).length &&
                    <PatientDataBlock patientData={patient}
                                      onEditButtonClick={handleEditButtonClick} edit_mode={edit}
                                      languageDirection={languageDirection}
                                      formatDate={formatDate}/>}
                </StyledBackdrop>
                <StyledDummyBlock edit_mode={edit}/>
                {Object.values(patient).length && Object.values(encounter).length && <PatientDetailsBlock encounterData={encounter} patientData={patient} edit_mode={edit} />}
            </StyledPatientRow>
        </React.Fragment>
    );
};

const mapStateToProps = state => {
    return {
        patient: state.active.activePatient,
        encounter: state.active.active.encounter,
        languageDirection: state.settings.lang_dir,
        formatDate: state.settings.format_date,
        facility: state.settings.facility
    };
};

export default connect(mapStateToProps, null)(PatientAdmission);
