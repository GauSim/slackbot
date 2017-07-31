import _ = require('lodash');
import Config from '../config';
import { IApplication, Application, AppName } from '../models/Application';
import { Maybe } from '../models/Maybe';
import { AppCollection } from './AppCollection';
import { EnvFilter, Environment, EnvName } from '../models/Environment';

const withSecret = (secrets: string, env: EnvName): [EnvName, string, Maybe<{ [h: string]: string }>] => {
    return (secrets.split(',')
        .map(line => {
            const [envName, appId, token] = line.split(':');
            return [envName, `https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions/`, { 'X-HockeyAppToken': token }];
        })
        .find(([itsName]) => itsName === env)
        || [env, 'https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions/']) as [EnvName, string, Maybe<{ [h: string]: string }>];
}

const appCollection = new AppCollection([
    {
        appShortName: 'ANDROID',
        githubRepoUrl: 'https://github.com/coresystemsFSM/android-coresuite',
        type: 'ANDROID',
        envMap: [
            withSecret(Config.androidSecrets, 'NIGHTLY'),
            withSecret(Config.androidSecrets, 'BETA'),
            withSecret(Config.androidSecrets, 'STORE')
        ]
    },
    {
        appShortName: 'FACADE',
        githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
        type: 'FACADE',
        envMap: ([
            ['ET', 'https://et.dev.coresuite.com/portal/status'],
            ['UT', 'https://et.dev.coresuite.com/portal/status'],
            ['QT', 'https://qt.dev.coresuite.com/portal/status'],
            ['PT', 'https://pt.dev.coresuite.com/portal/status'],
            ['PROD', 'https://apps.coresystems.net/portal/status'],
            ['DE', 'https://de.coresystems.net/portal/status'],
            ['CN', 'https://cn.coresystems.net/portal/status'],
            ['EU', 'https://eu.coresystems.net/portal/status'],
            ['US', 'https://us.coresystems.net/portal/status'],
            //  ['PROD-QA-EU', 'https://prod-qa-eu.coresystems.net/portal/status'],
            //  ['PROD-QA-US', 'https://prod-qa-us.coresystems.net/portal/status'],
            ['SANDBOX', 'https://sb.dev.coresuite.com/portal/status']
        ])
    },
    {
        appShortName: 'DS',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: 'CLOUD',
        envMap: [
            ['PROD', 'https://ds.coresuite.com/ds/status'],
            ['EU', 'https://eu.coresuite.com/ds/status']
        ]
    },
    {
        appShortName: 'MC',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: 'CLOUD',
        envMap: ([
            ['ET', 'https://et.dev.coresuite.com/mc/status'],
            ['UT', 'https://ut.dev.coresuite.com/mc/status'],
            ['QT', 'https://qt.dev.coresuite.com/mc/status'],
            ['PT', 'https://pt.dev.coresuite.com/mc/status'],
            ['PROD', 'https://ds.coresuite.com/mc/status'],
            ['DE', 'https://de.coresuite.com/mc/status'],
            ['EU', 'https://eu.coresuite.com/mc/status'],
            ['US', 'https://us.coresuite.com/mc/status'],
            ['CN', 'https://cn.coresuite.com/mc/status'],
            ['SANDBOX', 'https://sb.dev.coresuite.com/mc/status']
        ])
    },
    {
        appShortName: 'DC',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: 'CLOUD',
        envMap: ([
            ['ET', 'https://et.dev.coresuite.com/dc/status'],
            ['UT', 'https://ut.dev.coresuite.com/dc/status'],
            ['QT', 'https://qt.dev.coresuite.com/dc/status'],
            ['PT', 'https://pt.dev.coresuite.com/dc/status'],
            ['PROD', 'https://ds.coresuite.com/dc/status'],
            ['DE', 'https://de.coresuite.com/dc/status'],
            ['EU', 'https://eu.coresuite.com/dc/status'],
            ['US', 'https://us.coresuite.com/dc/status'],
            ['CN', 'https://cn.coresuite.com/dc/status'],
            ['SANDBOX', 'https://sb.dev.coresuite.com/dc/status']
        ] as [EnvName, string][])
    },
    {
        appShortName: 'ADMIN',
        githubRepoUrl: 'https://github.com/coresystemsFSM/admin',
        type: 'CLOUD',
        envMap: ([
            ['ET', 'https://et.dev.coresuite.com/admin/status'],
            ['UT', 'https://ut.dev.coresuite.com/admin/status'],
            ['QT', 'https://qt.dev.coresuite.com/admin/status'],
            ['PT', 'https://pt.dev.coresuite.com/admin/status'],
            ['PROD', 'https://ds.coresuite.com/admin/status'],
            ['DE', 'https://de.coresuite.com/admin/status'],
            ['EU', 'https://eu.coresuite.com/admin/status'],
            ['US', 'https://us.coresuite.com/admin/status'],
            ['CN', 'https://cn.coresuite.com/admin/status'],
            ['SANDBOX', 'https://sb.dev.coresuite.com/admin/status']
        ])
    },
    {
        appShortName: 'NOW',
        githubRepoUrl: 'https://github.com/coresystemsFSM/now',
        type: 'WEBAPP',
        envMap: ([
            ['ET', 'https://et.now.gl'],
            ['QT', 'https://qt.now.gl'],
            ['PROD', 'https://now.gl']
        ])
    },
    ...([
        ['WFM', 'workforce-management'],
        ['AR', 'analytics-reporting'],
        ['MDM', 'master-data-management'],
        ['KM', 'knowledge-management'],
        ['SM', 'system-monitoring'],
        ['PM', 'project-management'],
        ['DL', 'dataloader'],
        ['CO', 'configuration'],
        ['MAP', 'map'],
        ['MP', 'marketplace'],
        ['SU', 'sign-up'],
    ] as [AppName, string][])
        .map(([appShortName, path]) => ({
            appShortName,
            type: 'WEBAPP',
            githubRepoUrl: 'https://github.com/coresystemsFSM/portal',
            envMap: ([
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
                ['PREVIEW','https://preview.coresystems.net']
                // ['PROD-QA-EU', 'https://prod-qa-eu.coresystems.net'],
                // ['PROD-QA-US', 'https://prod-qa-us.coresystems.net']
            ] as [EnvName, string][])
                .reduce((list, [env, url]) => [...list, [env, `${url}/${path}`] as [EnvName, string]], [] as [EnvName, string][]),
        }))
] as IApplication[]);


export class Repository {

    public static filter(envFilter: EnvFilter): Environment[] {
        return appCollection.all.reduce((list, it) => [...list, ...it.filterEnvironments(envFilter)], [] as Environment[]);
    }

    public static isAppName = (it: string) => !!it && appCollection.getAllAppNames().map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1;

    public static matchEnvOrApp = (textInput?: EnvName | string): string[] => {
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
                    .reduce((list, it) => [...list, ...([['BETA', 'QT'], ['STORE', 'PROD'], ['NIGHTLY', 'ET']] // fill in aliases
                        .find(list => list.indexOf((it).toUpperCase()) > -1) || [it])], [] as string[])

            : allPossibleMatches;
    }
}