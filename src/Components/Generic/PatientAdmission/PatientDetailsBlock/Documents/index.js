import React, { useState, useEffect } from 'react';
import { StyledFormGroup, StyledDivider, StyledButton } from '../Style';
import Title from 'Assets/Elements/Title';
import { Grid } from '@material-ui/core';
import ChipWithImage from 'Assets/Elements/StyledChip';
import { Scanner, AddCircle } from '@material-ui/icons';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { calculateFileSize } from 'Utils/Helpers/calculateFileSize';
import moment from 'moment';
import { FHIR } from 'Utils/Services/FHIR';
import { decodeBase_64IntoBlob } from 'Utils/Helpers/decodeBase_64IntoBlob';
import { combineBase_64 } from 'Utils/Helpers/combineBase_64';
import normalizeFhirDocumentReference from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirDocumentReference';
import CustomizedPopup from 'Assets/Elements/CustomizedPopup';
const Documents = ({ eid, pid, handleLoading }) => {
  const { t } = useTranslation();
  const { setValue, register, unregister, isCommitmentForm } = useFormContext();

  const [referralFile_64, setReferralFile_64] = useState('');
  const [commitmentFile_64, setCommitmentFile_64] = useState('');
  const [additionalDocumentFile_64, setAdditionalDocumentFile_64] = useState(
    '',
  );
  const [documents, setDocuments] = useState([]);
  const [referralFile, setReferralFile] = useState({});
  const [commitmentFile, setCommitmentFile] = useState({});
  const [additionalDocumentFile, setAdditionalDocumentFile] = useState({});
  const [numOfAdditionalDocument, setNumOfAdditionalDocument] = useState([]);
  const [
    nameOfAdditionalDocumentFile,
    setNameOfAdditionalDocumentFile,
  ] = useState('');
  // Files scan - vars - refs
  const referralRef = React.useRef();
  const commitmentRef = React.useRef();
  const additionalDocumentRef = React.useRef();
  const [referralBlob, setReferralBlob] = useState('');
  const [commitmentBlob, setCommitmentBlob] = useState('');
  const [additionalDocumentBlob, setAdditionalDocumentBlob] = useState('');

  // Files scan - vars - globals
  const FILES_OBJ = { type: 'MB', valueInBytes: 1000000, maxSize: 2, fix: 1 };
  // Files scan - functions
  async function onChangeFileHandler(ref, setState, fileName) {
    const files = ref.current.files;
    const [BoolAnswer, SizeInMB] = calculateFileSize(
      files[files.length - 1].size,
      FILES_OBJ.valueInBytes,
      FILES_OBJ.fix,
      FILES_OBJ.maxSize,
    );
    if (!BoolAnswer) {
      const fileObject = {};
      const reader = new FileReader();
      reader.onload = (event) => {
        const objForForm = {
          base_64: event.target.result,
          name: `${fileName}_${moment().format('L')}_${moment().format(
            'HH:mm',
          )}_${files[files.length - 1].name}`,
        };
        if (fileName === 'Referral') {
          setValue('Referral', objForForm);
          setReferralFile_64(event.target.result);
        } else if (fileName === 'Commitment') {
          setValue('Commitment', objForForm);
          setCommitmentFile_64(event.target.result);
        } else {
          setValue('additionalDocumentFile_64', objForForm);
          setAdditionalDocumentFile_64(event.target.result);
        }
      };
      reader.readAsDataURL(ref.current.files[0]);
      fileObject['name'] = `${fileName}_${moment().format(
        'L',
      )}_${moment().format('HH:mm')}_${files[files.length - 1].name}`;
      fileObject['size'] = SizeInMB;
      setValue(`${fileName}File`, fileObject.name, true);
      setState({ ...fileObject });
    } else {
      ref.current.value = '';
    }
  }
  const onClickFileHandler = (event, ref) => {
    event.stopPropagation();
    event.preventDefault();
    let refId = ref.current.id;
    if (documents.length) {
      if (documents.find((doc) => doc.url.startsWith(refId))) {
        if (refId.startsWith('Referral')) {
          window.open(URL.createObjectURL(referralBlob), referralFile.name);
        } else if (refId.startsWith('Commitment')) {
          window.open(URL.createObjectURL(commitmentBlob), commitmentFile.name);
        } else {
          window.open(
            URL.createObjectURL(additionalDocumentBlob),
            additionalDocumentFile.name,
          );
        }
      } else {
        window.open(
          URL.createObjectURL(ref.current.files[0]),
          ref.current.files[0].name,
        );
      }
    } else {
      window.open(
        URL.createObjectURL(ref.current.files[0]),
        ref.current.files[0].name,
      );
    }
  };

  const onDeletePopUp = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsPopUpOpen(true);
  };

  const onClickAdditionalDocumentHandler = () => {
    numOfAdditionalDocument.length !== 1 &&
      setNumOfAdditionalDocument((prevState) => {
        let clonePrevState = prevState;
        clonePrevState.push(clonePrevState.length);
        return [...clonePrevState];
      });
  };
  const onChangeAdditionalDocumentHandler = (e) => {
    setNameOfAdditionalDocumentFile(e.target.value);
  };

  const handleServerFileDelete = async () => {
    if (documents.length) {
      const documentIndex = documents.findIndex((document) =>
        document.url.startsWith(popUpReferenceFile),
      );
      if (documentIndex !== -1 && documents[documentIndex].id) {
        const res = await FHIR('DocumentReference', 'doWork', {
          functionName: 'deleteDocumentReference',
          documentReferenceId: documents[documentIndex].id,
        });
        if (res && res.status === 200) {
          documents.splice(documentIndex, 1);
        }
      }
    }
  };

  const onDeleteFileHandler = () => {
    const emptyObj = {};
    if (popUpReferenceFile === 'Referral') {
      referralRef.current.value = '';
      setValue(`${popUpReferenceFile}`, {});
      setReferralFile_64('');
      setReferralFile(emptyObj);
      handleServerFileDelete();
    } else if (popUpReferenceFile === 'Commitment') {
      commitmentRef.current.value = '';
      setValue(`${popUpReferenceFile}`, {});
      setCommitmentFile_64('');
      setCommitmentFile(emptyObj);
      handleServerFileDelete();
    } else if (
      popUpReferenceFile === nameOfAdditionalDocumentFile ||
      popUpReferenceFile === 'Document1'
    ) {
      setValue('additionalDocumentFile_64', {});
      additionalDocumentRef.current.value = '';
      setAdditionalDocumentFile_64('');
      setAdditionalDocumentFile(emptyObj);
      handleServerFileDelete();
    }
    handlePopUpClose();
  };
  // PopUp
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [popUpReferenceFile, setPopUpReferenceFile] = useState('');
  const handlePopUpClose = () => {
    setIsPopUpOpen(false);
  };
  useEffect(() => {
    if (isCommitmentForm === '1') {
      register({ name: 'Commitment' });
    }
    register({ name: 'Referral' });
    register({ name: 'additionalDocumentFile_64' });
    (async () => {
      const documentReferenceData = await FHIR('DocumentReference', 'doWork', {
        functionName: 'getDocumentReference',
        searchParams: {
          encounter: eid,
          patient: pid,
        },
      });
      if (documentReferenceData.data.total) {
        const documentsArray = [];
        for (
          let documentIndex = 0;
          documentReferenceData.data.entry.length > documentIndex;
          documentIndex++
        ) {
          if (documentReferenceData.data.entry[documentIndex].resource) {
            const normalizedFhirDocumentReference = normalizeFhirDocumentReference(
              documentReferenceData.data.entry[documentIndex].resource,
            );
            documentsArray.push(normalizedFhirDocumentReference);
            const base_64 = combineBase_64(
              normalizedFhirDocumentReference.data,
              normalizedFhirDocumentReference.contentType,
            );
            const [, SizeInMB] = calculateFileSize(
              atob(normalizedFhirDocumentReference.data).length,
              FILES_OBJ.valueInBytes,
              FILES_OBJ.fix,
              FILES_OBJ.maxSize,
            );
            let obj = {
              name: normalizedFhirDocumentReference.url,
              size: SizeInMB,
            };
            const blob = decodeBase_64IntoBlob(
              normalizedFhirDocumentReference.data,
              normalizedFhirDocumentReference.contentType,
            );
            const objForForm = {
              base_64,
              name: normalizedFhirDocumentReference.url,
            };
            if (normalizedFhirDocumentReference.url.startsWith('Referral')) {
              setValue('Referral', objForForm);
              setReferralBlob(blob);
              setReferralFile_64(base_64);
              setReferralFile(obj);
              referralRef.current = base_64;
            } else if (
              normalizedFhirDocumentReference.url.startsWith('Commitment') &&
              isCommitmentForm === '1'
            ) {
              setValue('Commitment', objForForm);
              setCommitmentBlob(blob);
              commitmentRef.current = base_64;
              setCommitmentFile_64(base_64);
              setCommitmentFile(obj);
            } else {
              setValue('additionalDocumentFile_64', objForForm);
              setAdditionalDocumentBlob(blob);
              additionalDocumentRef.current = base_64;
              setAdditionalDocumentFile_64(base_64);
              setAdditionalDocumentFile(obj);
            }
          }
        }
        setDocuments(documentsArray);
        handleLoading('documents');
      } else {
        handleLoading('documents');
      }
    })();
    return () => {
      let itemsToUnregister = ['additionalDocumentFile_64', 'Referral'];
      if (isCommitmentForm === '1') itemsToUnregister.push('Commitment');
      unregister(itemsToUnregister);
    };
  }, [
    FILES_OBJ.fix,
    eid,
    pid,
    isCommitmentForm,
    FILES_OBJ.maxSize,
    FILES_OBJ.valueInBytes,
    register,
    setValue,
    unregister,
  ]);
  return (
    <React.Fragment>
      <CustomizedPopup
        isOpen={isPopUpOpen}
        onClose={handlePopUpClose}
        bottomButtons={[
          {
            color: 'primary',
            label: 'Delete',
            variant: 'contained',
            onClickHandler: onDeleteFileHandler,
          },
          {
            color: 'primary',
            label: 'Do not delete',
            variant: 'outlined',
            onClickHandler: handlePopUpClose,
          },
        ]}
        title={t('System notification')}>
        {`${t('You choose to delete the document')} ${t(
          popUpReferenceFile,
        )} ${t('Do you want to continue?')}`}
      </CustomizedPopup>
      <StyledFormGroup>
        <Title
          fontSize={'18px'}
          color={'#000b40'}
          label={t('Upload documents')}
          bold
        />
        <Title
          fontSize={'14px'}
          color={'#000b40'}
          label={`${t('Uploading documents with a maximum size of up to')} ${
            FILES_OBJ.maxSize
          }${FILES_OBJ.type}`}
        />
        <StyledDivider variant='fullWidth' />
        {/* ReferralRef  */}
        <Grid container alignItems='center' style={{ marginBottom: '41px' }}>
          <Grid item xs={3}>
            <label htmlFor='Referral'>{`${t('Referral')}`}</label>
          </Grid>
          <Grid item xs={9}>
            <input
              name='ReferralFile'
              ref={(e) => {
                referralRef.current = e;
                register();
              }}
              id='Referral'
              type='file'
              accept='.pdf,.gpf,.png,.gif,.jpg'
              onChange={() =>
                onChangeFileHandler(referralRef, setReferralFile, 'Referral')
              }
            />
            {Object.values(referralFile).length > 0 ? (
              <ChipWithImage
                htmlFor='Referral'
                label={referralFile.name}
                size={referralFile.size}
                onDelete={(event) => {
                  setPopUpReferenceFile('Referral');
                  onDeletePopUp(event);
                }}
                onClick={(event) => onClickFileHandler(event, referralRef)}
              />
            ) : (
              <label htmlFor='Referral'>
                <StyledButton
                  variant='outlined'
                  color='primary'
                  component='span'
                  size={'large'}
                  startIcon={<Scanner />}>
                  {t('Upload document')}
                </StyledButton>
              </label>
            )}
          </Grid>
        </Grid>
        {/* CommitmentRef  */}
        {isCommitmentForm === '1' && (
          <Grid container alignItems='center' style={{ marginBottom: '41px' }}>
            <Grid item xs={3}>
              <label htmlFor='Commitment'>{`${t('Commitment')}`}</label>
            </Grid>
            <Grid item xs={9}>
              <input
                name='CommitmentFile'
                ref={(e) => {
                  commitmentRef.current = e;
                  register();
                }}
                id='Commitment'
                type='file'
                accept='.pdf,.gpf,.png,.gif,.jpg'
                onChange={() =>
                  onChangeFileHandler(
                    commitmentRef,
                    setCommitmentFile,
                    'Commitment',
                  )
                }
              />
              {Object.values(commitmentFile).length > 0 ? (
                <ChipWithImage
                  htmlFor='Commitment'
                  label={commitmentFile.name}
                  size={commitmentFile.size}
                  onDelete={(event) => {
                    setPopUpReferenceFile('Commitment');
                    onDeletePopUp(event);
                  }}
                  onClick={(event) => onClickFileHandler(event, commitmentRef)}
                />
              ) : (
                <label htmlFor='Commitment'>
                  <StyledButton
                    variant='outlined'
                    color='primary'
                    component='span'
                    size={'large'}
                    startIcon={<Scanner />}>
                    {t('Upload document')}
                  </StyledButton>
                </label>
              )}
            </Grid>
          </Grid>
        )}
        {/* AdditionalDocumentRef */}
        {numOfAdditionalDocument.map((_, additionalDocumentIndex) => {
          return (
            <Grid container alignItems='center' key={additionalDocumentIndex}>
              <Grid item xs={3}>
                <CustomizedTextField
                  width={'70%'}
                  onChange={onChangeAdditionalDocumentHandler}
                  label={`${t('Additional document')}`}
                />
              </Grid>
              <Grid item xs={9}>
                <input
                  name={nameOfAdditionalDocumentFile || 'Document1'}
                  ref={(e) => {
                    additionalDocumentRef.current = e;
                    register();
                  }}
                  id='AdditionalDocument'
                  type='file'
                  accept='.pdf,.gpf,.png,.gif,.jpg'
                  onChange={() =>
                    onChangeFileHandler(
                      additionalDocumentRef,
                      setAdditionalDocumentFile,
                      nameOfAdditionalDocumentFile || 'Document1',
                    )
                  }
                />
                {Object.values(additionalDocumentFile).length > 0 ? (
                  <ChipWithImage
                    htmlFor='AdditionalDocument'
                    label={additionalDocumentFile.name}
                    size={additionalDocumentFile.size}
                    onDelete={(event) => {
                      setPopUpReferenceFile(
                        nameOfAdditionalDocumentFile || 'Document1',
                      );
                      onDeletePopUp(event);
                    }}
                    onClick={(event) =>
                      onClickFileHandler(event, additionalDocumentRef)
                    }
                  />
                ) : (
                  <label htmlFor='AdditionalDocument'>
                    <StyledButton
                      variant='outlined'
                      color='primary'
                      component='span'
                      size={'large'}
                      startIcon={<Scanner />}>
                      {t('Upload document')}
                    </StyledButton>
                  </label>
                )}
              </Grid>
            </Grid>
          );
        })}
        <Grid container alignItems='center'>
          <AddCircle
            style={{ color: '#002398', cursor: 'pointer' }}
            onClick={onClickAdditionalDocumentHandler}
          />
          <Title
            margin='0 8px 0 8px'
            bold
            color={'#002398'}
            label={'Additional document'}
          />
        </Grid>
      </StyledFormGroup>
    </React.Fragment>
  );
};

export default Documents;
