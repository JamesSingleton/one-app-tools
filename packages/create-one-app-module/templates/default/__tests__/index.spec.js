import MainExport from '../src';
import ModuleContainer from '../src/components/DefaultModule';

describe('index', () => {
  it('should export the top component', () => {
    expect(MainExport).toBe(ModuleContainer);
  });
});
