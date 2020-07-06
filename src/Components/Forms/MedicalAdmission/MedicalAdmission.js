//MedicalAdmission

import { connect } from 'react-redux';
import React, { useEffect, useState } from 'react';
import VisitDetails from '../../Generic/PatientAdmission/PatientDetailsBlock/VisitDetails';
import {
  Controller,
  FormContext,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { Grid } from '@material-ui/core';
import StyledSwitch from 'Assets/Elements/StyledSwitch';
import { useTranslation } from 'react-i18next';
import {
  StyledInsulation,
  StyledIsUrgent,
  StyledTemplateSelection,
  StyledForm,
} from './Style';
import CustomizedTableButton from 'Assets/Elements/CustomizedTable/CustomizedTableButton';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';

import RadioGroupChoice from 'Assets/Elements/RadioGroupChoice';

const MedicalAdmission = ({
  patient,
  encounter,
  formatDate,
  languageDirection,
  history,
  verticalName,
  permission,
}) => {
  const { t } = useTranslation();
  // const {
  //   register,
  //   control,
  //   // requiredErrors,
  //   setValue,
  //   unregister,
  //   reset,
  //   getValues,
  // } = useFormContext();
  const methods = useForm({
    mode: 'onBlur',
    submitFocusError: true,
  });

  const { handleSubmit, formState, control, watch, register } = methods;

  const [requiredErrors, setRequiredErrors] = useState({
    selectTest: '',
    commitmentAndPaymentReferenceForPaymentCommitment: '',
    commitmentAndPaymentCommitmentDate: '',
    commitmentAndPaymentCommitmentValidity: '',
    commitmentAndPaymentDoctorsName: '',
    commitmentAndPaymentDoctorsLicense: '',
    ReferralFile: '',
    CommitmentFile: '',
  });
  const watchisInsulationInstruction = watch('isInsulationInstruction');
  const watchisUrgent = watch('isUrgent');

  const onSubmit = async (data) => {

  };

  useEffect(() => {
       console.log("is urgent: " + watchisUrgent);
    // console.log("=====");
    // console.log(patient);
    // console.log("=====");
  },[watchisUrgent]);




  const buttonTemplateSelect = {
    label: t('Template selection'),
    variant: 'text',
    color: 'primary',
    // mode: formButtonSave,
    // other: { type: 'submit', form: 'createNewPatient', tabIndex: 10 },
    // onClickHandler: savePatientAction,
  };
  return (
    <React.Fragment>
      <FormContext {...methods} requiredErrors={requiredErrors}>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <VisitDetails
            reasonCodeDetails={encounter.extensionReasonCodeDetails}
            examination={encounter.examination}
            examinationCode={encounter.examinationCode}
            serviceType={encounter.serviceType}
            serviceTypeCode={encounter.serviceTypeCode}
            priority={encounter.priority}
            disableHeaders={false}
            disableButtonIsUrgent={false}
          />
          <StyledIsUrgent>
            <Grid
              container
              direction={'row'}
              justify={'flex-start'}
              alignItems={'center'}>
              <span>
                <b>{t('Is urgent?')}</b>
              </span>
              {/* Requested service - switch */}
              <StyledSwitch
                name='isUrgent'
                register={register}
                label_1={'No'}
                label_2={'Yes'}
                marginLeft={'40px'}
                marginRight={'40px'}
              />
            </Grid>
          </StyledIsUrgent>
          <StyledInsulation>
            <Grid
              container
              direction={'row'}
              justify={'flex-start'}
              alignItems={'center'}>
              <span>
                <b>{t('Insulation required')}?</b>
              </span>
              {/* Requested service - switch */}
              <StyledSwitch
                name='isInsulationInstruction'
                register={register}
                label_1={'No'}
                label_2={'Yes'}
                marginLeft={'40px'}
                marginRight={'33px'}
              />
            </Grid>
            {watchisInsulationInstruction && (
            <Controller
              control={control}
              name='insulationInstruction'
              //defaultValue={}
              as={
                <CustomizedTextField
                  width={'70%'}
                  label={t('Insulation instruction')}
                />
              }
            />)
            }
          </StyledInsulation>
          <StyledTemplateSelection>
            <Grid
              container
              direction={'row'}
              justify={'flex-start'}
              alignItems={'center'}>
              <Grid item xs={10}>
                <Controller
                  control={control}
                  name='nursingAnmenza'
                  //defaultValue={}
                  as={
                    <CustomizedTextField
                      width={'85%'}
                      label={t('Nursing anmenza')}
                    />
                  }
                />
              </Grid>
              <Grid item xs={2}>
                <CustomizedTableButton {...buttonTemplateSelect} />
              </Grid>
            </Grid>
          </StyledTemplateSelection>
          {/*need to make a new component for radio select*/}
          { (patient.gender === 'female' || patient.gender === 'other') && (
            <RadioGroupChoice
              gridLabel={t("Pregnancy")}
              firstValue={t('Yes')}
              secondValue={t('No')}
              // callBackFunction={}
            />
          )}
        </StyledForm>
      </FormContext>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
  };
};
export default connect(mapStateToProps, null)(MedicalAdmission);
