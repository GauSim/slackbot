import { Android } from './Android';
import Config from '../config';
type EnvFilter = (env: string) => boolean;


interface IApp {
    appShortName: string;
    type: string | null;
    envMap: { [envName: string]: string }
};


const FRONTEND_APPS = {
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

const ENV_FRONTENDS = {
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

const ADMIN: IApp = {
    appShortName: 'Admin',
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
};
const DC: IApp = {
    appShortName: 'DC',
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
}

const MC: IApp = {
    appShortName: 'MC',
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
};

const DS: IApp = {
    appShortName: 'DS',
    type: null,
    envMap: {
        'PROD': 'https://ds.coresuite.com/ds/status',
        'EU': 'https://eu.coresuite.com/ds/status'
    }
};

const FACADE: IApp = {
    appShortName: 'FACADE',
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
}
export interface IRequestOptions {
    url: string;
    headers?: { [h: string]: string }
}
export interface IEnv {
    env: string;
    appShortName: string;
    versionInfo: IRequestOptions;
    deploymentInfo: IRequestOptions | null;
}




export class Repository {

    public static get ALL_KNOWN_ENVIRONMENTS(): string[] {
        const ALL_KNOWN_ENVIRONMENTS = [];
        [
            ...Object.keys(ENV_FRONTENDS),
            ...Object.keys(FACADE.envMap),
            ...Object.keys(DC.envMap),
            ...Object.keys(ADMIN.envMap),
            ...Object.keys(DS.envMap),
            ...Object.keys(Android.ENV_NAME),
            'mobile'
        ].forEach(env => {
            ALL_KNOWN_ENVIRONMENTS.indexOf(env as never) === -1
                ? ALL_KNOWN_ENVIRONMENTS.push(env as never)
                : void 0;
        });

        return ALL_KNOWN_ENVIRONMENTS;
    };
    public static get DEFAULT_ENVIRONMENTS() {

        const DEFAULT_ENVIRONMENTS = [
            'ET',
            'QT',
            'PT',
            'PROD',
            'SANDBOX',
            Android.ENV_NAME,
        ].filter(e => this.ALL_KNOWN_ENVIRONMENTS.indexOf(e) !== -1);


        return DEFAULT_ENVIRONMENTS;
    };

    public static webApps(envFilter: EnvFilter): IEnv[] {

        const VERSION_FILE = 'appconfig.json';
        const DEPLOY_FILE = 'deployed.json';

        const result = [] as IEnv[];

        Object.keys(ENV_FRONTENDS)
            .filter(envFilter)
            .map(env => {

                Object.keys(FRONTEND_APPS).map(appShortName => {
                    const versionFileUrl = `${ENV_FRONTENDS[env]}/${FRONTEND_APPS[appShortName]}/${VERSION_FILE}`;
                    const deploymentFileUrl = `${ENV_FRONTENDS[env]}/${FRONTEND_APPS[appShortName]}/${DEPLOY_FILE}`;
                    result.push({
                        env,
                        appShortName,
                        versionInfo: { url: versionFileUrl },
                        deploymentInfo: { url: deploymentFileUrl }
                    })
                });

            });

        return result;
    }


    private static select(it: IApp, envFilter: EnvFilter): IEnv[] {
        return Object.keys(it.envMap)
            .filter(envFilter)
            .map(env => ({
                env,
                appShortName: it.appShortName,
                versionInfo: { url: it.envMap[env] },
                deploymentInfo: null,
            }));
    }

    public static mc(envFilter: EnvFilter): IEnv[] {
        return this.select(MC, envFilter);
    }

    public static dc(envFilter: EnvFilter): IEnv[] {
        return this.select(DC, envFilter);
    }

    public static ds(envFilter: EnvFilter): IEnv[] {
        return this.select(DS, envFilter);
    }

    public static admin(envFilter: EnvFilter): IEnv[] {
        return this.select(ADMIN, envFilter);
    }

    public static facade(envFilter: EnvFilter): IEnv[] {
        return this.select(FACADE, envFilter);
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
                ? this.ALL_KNOWN_ENVIRONMENTS
                : (envInputString.indexOf(',') > 1
                    ? envInputString.split(',')
                    : envInputString.split(' '))
                    .map(it => it.trim())
                    .filter(it => !!it && this.ALL_KNOWN_ENVIRONMENTS.map(e => e.toLowerCase()).indexOf(it.toLowerCase()) > -1)
            : this.DEFAULT_ENVIRONMENTS;
    }
}