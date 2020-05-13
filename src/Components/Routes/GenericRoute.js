import React from 'react';
import { Switch } from 'react-router-dom';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import { connect } from 'react-redux';
import PrivateRoute from 'Components/PrivateRoute/PrivateRoute';
import EncounterSheet from 'Components/Generic/EncounterSheet';

const GenericRoute = ({ isAuth }) => {
  return (
    <Switch>
      <PrivateRoute
        exact
        path={`${baseRoutePath()}/generic/encounterSheet`}
        component={EncounterSheet}
        isAuth={isAuth}
      />
    </Switch>
  );
};

const mapStateToProps = (state) => ({ isAuth: state.login.isAuth });

export default connect(mapStateToProps, null)(GenericRoute);
