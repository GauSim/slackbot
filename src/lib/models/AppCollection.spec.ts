import { AppCollection } from './AppCollection';
import { Application, IApplication } from './Application';
import * as assert from 'assert';

describe('AppCollection.spec.ts', () => {

  const mockedAppRaw: IApplication = {
    appShortName: 'WFM',
    githubRepoUrl: 'http://example.com',
    type: 'WEBAPP_EMBBEDDED',
    envMap: [
      ['PROD', 'http://example.com', undefined]
    ]
  };

  it('#all returns all', () => {
    const list = new AppCollection([mockedAppRaw]);
    assert.deepEqual(
      list.all,
      [new Application(mockedAppRaw)]
    );
  });

  it('#getApp returns correct app by name', () => {
    const list = new AppCollection([mockedAppRaw]);
    assert.deepEqual(
      list.getApp(mockedAppRaw.appShortName),
      new Application(mockedAppRaw)
    );
  });

  it('#getApps returns correct apps by name', () => {
    const list = new AppCollection([mockedAppRaw]);
    assert.deepEqual(
      list.getApps([mockedAppRaw.appShortName]),
      [new Application(mockedAppRaw)]
    );
  });

  it('#getByType returns correct apps by type', () => {
    const list = new AppCollection([mockedAppRaw]);
    assert.deepEqual(
      list.getByType(mockedAppRaw.type),
      [new Application(mockedAppRaw)]
    );
  });

  it('#getAllAppNames retuns all names sorted', () => {
    const list = new AppCollection([
      mockedAppRaw,
      Object.assign({}, mockedAppRaw, { appShortName: 'ADMIN' })
    ]);
    assert.deepEqual(
      list.getAllAppNames(),
      ['ADMIN', 'WFM']
    );
  });

});  