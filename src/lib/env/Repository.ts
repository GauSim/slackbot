import Config from '../config';
import { Android } from './Android';
import { IApplication, Application, AppName } from '../models/Application';
import { Maybe } from '../models/Maybe';
import { AppCollection } from './AppCollection';
import { EnvFilter, Environment } from '../models/Environment';

type EnvName = 'ALL'
    | 'ET'
    | 'UT'
    | 'QT'
    | 'PT'
    | 'PROD'
    | 'DE'
    | 'CN'
    | 'EU'
    | 'US'
    | 'PROD-QA-EU'
    | 'PROD-QA-US'
    | 'SANDBOX'

const FSM_GITHUB_REPO_URL = 'https://github.com/coresystemsFSM/portal';
const appCollection = new AppCollection([
    {
        appShortName: 'FACADE',
        githubRepoUrl: FSM_GITHUB_REPO_URL,
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
        ] as [EnvName, string][])
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
        ] as [EnvName, string][])
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
        ] as [EnvName, string][])
    },
    {
        appShortName: 'NOW',
        githubRepoUrl: 'https://github.com/coresystemsFSM/now',
        type: 'WEBAPP',
        envMap: ([
            ['ET', 'https://et.now.gl'],
            ['QT', 'https://qt.now.gl'],
            ['PROD', 'https://now.gl']
        ] as [EnvName, string][])
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
        ['MAP', 'map']
    ] as [AppName, string][])
        .map(([appShortName, path]) => ({
            appShortName,
            type: 'WEBAPP',
            githubRepoUrl: FSM_GITHUB_REPO_URL,
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

    public static matchEnvOrApp = (textInput?: EnvName | string, inclAppNames = true): string[] => {
        return textInput
            ? textInput === 'ALL'
                ? appCollection.getAllEnvNames()
                : (textInput.indexOf(',') > 1
                    ? textInput.split(',')
                    : textInput.split(' '))
                    .map(it => it.trim())
                    .filter(it => !!it
                        && (
                            appCollection.getAllEnvNames().map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1 // byEnvName
                            || inclAppNames && appCollection.getAllAppNames().map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1 // byAppName
                        )
                    )
            : [
                ...appCollection.getDefaultEnvNames(),
                ... (inclAppNames ? appCollection.getAllAppNames() : [])
            ];
    }
}