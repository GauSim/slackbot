import _ = require('lodash');
import { IApplication, AppName, AppType } from '../models/Application';
import { AppCollection } from '../models/AppCollection';
import { EnvFilter, Environment, EnvName } from '../models/Environment';

const FSM_WEB_APP_ENV_HOSTS = (): [EnvName, string][] => [
  ['ET', 'https://et.coresystems.net'],
  ['QT', 'https://qt.coresystems.net'],
  ['SANDBOX', 'https://sb.coresystems.net'],
  ['PROD', 'https://apps.coresystems.net'],
  ['DE', 'https://de.coresystems.net'],
  ['EU', 'https://eu.coresystems.net'],
  ['CN', 'https://cn.coresystems.net'],
  ['US', 'https://us.coresystems.net']
] as [EnvName, string][];

const FSM_WEB_APP_PATHS = (): [AppName, string, AppType][] => [
  ['WFM', 'workforce-management', 'WEBAPP_EMBBEDDED'],
  ['AR', 'analytics-reporting', 'WEBAPP_EMBBEDDED'],
  ['MDM', 'master-data-management', 'WEBAPP_EMBBEDDED'],
  ['KM', 'knowledge-management', 'WEBAPP_EMBBEDDED'],
  ['SM', 'system-monitoring', 'WEBAPP_EMBBEDDED'],
  ['PM', 'project-management', 'WEBAPP_EMBBEDDED'],
  ['DL', 'dataloader', 'WEBAPP_EMBBEDDED'],
  ['CO', 'configuration', 'WEBAPP_EMBBEDDED'],
  ['MP', 'marketplace', 'WEBAPP_EMBBEDDED'],
  ['CDC', 'checklist-data-collector', 'WEBAPP_EMBBEDDED'],
  ['SU', 'sign-up', 'WEBAPP_EMBBEDDED'],
  ['STORE', 'store', 'WEBAPP_EMBBEDDED'],
  ['MAP2', 'service-map', 'WEBAPP_EMBBEDDED'],
  ['TMJ', 'time-material-journal', 'WEBAPP_EMBBEDDED'],
  ['SCD', 'service-call-detail', 'WEBAPP_EMBBEDDED']
] as [AppName, string, AppType][];

const appCollection = new AppCollection([
  ({
    appShortName: 'CS',
    githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
    type: 'APP_BACKEND',
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/cs'],
      ['QT', 'https://qt.dev.coresuite.com/cs'],
      ['PROD', 'https://apps.coresystems.net/cs'],
      ['DE', 'https://de.coresuite.com/cs'],
      ['EU', 'https://eu.coresuite.com/cs'],
      ['US', 'https://us.coresuite.com/cs'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/cs']
    ])
  } as IApplication),
  ({
    appShortName: 'DS',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: [
      ['PROD', 'https://ds.coresuite.com/ds'],
      ['EU', 'https://eu.coresuite.com/ds']
    ]
  } as IApplication),
  ({
    appShortName: 'MC',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/mc'],
      ['QT', 'https://qt.dev.coresuite.com/mc'],
      ['PROD', 'https://ds.coresuite.com/mc'],
      ['DE', 'https://de.coresuite.com/mc'],
      ['EU', 'https://eu.coresuite.com/mc'],
      ['US', 'https://us.coresuite.com/mc'],
      ['CN', 'https://cn.coresuite.cn/mc'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/mc']
    ])
  } as IApplication),
  ({
    appShortName: 'DC',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/dc'],
      ['QT', 'https://qt.dev.coresuite.com/dc'],
      ['PROD', 'https://ds.coresuite.com/dc'],
      ['DE', 'https://de.coresuite.com/dc'],
      ['EU', 'https://eu.coresuite.com/dc'],
      ['US', 'https://us.coresuite.com/dc'],
      ['CN', 'https://cn.coresuite.cn/dc'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/dc']
    ] as [EnvName, string][])
  } as IApplication),
  ({
    appShortName: 'ADMIN',
    githubRepoUrl: 'https://github.com/coresystemsFSM/admin',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.coresystems.net/admin'],
      ['QT', 'https://qt.coresystems.net/admin'],
      ['PROD', 'https://eu.coresystems.net/admin'],
      ['DE', 'https://de.coresystems.net/admin'],
      ['EU', 'https://eu.coresystems.net/admin'],
      ['US', 'https://us.coresystems.net/admin'],
      ['CN', 'https://cn.coresystems.cn/admin'],
      ['SANDBOX', 'https://sb.coresystems.net/admin']
    ])
  } as IApplication),
  ({
    appShortName: 'NOW',
    githubRepoUrl: 'https://github.com/coresystemsFSM/now',
    type: 'WEBAPP' as AppType,
    envMap: ([
      ['ET', 'https://et.now.gl'],
      ['QT', 'https://qt.now.gl'],
      ['US', 'https://us.now.gl'],
      ['DE', 'https://de.now.gl'],
      ['EU', 'https://eu.now.gl'],
      ['PROD', 'https://now.gl']
    ])
  } as IApplication),

  ...FSM_WEB_APP_PATHS()
    .map(([appShortName, path, type]: [AppName, string, AppType]) => ({
      appShortName,
      type: type,
      githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
      envMap: FSM_WEB_APP_ENV_HOSTS()
        .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
    })) as IApplication[],

] as IApplication[]);


export class Repository {

  public static filter(envFilter: EnvFilter): Environment[] {
    return appCollection.all.reduce((list, it) => [...list, ...it.filterEnvironments(envFilter)], [] as Environment[]);
  }

  public static isAppName = (it: string) => !!it && appCollection.getAllAppNames().map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1;

  public static matchEnvOrApp = (textInput?: EnvName | AppName | string): string[] => {
    const allPossibleMatches = _.sortBy([
      ...appCollection.getAllEnvNames(),
      ...appCollection.getAllAppNames()
    ]);

    return textInput
      ? textInput === 'ALL'
        ? appCollection.getAllEnvNames()
        : (textInput.indexOf(',') > 1
          ? textInput.split(',')
          : textInput.split(' '))
          .map(it => it.trim())
          .filter(it => !!it && (allPossibleMatches.map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1))
          .reduce((list, it) => [...list, ...([['NIGHTLY', 'ET']] // fill in aliases
            .find(list => list.indexOf((it).toUpperCase()) > -1) || [it])], [] as string[])

      : allPossibleMatches;
  }
}
