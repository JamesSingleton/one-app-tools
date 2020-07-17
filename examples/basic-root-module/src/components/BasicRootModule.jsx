import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import childRoutes from '../childRoutes';

export const BasicRootModule = ({ children }) => {
  return (
    <Fragment>
      <Helmet title="Basic Root Module" />
      {children}
    </Fragment>
  );
};

BasicRootModule.childRoutes = childRoutes;

BasicRootModule.propTypes = {
  children: PropTypes.node.isRequired,
};

if (!global.BROWSER) {
  // eslint-disable-next-line global-require
  BasicRootModule.appConfig = require('../config').default;
}

export default BasicRootModule;
