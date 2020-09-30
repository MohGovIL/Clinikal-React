/**
 * @date - 29/07/2020
 * @author Dror Golan drorgo@matrix.co.il
 * @purpose InstructionsForTreatment -  will be the main component which will hold and render EM Test and Treatment instruction form .
 * @returns the main form Component.
 */

import React, { useEffect, useState } from 'react';
import { FormContext, useForm } from 'react-hook-form';
import Fields from 'Components/Forms/TestsAndTreatments/Instructions/Fields';
import PopUpFormTemplates from 'Components/Generic/PopupComponents/PopUpFormTemplates';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Grid from '@material-ui/core/Grid';
import { FHIR } from 'Utils/Services/FHIR';
import denormalizeFhirServiceRequest from 'Utils/Helpers/FhirEntities/denormalizeFhirEntity/denormalizeFhirServiceRequest';

import SaveForm from 'Components/Forms/GeneralComponents/SaveForm/index';

import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import { useHistory } from 'react-router-dom';
import normalizeFhirServiceRequest from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirServiceRequest';
import { fhirFormatDateTime }  from 'Utils/Helpers/Datetime/formatDate';

/**
 *
 * @param encounter
 * @returns   UI main form.
 */

const InstructionsForTreatment = ({
  encounter,
  patient,
  permission,
  saveIndicatorsOnSubmit,
  currentUser,
  validationFunction,
  functionToRunOnTabChange,
  constantIndicators,
  variantIndicatorsNew,
  language_direction,
  handleLoading,
  setLoading
}) => {
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      Instruction: [],
    },
  });

  const [disabledOnSubmit, setdisabledOnSubmit] = useState(false)

  const { handleSubmit, setValue, watch, getValues } = methods;

  function wasSomethingChanged(serviceRequest, serviceRequests) {
    let returnThis = true;
    serviceRequests.entry.map((val, index) => {
      if (val.resource && val.resource.resourceType === 'ServiceRequest') {
        const serviceReqFromFHIR = normalizeFhirServiceRequest(val.resource);

        if (serviceReqFromFHIR.id === serviceRequest.id) {
          let status =
            serviceRequest.status === 'not_done' ? 'active' : 'completed';
          if (
            serviceReqFromFHIR.instructionCode ===
              serviceRequest.test_treatment &&
            serviceReqFromFHIR.orderDetailCode ===
              serviceRequest.test_treatment_type &&
            serviceReqFromFHIR.patientInstruction ===
              serviceRequest.patientInstruction &&
            serviceReqFromFHIR.status === status &&
            serviceReqFromFHIR.note === serviceRequest.note &&
            serviceReqFromFHIR.reasonReferenceDocId ===
              serviceRequest.reasonReferenceDocId
          )
            returnThis = false;
        }
      }
    });
    return returnThis;
  }

  const saveServiceRequestData = () => {
    if (permission !== 'write') return []; //empty request;

    const { Instruction } = getValues({ nest: true });

    const savedServiceRequest = [];
    try {
      /*  const test_and_treatments_list = await getValueSetLists(
        ['tests_and_treatments'],
        true,
      );*/
      Instruction.map((value, index) => {
        /* const test_treatment_type_list = await getValueSetLists(
          [`details_${value.test_treatment}`],
          true,
        );*/
        const serviceRequest = {
          id: value.serviceReqID,
          encounter: encounter.id,
          patient: patient.id,
          reasonCode: encounter.examinationCode,
          reasonReferenceDocId: value.reason_referance_doc_id, //EM-84
          note: value.test_treatment_remark,
          patientInstruction: value.instructions,
          serviceReqID: value.serviceReqID,
          status:
            value.test_treatment_status ||
            value.test_treatment_status === 'true'
              ? 'done'
              : 'not_done',
          test_treatment: value.test_treatment,
          test_treatment_type:
            value.test_treatment_type &&
            typeof value.test_treatment_type !== 'object'
              ? value.test_treatment_type
              : value.test_treatment_type && value.test_treatment_type.code
              ? value.test_treatment_type.code
              : undefined,
        };
        //check whether to save this request or not ....
        const diffExists = wasSomethingChanged(serviceRequest, serviceRequests);
        if (!diffExists) return;

        if (serviceRequest.status === 'done') {
          serviceRequest.authoredOn = value.occurrence;
          serviceRequest.requester = value.performer_or_requester;
          serviceRequest.occurrence = fhirFormatDateTime();
          serviceRequest.performer = currentUser.id;
        }

        if (value.serviceReqID === '') {
          serviceRequest.authoredOn = fhirFormatDateTime();
          serviceRequest.requester = currentUser.id;
        }

        const serviceRequestDataToSave = denormalizeFhirServiceRequest({
          serviceRequest: serviceRequest,
          /* valueSetRequests: test_and_treatments_list,
          valueSetDetails: test_treatment_type_list,*/
        });

        savedServiceRequest.push(
          FHIR('ServiceRequests', 'doWork', {
            functionName: serviceRequestDataToSave.id
              ? 'updateServiceRequest'
              : 'createNewServiceRequest',
            functionParams: {
              id: serviceRequestDataToSave.id,
              data: serviceRequestDataToSave,
            },
          }),
        );
      });
    } catch (err) {}
    return savedServiceRequest;
  };
  const onSubmit = (data) => {
    //  console.log('data', JSON.stringify(data));
    // console.log(isRequiredValidation(data));
    setdisabledOnSubmit(true)
    const indicatorsFHIRArray = saveIndicatorsOnSubmit();
    const serviceRequestFHIRArray = saveServiceRequestData(data);
    const returnThis = [...indicatorsFHIRArray, ...serviceRequestFHIRArray];
    console.log(returnThis);
    return returnThis;
  };
  const [defaultContext, setDefaultContext] = useState('');
  const [serviceRequests, setServiceRequests] = useState('');
  const { t } = useTranslation();
  const callBack = (data, name) => {
    setDefaultContext(data);
    setValue(name, data);
  };

  const handlePopUpClose = () => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: false,
      };
    });
  };

  const [popUpProps, setPopUpProps] = React.useState({
    popupOpen: false,
    formID: '',
    encounter,
    formFieldsTitle: '',
    defaultContext,
    setDefaultContext,
    handlePopupClose: handlePopUpClose,
    setTemplatesTextReturned: null,
    name: '',
  });

  const handlePopUpProps = (
    title,
    fields,
    id,
    callBack,
    name,
    defaultContext,
  ) => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: true,
        formFieldsTitle: title,
        formFields: fields,
        formID: id,
        setTemplatesTextReturned: callBack,
        name,
        defaultContext: defaultContext,
      };
    });
  };
  let edit = encounter.status === 'finished' ? false : true; // is this form in edit mode or in view mode
  const [requiredErrors, setRequiredErrors] = useState([
    /*  {
      test_treatment_type: '',
      /!*  test_treatment_status: '',*!/
    },*/
  ]);

  const requiredFields = {
    test_treatment_type: {
      name: 'test_treatment_type',
      type: 'checkbox',
      required: function (data) {
        return data !== '';
      },
    },
    /*   test_treatment_status: {
      name: 'test_treatment_status',
      required: function (data) {
        return data !== false || data === '';
      },
    },*/
  };
  const isRequiredValidation = () => {
    const data = getValues({ nest: true });
    let clean = true;

    if (!data || (data && !data['Instruction'])) {
      return true;
    }
    for (
      let instructionIndex = 0;
      instructionIndex < data['Instruction'].length;
      instructionIndex++
    ) {
      for (const fieldKey in requiredFields) {
        if (requiredFields.hasOwnProperty(fieldKey)) {
          const field = requiredFields[fieldKey];

          let answer = field.required(
            data['Instruction'][instructionIndex][field.name],
          );
          if (
            !(field.name in data['Instruction'][instructionIndex]) ||
            (field.name in data['Instruction'][instructionIndex] &&
              data['Instruction'][instructionIndex].test_treatment !==
                'providing_medicine' &&
              data['Instruction'][instructionIndex].test_treatment !== 'x_ray')
          )
            continue;

          if (
            answer &&
            data['Instruction'][instructionIndex][field.name] &&
            data['Instruction'][instructionIndex][field.name] !== ''
          ) {
            setRequiredErrors((prevState) => {
              const cloneState = [...prevState];
              cloneState[instructionIndex][field.name] = '';
              return cloneState;
            });
          } else {
            setRequiredErrors((prevState) => {
              const cloneState = [...prevState];
              cloneState[instructionIndex][field.name] = t('A value must be entered in the field'); // PC-1557
              return cloneState;
            });
            clean = false;
          }
        }
      }
    }
    return clean;
  };
  const updateEncounterExtension = async (
    encounter,
    selectedStatus,
    practitioner,
  ) => {
    try {
      if (!selectedStatus) return;
      const cloneEncounter = { ...encounter };
      switch (selectedStatus) {
        case 'waiting_for_nurse':
          cloneEncounter.status = 'in-progress';
          break;
        case 'waiting_for_doctor':
          cloneEncounter.status =
            cloneEncounter.status === 'arrived' ? 'triaged' : 'in_progress';

          break;
        case 'waiting_for_xray':
          cloneEncounter.status = 'in-progress';
          break;
      }
      cloneEncounter.extensionSecondaryStatus = selectedStatus;
      cloneEncounter.practitioner = practitioner;

      await FHIR('Encounter', 'doWork', {
        functionName: 'updateEncounter',
        functionParams: {
          encounterId: encounter.id,
          encounter: cloneEncounter,
        },
      });
      history.push(`${baseRoutePath()}/generic/patientTracking`);
    } catch (error) {
      console.log(error);
    }
  };
  //http://localhost/apis/fhir/v4/ServiceRequest?patient=1&encounter=1&_include=ServiceRequest:performer
  useEffect(() => {
    (async () => {
      let fhirClinikalCalls = null;
      try {
        const fhirClinikalCallsAfterAwait = await FHIR(
          'ServiceRequests',
          'doWork',
          {
            functionName: 'getServiceRequests',
            functionParams: {
              patient: patient.id,
              encounter: encounter.id,
              _sort: '-authored', //,-occurrence', cannot do it yet
              _include: [
                'ServiceRequest:requester',
                'ServiceRequest:performer',
              ],
            },
          },
        );
        if (fhirClinikalCallsAfterAwait['status'] === 200)
          setServiceRequests(fhirClinikalCallsAfterAwait['data']);
        handleLoading('serviceRequest')
      } catch (err) {
        handleLoading('serviceRequest')
        console.log(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    validationFunction.current = isRequiredValidation;

    return () => {
      validationFunction.current = () => true;
    };
  }, [constantIndicators, variantIndicatorsNew, getValues({ nest: true })]);
  React.useEffect(() => {
    // validationFunction.current = isRequiredValidation;
    functionToRunOnTabChange.current = onSubmit;
    return () => {
      functionToRunOnTabChange.current = () => [];
      // validationFunction.current = () => true;
    };
  }, [constantIndicators, variantIndicatorsNew, getValues({ nest: true })]);
  let statuses = [
    { label: 'Waiting for nurse', value: 'waiting_for_nurse' },
    { label: 'Waiting for doctor', value: 'waiting_for_doctor' },
    { label: 'Waiting for xray', value: 'waiting_for_xray' },
  ];
  const history = useHistory();

  return (
    <FormContext {...methods} permission={permission}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PopUpFormTemplates {...popUpProps} />
        <Fields
          serviceRequests={serviceRequests}
          setRequiredErrors={setRequiredErrors}
          requiredErrors={requiredErrors}
          handlePopUpProps={handlePopUpProps}
          permission={permission}
        />
        <Grid container spacing={1}>
          <SaveForm
            statuses={statuses}
            encounter={encounter}
            validationFunction={isRequiredValidation}
            onSubmit={onSubmit}
            updateEncounterExtension={updateEncounterExtension}
            disabledOnSubmit={disabledOnSubmit}
            setLoading={setLoading}
          />
        </Grid>
      </form>
    </FormContext>
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    language_direction: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
    currentUser: state.active.activeUser,
  };
};
export default connect(mapStateToProps, null)(InstructionsForTreatment);
