/**
 * @author Dror Golan drorgo@matrix.co.il
 * purpose : these functions handle click in the ui and other things that are to be taken cared of
 * as requested like : padding a number with zero.
 */

import { StyledVariantTextField } from '../Style';
import FormattedInputs from 'Assets/Elements/MaskedControllers/FormattedInputs/FormattedInputs';

/**
 *
 * @param evt
 * @param variantIndicators
 * @param setVariantIndicators
 */
export const handleVarientCustomClickFunction = (
  evt,
  variantIndicators,
  setVariantIndicators,
) => {
  const name = evt.target.name;
  const newValue = evt.target.value;
  const valid = evt.target.validity.valid;
  const tempVariantIndicators = { ...variantIndicators };
  tempVariantIndicators[name].value = newValue;
  setVariantIndicators(tempVariantIndicators);
};
/**
 *
 * @param evt
 * @param variantIndicators
 * @param setVariantIndicators
 */
export const handleVarientPaddTheZeroPlaceClickFunction = (
  evt,
  variantIndicators,
  setVariantIndicators,
) => {
  const name = evt.target.name;
  let newValue = evt.target.value;
  const valid = evt.target.validity.valid;
  const tempVariantIndicators = { ...variantIndicators };
  //pad Fever With Zeros
  tempVariantIndicators[name].value = padTheZeroPlace(newValue);
  setVariantIndicators(tempVariantIndicators);
};

/**
 *
 * @param newValue
 * @returns {*}
 */
function padTheZeroPlace(newValue) {
  //pad Fever With Zeros
  if (
    parseFloat(newValue.replace(/_/g, '')) >= 0 &&
    newValue.slice(-1) === '_' &&
    parseFloat(newValue.slice(-3).replace(/_/g, '')) >= 0
  ) {
    newValue = newValue.replace('._', '.0');
  } else {
    newValue = newValue.replace('.0', '._');
  }
  return newValue;
}
export function mergeMultipleIndicators(
  variantIndicatorsNormalizedData,
  keyOne,
  keyTwo,
  seperator,
) {
  let keysPlaces = [];
  Object.entries(variantIndicatorsNormalizedData).map(([key, dataset]) => {
    if (
      dataset &&
      (dataset['description'] === keyOne || dataset['description'] === keyTwo)
    ) {
      keysPlaces.push(key);
    }
  });
  if (keysPlaces.length > 0) {
    let variantIndicatorsNormalizedDataTemp = JSON.parse(
      JSON.stringify(variantIndicatorsNormalizedData),
    );
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['description'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['description']
    }${seperator}${
      variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['description']
    }`;
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['unit'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['unit']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['unit']}`;
    if (
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value'] &&
      variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
    ) {
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value'] = `${
        variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value']
          ? variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value']
          : ''
      }${seperator}${
        variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
          ? variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
          : ''
      }`;
    }
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['mask'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['mask']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['mask']}`;
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['code'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['code']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['code']}`;

    delete variantIndicatorsNormalizedDataTemp[keysPlaces[1]];

    return variantIndicatorsNormalizedDataTemp;
  }
  return variantIndicatorsNormalizedData;
}

/**
 *
 * @param newRow
 * @param dataset
 * @param label
 * @param i
 * @param disabled
 * @param variantIndicatorsNew
 * @param sizeTemp
 * @param key
 */
export function thickenWithDataFunction({
  newRow,
  dataset,
  label,
  i,
  disabled,
  variantIndicatorsNew,
  sizeTemp,
  key,
}) {
  dataset.disabled = disabled;
  dataset.idTemp = i;
  dataset.newRow = newRow;
  dataset.name = dataset.label ? dataset.label : key;
  dataset.value = dataset.value
    ? dataset.value
    : variantIndicatorsNew[label]
    ? variantIndicatorsNew[label]
    : '';
  dataset.componentType = disabled ? StyledVariantTextField : FormattedInputs;
  dataset.id = `blood_pressure_${sizeTemp > 0 ? sizeTemp : i}`;
  dataset.componenttype = 'textFieldWithMask';
}
