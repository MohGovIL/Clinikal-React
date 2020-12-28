//DiagnosisAndRecommendations

import { connect } from 'react-redux';
import React, { useEffect, useState } from 'react';
import DiagnosisAndTreatment from './DiagnosisAndTreatment';
import RecommendationsOnRelease from './RecommendationsOnRelease';
import DecisionOnRelease from './DecisionOnRelease';
import DrugRecommendation from './DrugRecommendation';
import StyledDiagnosisAndRecommendations from './Style';
import { useForm, FormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FHIR } from 'Utils/Services/FHIR';
import PopUpFormTemplates from 'Components/Generic/PopupComponents/PopUpFormTemplates';
import SaveForm from 'Components/Forms/GeneralComponents/SaveForm';
import * as moment from 'moment';
import { store } from 'index';
import normalizeFhirQuestionnaireResponse from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirQuestionnaireResponse';
import { fhirFormatDateTime } from 'Utils/Helpers/Datetime/formatDate';
import Loader from "../../../Assets/Elements/Loader";

const DiagnosisAndRecommendations = ({
  patient,
  encounter,
  formatDate,
  languageDirection,
  verticalName,
  permission,
  functionToRunOnTabChange,
  validationFunction,
  isSomethingWasChanged,
}) => {
  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      drugRecommendation: [
        {
          drugName: '',
          quantity: '',
          drugForm: '',
          drugRoute: '',
          intervals: '',
          duration: '',
          toDate: '',
          instructionsForTheDrug: '',
        },
      ],
    },
  });

  const { handleSubmit, setValue, register, unregister, getValues } = methods;
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  /*
   * <FORM DIRTY FUNCTIONS>
   * */
  const [initValueObj, setInitValueObj] = useState({});

  /*
   * Save all the init value in the state than call to setValue
   * */
  const initValue = (arrayValues, setVal = true) => {
    setInitValueObj((prev) => {
      const initValues = { ...prev };
      arrayValues.forEach((val) => {
        for (const index in val) {
          if (!initValues.hasOwnProperty(index)) {
            initValues[index] = val[index];
          }
        }
      });
      return initValues;
    });
    if (setVal) {
      setValue(arrayValues);
    }
  };

  /*
   * compare initValueObj with currentValues and find changes
   * */
  const isFormDirty = () => {
    const currentValues = getValues({ nest: true });
    console.log(currentValues);
    console.log(initValueObj);

    const emptyInFirst = [
      'diagnosisDetails',
      'findingsDetails',
      'instructionsForFurtherTreatment',
      'treatmentDetails',
      'evacuationWay',
      'decision',
      'numberOfDays'
    ];
    for (const elem of emptyInFirst) {
      if (
        typeof currentValues[elem] !== 'undefined' &&
        currentValues[elem].length > 0 &&
        typeof initValueObj[elem] === 'undefined'
      ) {
        return true;
      }
    }

    for (const index in initValueObj) {
      if (
        JSON.stringify(initValueObj[index]) !==
        JSON.stringify(currentValues[index])
      ) {
        console.log(`changed - ${index}`);
        return true;
      }
    }
    return false;
  };


  /*
   * </END FORM DIRTY FUNCTIONS>
   * */

  /*
   * setLoading - hide/show loader
   * loadingStatus - stores the status of the loading of the component in the screen
   * handleLoading update the status of the loading
   * */
  const [loadingStatus, setLoadingStatus] = useState({
    questionnaireResponse: false,
    drugRecommendation: false,
  });
  const [disabledOnSubmit, setdisabledOnSubmit] = useState(false);

  useEffect(() => {
    for (const val in loadingStatus) {
      if (!loadingStatus[val]) return;
    }
    setLoading(false);
  }, [loadingStatus]);

  const handleLoading = (componentName) => {
    setLoadingStatus((prev) => {
      const cloneLoadingStatus = { ...prev };
      cloneLoadingStatus[componentName] = true;
      return cloneLoadingStatus;
    });
  };

  const answerType = (type, data) => {
    if (type === 'string') {
      return [
        {
          valueString: data,
        },
      ];
    } else if (type === 'integer') {
      return [
        {
          valueInteger: data,
        },
      ];
    } else {
      return `No such type: ${type}`;
    }
  };

  const [
    normalizedQuestionnaireResponse,
    setNormalizedQuestionnaireResponse,
  ] = React.useState({});

  React.useEffect(() => {
    (async () => {
      try {
        let normalizedFhirQuestionnaireResponse = {};
        const q = await FHIR('Questionnaire', 'doWork', {
          functionName: 'getQuestionnaire',
          functionParams: {
            QuestionnaireName: 'diagnosis_and_recommendations_questionnaire',
          },
        });
        const questionnaireResponse = await FHIR(
          'QuestionnaireResponse',
          'doWork',
          {
            functionName: 'getQuestionnaireResponse',
            functionParams: {
              encounterId: encounter.id,
              patientId: patient.id,
              questionnaireId: q.data.entry[1].resource.id,
            },
          },
        );
        if (questionnaireResponse.data.total) {
          normalizedFhirQuestionnaireResponse = normalizeFhirQuestionnaireResponse(
            questionnaireResponse.data.entry[1].resource,
          );
          setNormalizedQuestionnaireResponse(
            normalizedFhirQuestionnaireResponse,
          );
        }
        const Questionnaire = q.data.entry[1].resource;
        register({ name: 'questionnaire' });
        register({ name: 'questionnaireResponseId' });
        initValue([
          { questionnaire: Questionnaire },
          { questionnaireResponseId: normalizedFhirQuestionnaireResponse.id },
        ]);
        handleLoading('questionnaireResponse');
      } catch (error) {
        console.log(error);
        handleLoading('questionnaireResponse');
      }
    })();

    return () => unregister(['questionnaire', 'questionnaireResponseId']);
  }, [register, setValue, unregister, encounter.id, patient.id]);

  const [requiredErrors, setRequiredErrors] = React.useState([
    {
      quantity: '',
      drugForm: '',
      drugRoute: '',
      intervals: '',
      duration: '',
    },
  ]);

  const requiredFields = React.useMemo(() => {
    return {
      quantity: {
        name: 'quantity',
        required: function (data) {
          return data && data.length > 0;
        },
      },
      drugForm: {
        name: 'drugForm',
        required: function (data) {
          return data && data.length > 0;
        },
      },
      drugRoute: {
        name: 'drugRoute',
        required: function (data) {
          return data && data.length > 0;
        },
      },
      intervals: {
        name: 'intervals',
        required: function (data) {
          return data && data.length > 0;
        },
      },
      duration: {
        name: 'duration',
        required: function (data) {
          return data && data.length > 0;
        },
      },
    };
  }, []);

  const isRequiredValidation = (data) => {
    let clean = true;
    if (!data) data = getValues({ nest: true });

    if (!data['drugRecommendation']) {
      return clean;
    }
    for (
      let medicineIndex = 0;
      medicineIndex < requiredErrors.length;
      medicineIndex++
    ) {
      if (data['drugRecommendation'][medicineIndex].drugName.display) {
        //drugName is not a falsy value
        for (const fieldKey in requiredFields) {
          if (requiredFields.hasOwnProperty(fieldKey)) {
            let answer;
            const field = requiredFields[fieldKey];
            answer = field.required(
              data['drugRecommendation'][medicineIndex][field.name],
            );
            if (answer) {
              setRequiredErrors((prevState) => {
                const cloneState = [...prevState];
                cloneState[medicineIndex][field.name] = '';
                return cloneState;
              });
            } else {
              setRequiredErrors((prevState) => {
                const cloneState = [...prevState];
                cloneState[medicineIndex][field.name] = t(
                  'A value must be entered in the field',
                );
                return cloneState;
              });
              clean = false;
            }
          }
        }
      }
    }
    return clean;
  };

  const onSubmit = (data) => {
    setdisabledOnSubmit(true);
    if (permissionHandler() === 'view') return false;
    if (isFormDirty()) {
      if (!data) data = getValues({ nest: true });
      try {
        const APIsArray = [];
        const items = data.questionnaire.item.map((i) => {
          const item = {
            linkId: i.linkId,
            text: i.text,
          };
          switch (i.linkId) {
            case '1':
              if (data.findingsDetails)
                item['answer'] = answerType(i.type, data.findingsDetails);
              break;
            case '2':
              if (data.diagnosisDetails)
                item['answer'] = answerType(i.type, data.diagnosisDetails);
              break;
            case '3':
              if (data.treatmentDetails)
                item['answer'] = answerType(i.type, data.treatmentDetails);
              break;
            case '4':
              if (data.instructionsForFurtherTreatment)
                item['answer'] = answerType(
                  i.type,
                  data.instructionsForFurtherTreatment,
                );
              break;
            case '5':
              if (data.decision)
                item['answer'] = answerType(i.type, data.decision);
              break;
            case '6':
              if (data.evacuationWay)
                item['answer'] = answerType(i.type, data.evacuationWay);
              break;
            case '7':
              if (data.numberOfDays)
                item['answer'] = answerType(i.type, data.numberOfDays);
              break;
            default:
              break;
          }
          return item;
        });
        if (data.questionnaireResponseId) {
          APIsArray.push(
            FHIR('QuestionnaireResponse', 'doWork', {
              functionName: 'patchQuestionnaireResponse',
              questionnaireResponseId: data.questionnaireResponseId,
              questionnaireResponseParams: {
                item: items,
              },
            }),
          );
        } else {
          APIsArray.push(
            FHIR('QuestionnaireResponse', 'doWork', {
              functionName: 'createQuestionnaireResponse',
              functionParams: {
                questionnaireResponse: {
                  questionnaire: data.questionnaire.id,
                  status: 'completed',
                  patient: patient.id,
                  encounter: encounter.id,
                  author: store.getState().login.userID,
                  authored: fhirFormatDateTime(),
                  source: patient.id,
                  item: items,
                },
              },
            }),
          );
        }
        if (data.drugRecommendation && data.drugRecommendation.length) {
          data.drugRecommendation.forEach((drug, drugIndex) => {
            if (drug.drugName.code) {
              // There is a drugName and since we check if all required values are filled so I can add that to the APIsArray
              const medicationRequest = {};

              medicationRequest['status'] = 'active';
              medicationRequest['patient'] = patient.id;
              medicationRequest['encounter'] = encounter.id;
              medicationRequest['requester'] = store.getState().login.userID;
              medicationRequest['recorder'] = store.getState().login.userID;
              medicationRequest['note'] = drug.instructionsForTheDrug;
              medicationRequest['routeCode'] = drug.drugRoute;
              medicationRequest['medicationCodeableConceptCode'] =
                drug.drugName.code;
              medicationRequest['medicationCodeableConceptDisplay'] =
                drug.drugName.display;
              medicationRequest['timingCode'] = drug.intervals;
              medicationRequest['doseQuantity'] = drug.quantity;
              medicationRequest['methodCode'] = drug.drugForm;
              medicationRequest['timingRepeatStart'] = moment(
                drug.toDate,
                formatDate,
              )
                .subtract(drug.duration, 'days')
                .format('YYYY-MM-DD');
              medicationRequest['timingRepeatEnd'] = moment(
                drug.toDate,
                formatDate,
              ).format('YYYY-MM-DD');
              medicationRequest['authoredOn'] = fhirFormatDateTime();

              if (data.medicationRequest && data.medicationRequest[drugIndex]) {
                APIsArray.push(
                  FHIR('MedicationRequest', 'doWork', {
                    functionName: 'updateMedicationRequest',
                    functionParams: {
                      medicationRequest,
                      _id: data.medicationRequest[drugIndex],
                    },
                  }),
                );
              } else {
                APIsArray.push(
                  FHIR('MedicationRequest', 'doWork', {
                    functionName: 'createMedicationRequest',
                    functionParams: {
                      medicationRequest,
                    },
                  }),
                );
              }
            }
          });
        }
        return APIsArray;
      } catch (error) {
        console.log(error);
      }
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    validationFunction.current = isRequiredValidation;
    functionToRunOnTabChange.current = onSubmit;
    isSomethingWasChanged.current = isFormDirty;
    return () => {
      isSomethingWasChanged.current = false;
      functionToRunOnTabChange.current = () => [];
      validationFunction.current = () => true;
    };
  }, [initValueObj]);

  const handlePopUpClose = () => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: false,
      };
    });
  };

  const [defaultContext, setDefaultContext] = React.useState('');
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
  const statuses = [
    { label: 'Transfer to nurse', value: 'waiting_for_nurse' },
    { label: 'Transfer to doctor', value: 'waiting_for_doctor' },
    { label: 'Transfer to release', value: 'waiting_for_release' },
  ];
  const permissionHandler = React.useCallback(() => {
    let clonePermission = permission;
    if (encounter.status === 'finished') clonePermission = 'view';
    return clonePermission;
  }, [encounter.status, permission]);

  return (
    <StyledDiagnosisAndRecommendations>
      <PopUpFormTemplates {...popUpProps} />
      <FormContext
        {...methods}
        setPopUpProps={setPopUpProps}
        permission={permissionHandler()}
        serviceType={encounter.serviceTypeCode}
        reasonCode={encounter.examinationCode}
        requiredErrors={requiredErrors}
        setRequiredErrors={setRequiredErrors}
        questionnaireResponse={normalizedQuestionnaireResponse}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DiagnosisAndTreatment initValueFunction={initValue} />
          <RecommendationsOnRelease initValueFunction={initValue} />
          <DrugRecommendation
            encounterId={encounter.id}
            formatDate={formatDate}
            handleLoading={handleLoading}
            initValueFunction={initValue}
            languageDirection={languageDirection}
          />
          <DecisionOnRelease initValueFunction={initValue} />
          <SaveForm
            statuses={statuses}
            encounter={encounter}
            mainStatus={'in-progress'}
            validationFunction={isRequiredValidation}
            onSubmit={onSubmit}
            disabledOnSubmit={disabledOnSubmit}
            setLoading={setLoading}
            initValueFunction={initValue}
          />
        </form>
      </FormContext>
      {loading && <Loader />}
    </StyledDiagnosisAndRecommendations>
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
export default connect(mapStateToProps, null)(DiagnosisAndRecommendations);
