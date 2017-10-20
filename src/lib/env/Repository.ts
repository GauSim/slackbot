import _ = require('lodash');
import Config from '../config';
import { IApplication, Application, AppName, AppType } from '../models/Application';
import { Maybe } from '../models/Maybe';
import { AppCollection } from './AppCollection';
import { EnvFilter, Environment, EnvName } from '../models/Environment';

const withSecret = (secrets: string, env: 'NIGHTLY' | 'BETA' | 'STORE', alias: EnvName): [EnvName, string, Maybe<{ [h: string]: string }>] => {
  const [realName, url, header] = (secrets.split(',')
    .map(line => {
      const [envName, appId, token] = line.split(':');
      return [envName, `https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions/`, { 'X-HockeyAppToken': token }];
    })
    .find(([itsName]) => itsName === env) || [env, '????']) as [EnvName, string, Maybe<{ [h: string]: string }>];

  return [alias, url, header];
}


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
  ['WFM', 'workforce-management', 'WEBAPP'],
  ['AR', 'analytics-reporting', 'WEBAPP'],
  ['MDM', 'master-data-management', 'WEBAPP'],
  ['KM', 'knowledge-management', 'WEBAPP'],
  ['SM', 'system-monitoring', 'WEBAPP'],
  ['PM', 'project-management', 'WEBAPP'],
  ['DL', 'dataloader', 'WEBAPP'],
  ['CO', 'configuration', 'WEBAPP'],
  ['MAP', 'map', 'WEBAPP'],
  ['MP', 'marketplace', 'WEBAPP'],
  ['CDC', 'checklist-data-collector', 'WEBAPP'],
  ['SU', 'sign-up', 'WEBAPP'],
  ['STORE', 'store', 'WEBAPP_EMBBEDDED'],
  ['MAP2', 'service-map', 'WEBAPP_EMBBEDDED']
] as [AppName, string, AppType][];

const appCollection = new AppCollection([
  {
    appShortName: 'ANDROID',
    githubRepoUrl: 'https://github.com/coresystemsFSM/android-coresuite',
    type: 'ANDROID' as AppType,
    envMap: [
      withSecret(Config.androidSecrets, 'NIGHTLY', 'ET'),
      withSecret(Config.androidSecrets, 'BETA', 'QT'),
      withSecret(Config.androidSecrets, 'STORE', 'PROD')
    ]
  },
  {
    appShortName: 'FACADE',
    githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
    type: 'FACADE' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com'],
      ['UT', 'https://et.dev.coresuite.com'],
      ['QT', 'https://qt.dev.coresuite.com'],
      ['PT', 'https://pt.dev.coresuite.com'],
      ['PROD', 'https://apps.coresystems.net'],
      ['DE', 'https://de.coresystems.net'],
      ['CN', 'https://cn.coresystems.net'],
      ['EU', 'https://eu.coresystems.net'],
      ['US', 'https://us.coresystems.net'],
      ['SANDBOX', 'https://sb.dev.coresuite.com']
    ])
  },
  {
    appShortName: 'DS',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: [
      ['PROD', 'https://ds.coresuite.com/ds/status'],
      ['EU', 'https://eu.coresuite.com/ds/status']
    ]
  },
  {
    appShortName: 'MC',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/mc/status'],
      ['UT', 'https://ut.dev.coresuite.com/mc/status'],
      ['QT', 'https://qt.dev.coresuite.com/mc/status'],
      ['PT', 'https://pt.dev.coresuite.com/mc/status'],
      ['PROD', 'https://ds.coresuite.com/mc/status'],
      ['DE', 'https://de.coresuite.com/mc/status'],
      ['EU', 'https://eu.coresuite.com/mc/status'],
      ['US', 'https://us.coresuite.com/mc/status'],
      ['CN', 'https://cn.coresuite.cn/mc/status'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/mc/status']
    ])
  },
  {
    appShortName: 'DC',
    githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/dc/status'],
      ['UT', 'https://ut.dev.coresuite.com/dc/status'],
      ['QT', 'https://qt.dev.coresuite.com/dc/status'],
      ['PT', 'https://pt.dev.coresuite.com/dc/status'],
      ['PROD', 'https://ds.coresuite.com/dc/status'],
      ['DE', 'https://de.coresuite.com/dc/status'],
      ['EU', 'https://eu.coresuite.com/dc/status'],
      ['US', 'https://us.coresuite.com/dc/status'],
      ['CN', 'https://cn.coresuite.cn/dc/status'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/dc/status']
    ] as [EnvName, string][])
  },
  {
    appShortName: 'ADMIN',
    githubRepoUrl: 'https://github.com/coresystemsFSM/admin',
    type: 'CLOUD' as AppType,
    envMap: ([
      ['ET', 'https://et.dev.coresuite.com/admin/status'],
      ['UT', 'https://ut.dev.coresuite.com/admin/status'],
      ['QT', 'https://qt.dev.coresuite.com/admin/status'],
      ['PT', 'https://pt.dev.coresuite.com/admin/status'],
      ['PROD', 'https://ds.coresuite.com/admin/status'],
      ['DE', 'https://de.coresuite.com/admin/status'],
      ['EU', 'https://eu.coresuite.com/admin/status'],
      ['US', 'https://us.coresuite.com/admin/status'],
      ['CN', 'https://cn.coresuite.cn/admin/status'],
      ['SANDBOX', 'https://sb.dev.coresuite.com/admin/status']
    ])
  },
  {
    appShortName: 'NOW',
    githubRepoUrl: 'https://github.com/coresystemsFSM/now',
    type: 'WEBAPP' as AppType,
    envMap: ([
      ['ET', 'https://et.now.gl'],
      ['QT', 'https://qt.now.gl'],
      ['PROD', 'https://now.gl']
    ])
  },
  ...FSM_WEB_APP_PATHS()
    .map(([appShortName, path, type]: [AppName, string, AppType]) => ({
      appShortName,
      type: type,
      githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
      envMap: FSM_WEB_APP_ENV_HOSTS()
        .filter(([env]) => env !== 'PREVIEW' as EnvName) // on preview all apps run in [WEBAPP_EMBBEDDED] mode
        .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
    })),

  ...FSM_WEB_APP_PATHS()
    .map(([appShortName, path, type]: [AppName, string, AppType]) => ({
      appShortName,
      type: 'WEBAPP_EMBBEDDED' as AppType, // on PREVIEW all apps are WEBAPP_EMBBEDDED
      githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
      envMap: FSM_WEB_APP_ENV_HOSTS()
        .filter(([env]) => env === 'PREVIEW' as EnvName)
        .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
    }))


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
