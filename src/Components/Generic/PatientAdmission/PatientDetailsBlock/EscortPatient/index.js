import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Title from 'Assets/Elements/Title';
import { StyledFormGroup, StyledDivider } from '../Style';
import { Grid, Switch } from '@material-ui/core';
import StyledToggleButtonGroup from 'Assets/Elements/StyledToggleButtonGroup';
import StyledToggleButton from 'Assets/Elements/StyledToggleButton';
import { useTranslation } from 'react-i18next';
import StyledSwitch from 'Assets/Elements/StyledSwitch';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { israelPhoneNumberRegex } from 'Utils/Helpers/validation/patterns';
import normalizeFhirRelatedPerson from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirRelatedPerson';
import { FHIR } from 'Utils/Services/FHIR';
const EscortPatient = ({
  isArrivalWay,
  relatedPersonId,
  encounterArrivalWay,
}) => {
  const {
    errors,
    setValue,
    register,
    unregister,
    control,
    watch,
    reset,
    getValues,
  } = useFormContext();
  const { t } = useTranslation();

  const watchIsEscorted = watch('isEscorted');

  const [arrivalWay, setArrivalWay] = useState(
    encounterArrivalWay || 'Independent',
  );

  const arrivalWayHandler = (event, way) => {
    setArrivalWay(() => {
      setValue('arrivalWay', way);
      return way;
    });
  };

  useEffect(() => {
    register({ name: 'arrivalWay' });
    setValue([{ arrivalWay: encounterArrivalWay }]);
    return () => {
      unregister('arrivalWay');
    };
  }, [unregister, register, setValue, encounterArrivalWay, relatedPersonId]);

  useEffect(() => {
    (async () => {
      try {
        if (relatedPersonId) {
          const relatedPerson = await FHIR('RelatedPerson', 'doWork', {
            functionName: 'getRelatedPerson',
            functionParams: {
              relatedPersonId,
            },
          });
          const normalizedRelatedPerson = normalizeFhirRelatedPerson(
            relatedPerson.data,
          );
          setName(normalizedRelatedPerson.name);
          setMobilePhone(normalizedRelatedPerson.mobilePhone);
          reset({
            ...getValues(),
            isEscorted: relatedPersonId ? true : false,
            escortMobilePhone: normalizedRelatedPerson.mobilePhone,
            escortName: normalizedRelatedPerson.name,
          });
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [relatedPersonId, setValue, getValues, reset]);

  const [mobilePhone, setMobilePhone] = useState('');
  const [name, setName] = useState('');

  return (
    <React.Fragment>
      <Title
        marginTop={'55px'}
        fontSize={'28px'}
        color={'#002398'}
        label={'Patient Details'}
      />
      {/* Escorted */}
      <StyledFormGroup>
        <Title
          fontSize={'18px'}
          color={'#000b40'}
          label={t('Accompanying patient')}
          bold
        />
        <StyledDivider variant={'fullWidth'} />
        <Grid
          container
          direction={'row'}
          justify={'flex-start'}
          alignItems={'center'}
          style={{ marginBottom: '50px' }}>
          {isArrivalWay === '1' && (
            <React.Fragment>
              <span>{`${t('Arrival way')}?`}</span>
              <StyledToggleButtonGroup
                value={arrivalWay}
                onChange={arrivalWayHandler}
                exclusive
                aria-label='Arrival way'>
                <StyledToggleButton value='Ambulance' aria-label='ambulance'>
                  {t('Ambulance')}
                </StyledToggleButton>
                <StyledToggleButton
                  value='Independent'
                  aria-label='Independent'>
                  {t('Independent')}
                </StyledToggleButton>
              </StyledToggleButtonGroup>
            </React.Fragment>
          )}
        </Grid>
        <Grid
          container
          direction={'row'}
          justify={'flex-start'}
          alignItems={'center'}>
          <span>
            {isArrivalWay === '1'
              ? `${t('Arrival with escort')}?`
              : `${t('Patient arrived with an escort')}?`}
          </span>
          <StyledSwitch
            register={register}
            name='isEscorted'
            label_1={'No'}
            label_2={'Yes'}
            marginLeft={'40px'}
            marginRight={'40px'}
          />
        </Grid>
      </StyledFormGroup>
      {/* Escorted Information */}
      {watchIsEscorted && (
        <StyledFormGroup>
          <Title
            fontSize={'18px'}
            color={'#000b40'}
            label={t('Escort details')}
            bold
          />
          <StyledDivider variant={'fullWidth'} />
          <Controller
            name='escortName'
            control={control}
            defaultValue={name}
            onBlur={([event]) => {
              setName(event.target.value);
              return event.target.value;
            }}
            as={<CustomizedTextField width={'70%'} label={t('Escort name')} />}
          />
          <Controller
            name='escortMobilePhone'
            control={control}
            defaultValue={mobilePhone}
            error={errors.escortMobilePhone && true}
            helperText={
              errors.escortMobilePhone && t('The number entered is incorrect')
            }
            rules={{
              pattern: israelPhoneNumberRegex(),
            }}
            onBlur={([event]) => {
              setMobilePhone(event.target.value);
              return event.target.value;
            }}
            as={
              <CustomizedTextField
                width={'70%'}
                label={t('Escort cell phone')}
              />
            }
          />
        </StyledFormGroup>
      )}
    </React.Fragment>
  );
};

export default EscortPatient;