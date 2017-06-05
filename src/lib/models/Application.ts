import { Maybe } from './Maybe';
import { Environment, EnvFilter, EnvName } from './Environment';

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
    | 'MAP';

export type AppType = 'WEBAPP'
    | 'CLOUD'
    | 'FACADE'
    | 'ANDROID';

export interface IApplication {
    appShortName: AppName;
    githubRepoUrl: string;
    type: AppType;
    envMap: [EnvName, string][];
};

export class Application implements IApplication {
    appShortName: AppName;
    githubRepoUrl: string;
    type: AppType;
    envMap: [EnvName, string][];
    constructor(obj: IApplication) {
        this.appShortName = obj.appShortName;
        this.githubRepoUrl = obj.githubRepoUrl;
        this.type = obj.type;
        this.envMap = obj.envMap;
    }

    getVersionInfo([env, url]: [EnvName, string]): Maybe<{ url: string }> {
        switch (this.type) {
            case 'WEBAPP':
                return { url: `${url}/appconfig.json` };
            default:
                return { url }
        }
    }

    getDeploymentInfo([env, url]: [EnvName, string]): Maybe<{ url: string }> {
        switch (this.type) {
            case 'WEBAPP':
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