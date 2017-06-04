import Config from '../config';
import { Android } from './Android';
import { AppList, IApp, App, AppShortName } from './AppList';
import { Maybe } from "../models/Maybe";

type EnvFilter = (env: string) => boolean;

export interface IRequestOptions {
    url: string;
    headers?: { [h: string]: string }
}

export interface IEnv {
    env: string;
    appShortName: AppShortName;
    versionInfo: IRequestOptions;
    deploymentInfo: Maybe<IRequestOptions>;
    githubRepoUrl: string;
}

const FSM_GITHUB_REPO_URL = 'https://github.com/coresystemsFSM/portal';
const appList = new AppList([
    {
        appShortName: 'FACADE',
        githubRepoUrl: FSM_GITHUB_REPO_URL,
        type: null,
        envMap: {
            'ET': 'https://et.dev.coresuite.com/portal/status',
            'UT': 'https://et.dev.coresuite.com/portal/status',
            'QT': 'https://qt.dev.coresuite.com/portal/status',
            'PT': 'https://pt.dev.coresuite.com/portal/status',
            'PROD': 'https://apps.coresystems.net/portal/status',
            'DE': 'https://de.coresystems.net/portal/status',
            'CN': 'https://cn.coresystems.net/portal/status',
            'EU': 'https://eu.coresystems.net/portal/status',
            'US': 'https://us.coresystems.net/portal/status',
            'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net/portal/status',
            'PROD-QA-US': 'https://prod-qa-us.coresystems.net/portal/status',
            'SANDBOX': 'https://sb.dev.coresuite.com/portal/status'
        }
    },
    {
        appShortName: 'DS',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: null,
        envMap: {
            'PROD': 'https://ds.coresuite.com/ds/status',
            'EU': 'https://eu.coresuite.com/ds/status'
        }
    },
    {
        appShortName: 'MC',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: null,
        envMap: {
            'ET': 'https://et.dev.coresuite.com/mc/status',
            'UT': 'https://ut.dev.coresuite.com/mc/status',
            'QT': 'https://qt.dev.coresuite.com/mc/status',
            'PT': 'https://pt.dev.coresuite.com/mc/status',
            'PROD': 'https://ds.coresuite.com/mc/status',
            'DE': 'https://de.coresuite.com/mc/status',
            'EU': 'https://eu.coresuite.com/mc/status',
            'US': 'https://us.coresuite.com/mc/status',
            'CN': 'https://cn.coresuite.com/mc/status',
            'SANDBOX': 'https://sb.dev.coresuite.com/mc/status'
        }
    },
    {
        appShortName: 'DC',
        githubRepoUrl: 'https://github.com/coresystemsFSM/cloud',
        type: null,
        envMap: {
            'ET': 'https://et.dev.coresuite.com/dc/status',
            'UT': 'https://ut.dev.coresuite.com/dc/status',
            'QT': 'https://qt.dev.coresuite.com/dc/status',
            'PT': 'https://pt.dev.coresuite.com/dc/status',
            'PROD': 'https://ds.coresuite.com/dc/status',
            'DE': 'https://de.coresuite.com/dc/status',
            'EU': 'https://eu.coresuite.com/dc/status',
            'US': 'https://us.coresuite.com/dc/status',
            'CN': 'https://cn.coresuite.com/dc/status',
            'SANDBOX': 'https://sb.dev.coresuite.com/dc/status'
        }
    },
    {
        appShortName: 'ADMIN',
        githubRepoUrl: 'https://github.com/coresystemsFSM/admin',
        type: null,
        envMap: {
            'ET': 'https://et.coresystems.net/admin/status',
            'UT': 'https://ut.coresystems.net/admin/status',
            'QT': 'https://qt.coresystems.net/admin/status',
            'PT': 'https://pt.coresystems.net/admin/status',
            'PROD': 'https://apps.coresystems.net/admin/status',
            'DE': 'https://de.coresystems.net/admin/status',
            'EU': 'https://eu.coresystems.net/admin/status',
            'US': 'https://us.coresystems.net/admin/status',
            'CN': 'https://cn.coresystems.net/admin/status',
            'SANDBOX': 'https://sb.coresystems.net/admin/status',
        }
    },
    {
        appShortName: 'NOW',
        githubRepoUrl: 'https://github.com/coresystemsFSM/now',
        type: 'WEBAPP',
        envMap: {
            'ET': 'https://et.now.gl',
            'QT': 'https://qt.now.gl',
            'PROD': 'https://now.gl'
        }
    },
    ...(() => {
        const FSM_WEB_APPS = {
            'WFM': 'workforce-management',
            'AR': 'analytics-reporting',
            'MDM': 'master-data-management',
            'KM': 'knowledge-management',
            'SM': 'system-monitoring',
            'PM': 'project-management',
            'DL': 'dataloader',
            'CO': 'configuration',
            'MAP': 'map'
        }
        const ENV_FSM_WEB_SERVERS = {
            'ET': 'https://et.coresystems.net',
            'QT': 'https://qt.coresystems.net',
            'PT': 'https://pt.coresystems.net',
            'SANDBOX': 'https://sb.coresystems.net',
            'PROD': 'https://apps.coresystems.net',
            'DE': 'https://de.coresystems.net',
            'EU': 'https://eu.coresystems.net',
            'CN': 'https://cn.coresystems.net',
            'US': 'https://us.coresystems.net',
            'UT': 'https://ut.coresystems.net',
            'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net',
            'PROD-QA-US': 'https://prod-qa-us.coresystems.net'
        }
        return Object.keys(FSM_WEB_APPS).map(appShortName => ({
            appShortName,
            envMap: Object.keys(ENV_FSM_WEB_SERVERS).reduce((_envMap, envName) => {
                _envMap[envName] = `${ENV_FSM_WEB_SERVERS[envName]}/${FSM_WEB_APPS[appShortName]}`;
                return _envMap;
            }, {}),
            githubRepoUrl: FSM_GITHUB_REPO_URL,
            type: 'WEBAPP'
        }));
    })()
] as IApp[]);


