import React from 'react';
import {
  FormattedMessage,
  FormattedNumber,
  defineMessages,
  useIntl,
  IntlProvider,
} from 'react-intl';
import { loadLanguagePack } from '@americanexpress/one-app-ducks';

const { description } = defineMessages({
  description: {
    id: 'description',
    defaultMessage: 'An example module using React Intl with One App.',
  },
});

const RootModuleWithReactIntl = ({ languageData, localeName }) => {
  const intl = useIntl();
  return (
    <IntlProvider locale={localeName} messages={languageData}>
      <p>
        <FormattedMessage id="greeting" defaultMessage="Hello, World!" />
      </p>
      <p>
        <FormattedNumber value={9000} />
      </p>
      <p>
        <span>{intl.formatMessage(description)}</span>
      </p>
    </IntlProvider>
  );
};

export const loadModuleData = ({ store: { dispatch } }) =>
  dispatch(
    loadLanguagePack('root-module-with-react-intl', { fallbackLocale: 'en-US' })
  );

RootModuleWithReactIntl.holocron = {
  name: 'root-module-with-react-intl',
  loadModuleData,
};

export default RootModuleWithReactIntl;
