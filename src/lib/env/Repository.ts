import _ = require('lodash');
import { IApplication, AppName, AppType } from '../models/Application';
import { AppCollection } from '../models/AppCollection';
import { EnvFilter, Environment, EnvName } from '../models/Environment';

/*
const withSecret = (secrets: string, env: EnvName): [EnvName, string, Maybe<{ [h: string]: string }>] => {
  const [realName, url, header] = (secrets.split(',')
    .map(line => {
      const [envName, appId, token] = line.split(':');
      return [envName, `https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions/`, { 'X-HockeyAppToken': token }];
    })
    .find(([itsName]) => itsName === env) || [env, '????']) as [EnvName, string, Maybe<{ [h: string]: string }>];

  return [env, url, header];
}
*/

const FSM_WEB_APP_ENV_HOSTS = (): [EnvName, string][] => [
  ['ET', 'https://et.coresystems.net'],
  ['QT', 'https://qt.coresystems.net'],
  ['PT', 'https://pt.coresystems.net'],
  ['SANDBOX', 'https://sb.coresystems.net'],
  ['PROD', 'https://apps.coresystems.net'],
  ['DE', 'https://de.coresystems.net'],
  ['EU', 'https://eu.coresystems.net'],
  ['CN', 'https://cn.coresystems.net'],
  ['US', 'https://us.coresystems.net'],
  ['UT', 'https://ut.coresystems.net'],
  ['PREVIEW', 'https://preview.coresystems.net']
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
  ['CDC', 'checklist-data-collector', 'WEBAPP'],
  ['SU', 'sign-up', 'WEBAPP'],
  ['STORE', 'store', 'WEBAPP_EMBBEDDED'],
  ['MAP2', 'service-map', 'WEBAPP_EMBBEDDED'],
  ['TMJ', 'time-material-journal', 'WEBAPP_EMBBEDDED']
] as [AppName, string, AppType][];

const appCollection = new AppCollection([
  /*
   keys seem outdated
   ({
     appShortName: 'ANDROID',
     githubRepoUrl: 'https://github.com/coresystemsFSM/android-coresuite',
     type: 'ANDROID' as AppType,
     envMap: [
       withSecret(Config.androidSecrets, 'ANDROID-NIGHTLY'),
       withSecret(Config.androidSecrets, 'ANDROID-BETA'),
       withSecret(Config.androidSecrets, 'ANDROID-STORE')
     ]
   } as IApplication),
    */
  ({
    appShortName: 'FACADE',
    githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
    type: 'APP_BACKEND',
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/portal'],
      ['UT', 'https://et.dev.coresuite.com/portal'],
      ['QT', 'https://qt.dev.coresuite.com/portal'],
      ['PT', 'https://pt.dev.coresuite.com/portal'],
      ['PROD', 'https://apps.coresystems.net/portal'],
      ['DE', 'https://de.coresystems.net/portal'],
      ['CN', 'https://cn.coresystems.net/portal'],
      ['EU', 'https://eu.coresystems.net/portal'],
      ['US', 'https://us.coresystems.net/portal'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/portal']
    ])
  } as IApplication),
  ({
    appShortName: 'CS',
    githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
    type: 'APP_BACKEND',
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/cs'],
      ['UT', 'https://et.dev.coresuite.com/cs'],
      ['QT', 'https://qt.dev.coresuite.com/cs'],
      ['PT', 'https://pt.dev.coresuite.com/cs'],
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
      ['UT', 'https://ut.dev.coresuite.com/mc'],
      ['QT', 'https://qt.dev.coresuite.com/mc'],
      ['PT', 'https://pt.dev.coresuite.com/mc'],
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
      ['UT', 'https://ut.dev.coresuite.com/dc'],
      ['QT', 'https://qt.dev.coresuite.com/dc'],
      ['PT', 'https://pt.dev.coresuite.com/dc'],
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
      ['ET', 'https://et.dev.coresuite.com/admin'],
      ['UT', 'https://ut.dev.coresuite.com/admin'],
      ['QT', 'https://qt.dev.coresuite.com/admin'],
      ['PT', 'https://pt.dev.coresuite.com/admin'],
      ['PROD', 'https://ds.coresuite.com/admin'],
      ['DE', 'https://de.coresuite.com/admin'],
      ['EU', 'https://eu.coresuite.com/admin'],
      ['US', 'https://us.coresuite.com/admin'],
      ['CN', 'https://cn.coresuite.cn/admin'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/admin']
    ])
  } as IApplication),
  ({
    appShortName: 'NOW',
    githubRepoUrl: 'https://github.com/coresystemsFSM/now',
    type: 'WEBAPP' as AppType,
    envMap: ([
      ['ET', 'https://et.now.gl'],
      ['QT', 'https://qt.now.gl'],
      ['PROD', 'https://now.gl']
    ])
  } as IApplication),

  ...FSM_WEB_APP_PATHS()
    .map(([appShortName, path, type]: [AppName, string, AppType]) => ({
      appShortName,
      type: type,
      githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
      envMap: FSM_WEB_APP_ENV_HOSTS()
        .filter(([env]) => env !== 'PREVIEW' as EnvName) // on preview all apps run in [WEBAPP_EMBBEDDED] mode
        .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
    })) as IApplication[],

  ...FSM_WEB_APP_PATHS()
    .map(([appShortName, path]: [AppName, string, AppType]) => ({
      appShortName,
      type: 'WEBAPP_EMBBEDDED' as AppType, // on PREVIEW all apps are WEBAPP_EMBBEDDED
      githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
      envMap: FSM_WEB_APP_ENV_HOSTS()
        .filter(([env]) => env === 'PREVIEW' as EnvName)
        .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
    })) as IApplication[]


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
