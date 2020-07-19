import React, { Fragment } from 'react';
import {
  FormattedMessage,
  FormattedNumber,
  defineMessages,
  useIntl,
} from 'react-intl';

const { description } = defineMessages({
  description: {
    id: 'description',
    defaultMessage: 'An example module using React Intl with One App.',
  },
});

const ChildModuleWithReactIntl = () => {
  const intl = useIntl();
  return (
    <Fragment>
      <p>
        <FormattedMessage id="greeting" defaultMessage="Hello, World!" />
      </p>
      <p>
        <FormattedNumber value={9000} />
      </p>
      <p>
        <span>{intl.formatMessage(description)}</span>
      </p>
    </Fragment>
  );
};

export default ChildModuleWithReactIntl;
