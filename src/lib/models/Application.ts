import { Maybe } from './Maybe';
import { Environment, EnvFilter, EnvName, IRequestOptions } from './Environment';

export type AppName = 'FACADE'
    | 'NOW'
    | 'ADMIN'
    | 'DC'
    | 'MC'
    | 'DS'
    | 'WFM'
    | 'AR'
    | 'MDM'
    | 'KM'
    | 'SM'
    | 'PM'
    | 'DL'
    | 'CO'
    | 'MAP'
    | 'STORE';

export type AppType = 'WEBAPP'
    | 'WEBAPP_EMBBEDDED'
    | 'CLOUD'
    | 'FACADE'
    | 'ANDROID';

export interface IApplication {
    appShortName: AppName;
    githubRepoUrl: string;
    type: AppType;
    envMap: [EnvName, string, Maybe<{ [key: string]: string }>][];
};

export class Application implements IApplication {
    appShortName: AppName;
    githubRepoUrl: string;
    type: AppType;
    envMap: [EnvName, string, Maybe<{ [key: string]: string }>][];
    constructor(obj: IApplication) {
        this.appShortName = obj.appShortName;
        this.githubRepoUrl = obj.githubRepoUrl;
        this.type = obj.type;
        this.envMap = obj.envMap;
    }

    getVersionInfo([env, url, headers]: [EnvName, string, Maybe<{ [key: string]: string }>]): [IRequestOptions,Maybe<IRequestOptions>] {
        switch (this.type) {
            case 'WEBAPP':
                return [{ url: `${url}/appconfig.json` }, null];
            case 'WEBAPP_EMBBEDDED':
                return [{ url: `${url}/appconfig.json` }, { url: `${url}/portal/status` }];
            case 'ANDROID':
                return [{ url, headers }, null];
            default:
                return [{ url }, null];
        }
    }

    getDeploymentInfo([env, url]: [EnvName, string, Maybe<{ [key: string]: string }>]): Maybe<IRequestOptions> {
        switch (this.type) {
            case 'WEBAPP':
            case 'WEBAPP_EMBBEDDED':
                return { url: `${url}/deployed.json` };
            default:
                return null;
        }
    }

    filterEnvironments(envFilter: EnvFilter): Environment[] {
        return this.envMap
            .map(it => new Environment(it, this))
            .filter(envFilter)
    }
}