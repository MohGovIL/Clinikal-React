import {
  StyledConstantHeaders,
  StyledForm,
  StyledVarientIndicatorsTR,
} from './Style';
import React from 'react';

import { useTranslation } from 'react-i18next';

const VariantIndicators = ({ variantIndicators }) => {
  const { t } = useTranslation();
  if (!variantIndicators) {
    return null;
  } else {
    return (
      <React.Fragment>
        <StyledConstantHeaders>
          {t('Variable indicators')}
        </StyledConstantHeaders>
        <hr />
        <table>
          <tbody>
            {variantIndicators.map((indicatorLogged, index) => {
              return (
                <StyledVarientIndicatorsTR key={index}>
                  {indicatorLogged.map((value, index) => {
                    return (
                      <td key={index}>
                        <value.componentType
                          inputProps={{ pattern: value.pattern }}
                          onChange={value.handleOnChange}
                          id={value.id}
                          label={
                            t(value.label) /*+ ' (' + t(value.type) + ')'*/
                          }
                          value={value.value}
                        />
                      </td>
                    );
                  })}
                </StyledVarientIndicatorsTR>
              );
            })}
          </tbody>
        </table>
        <StyledForm autoComplete='off'></StyledForm>
      </React.Fragment>
    );
  }
};
export default VariantIndicators;
