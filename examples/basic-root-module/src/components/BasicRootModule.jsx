import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import childRoutes from '../childRoutes';

export const BasicRootModule = ({ children }) => {
  return <Fragment>{children}</Fragment>;
};

BasicRootModule.childRoutes = childRoutes;

BasicRootModule.propTypes = {
  children: PropTypes.node.isRequired,
};

if (!global.BROWSER) {
  // eslint-disable-next-line global-require
  BasicRootModule.appConfig = require('../appConfig').default;
}

export default BasicRootModule;
