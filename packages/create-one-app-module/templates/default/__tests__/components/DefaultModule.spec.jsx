import React from 'react';
import { shallow } from 'enzyme';
import DefaultModule from '../../src/components/DefaultModule';

describe('DefaultModule should render as expected', () => {
  it('module should render correct JSX', () => {
    const renderedModule = shallow(<DefaultModule />);
    expect(renderedModule.find('div')).toMatchSnapshot();
  });
});
