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
  | 'MAP2'
  | 'STORE'
  | 'ANDROID'
  | 'CS'
  | 'TMJ';

export type AppType = 'WEBAPP'
  | 'WEBAPP_EMBBEDDED'
  | 'CLOUD'
  | 'APP_BACKEND'
  | 'ANDROID';


export type EnvMapItem = [EnvName, string] | [EnvName, string, Maybe<{ [key: string]: string }>];

export type IApplication = {
  appShortName: AppName;
  githubRepoUrl: string;
  type: AppType;
  envMap: EnvMapItem[];
};

export class Application implements IApplication {
  appShortName: AppName;
  githubRepoUrl: string;
  type: AppType;
  envMap: EnvMapItem[];
  constructor(obj: IApplication) {
    this.appShortName = obj.appShortName;
    this.githubRepoUrl = obj.githubRepoUrl;
    this.type = obj.type;
    this.envMap = obj.envMap;
  }

  getRealTimeInfo([_, url]: [EnvName, string, Maybe<{ [key: string]: string }>]): Maybe<IRequestOptions> {

    const cloudHost = '### cloudHost ###';
    const formattedAuthToken = '### token ###';
    const accountName = '### account ###';
    const userAccountName = '### user ###';
    const selectedCompanyName = '### company ###';
    const clientIdentifier = 'eybot';
    const clientVersion = '0.0.1';

    const token = Buffer.from(`account=${accountName}`
      + `&user=${userAccountName}`
      + `&company=${selectedCompanyName}`
      + `&clientIdentifier=${clientIdentifier}`
      + `&clientVersion=${clientVersion}`
      + `&cloudHost=${cloudHost}`
      + `&authorization=${formattedAuthToken}`).toString('base64');

    switch (this.type) {
      case 'APP_BACKEND':
        return { url, token }
      case 'WEBAPP_EMBBEDDED':
        return { url, token }
      default:
        return null;
    }
  }

  getVersionInfo(env: EnvMapItem): [IRequestOptions, Maybe<IRequestOptions>] {
    const [, url, headers] = env as [EnvName, string, Maybe<{ [key: string]: string }>];
    switch (this.type) {
      case 'WEBAPP':
        return [{ url: `${url}/appconfig.json` }, null];
      case 'WEBAPP_EMBBEDDED':
        return [{ url: `${url}/appconfig.json` }, { url: `${url}/portal/status` }];
      case 'ANDROID':
        return [{ url, headers }, null];
      case 'APP_BACKEND':
      case 'CLOUD':
        return [{ url: `${url}/status` }, null];
      default:
        return [{ url }, null];
    }
  }

  getDeploymentInfo([_, url]: EnvMapItem): Maybe<IRequestOptions> {
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