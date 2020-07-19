import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, IntlProvider } from 'react-intl';
import { loadLanguagePack } from '@americanexpress/one-app-ducks';
import childRoutes from '../childRoutes';

const RootModuleWithReactIntl = ({ languageData, localeName }) => (
  <IntlProvider locale={localeName} messages={languageData}>
    <p>
      <FormattedMessage id="greeting" defaultMessage="Hello, World!" />
    </p>
    <p>
      <FormattedNumber value={9000} />
    </p>
  </IntlProvider>
);

export const loadModuleData = async ({ store: { dispatch } }) => {
  await dispatch(
    loadLanguagePack('root-module-with-react-intl', { fallbackLocale: 'en-US' })
  );
};

export const mapStateToProps = (state) => {
  const localeName = state.getIn(['intl', 'activeLocale']);
  const languagePack = state
    .getIn(
      ['intl', 'languagePacks', localeName, 'root-module-with-react-intl'],
      fromJS({})
    )
    .toJS();

  return {
    languageData: languagePack && languagePack.data ? languagePack.data : {},
    localeName,
  };
};

RootModuleWithReactIntl.propTypes = {
  languageData: PropTypes.shape({
    greeting: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  localeName: PropTypes.string.isRequired,
};

RootModuleWithReactIntl.holocron = {
  name: 'root-module-with-react-intl',
  loadModuleData,
};

RootModuleWithReactIntl.childRoutes = childRoutes;

if (!global.BROWSER) {
  // eslint-disable-next-line global-require
  RootModuleWithReactIntl.appConfig = require('../appConfig').default;
}

export default connect(mapStateToProps)(RootModuleWithReactIntl);