export class Repository {

    public static get DEFAULT_ENVIRONMENTS() {

        const DEFAULT_ENVIRONMENTS = [
            'ET',
            'QT',
            'PT',
            'PROD',
            'SANDBOX',
            Android.ENV_NAME,
        ].filter(e => appList.getAllEnv().indexOf(e) !== -1);


        return DEFAULT_ENVIRONMENTS;
    };

    public static fsm(envFilter: EnvFilter): IEnv[] {
        return appList.getApps(['WFM', 'AR', 'MDM', 'KM', 'SM', 'PM', 'DL', 'CO', 'MAP'])
            .reduce((list, it) => ([...list, ...this.select(it, envFilter)]), [] as IEnv[]);
    }

    private static select(app: Maybe<App>, envFilter: EnvFilter): IEnv[] {
        return app
            ? Object.keys(app.envMap)
                .filter(envFilter)
                .map(env => ({
                    env,
                    appShortName: app.appShortName,
                    githubRepoUrl: app.githubRepoUrl,
                    versionInfo: app.getVersionInfo(env),
                    deploymentInfo: app.getDeploymentInfo(env)
                } as IEnv))
            : [];
    }

    public static now(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('NOW'), envFilter);
    }

    public static mc(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('MC'), envFilter);
    }

    public static dc(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('DC'), envFilter);
    }

    public static ds(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('DS'), envFilter);
    }

    public static admin(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('ADMIN'), envFilter);
    }

    public static facade(envFilter: EnvFilter): IEnv[] {
        return this.select(appList.getApp('FACADE'), envFilter);
    }

    public static android(envFilter: EnvFilter): IEnv[] {
        return ((envFilter(Android.ENV_NAME) || envFilter('mobile'))
            ? [
                Android.getEnv(Config, 'nightly'),
                Android.getEnv(Config, 'beta'),
                Android.getEnv(Config, 'store'),
                Android.getEnv(Config, 'iron'),
                Android.getEnv(Config, 'tosca')
            ].filter(it => !!it)
            : []) as IEnv[];
    }

    public static getEnvsFromTextInputString(envInputString: string) {
        return envInputString
            ? envInputString === 'ALL'
                ? appList.getAllEnv()
                : (envInputString.indexOf(',') > 1
                    ? envInputString.split(',')
                    : envInputString.split(' '))
                    .map(it => it.trim())
                    .filter(it => !!it && appList.getAllEnv().map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1)
            : this.DEFAULT_ENVIRONMENTS;
    }
}