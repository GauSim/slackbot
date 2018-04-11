import { Application, IApplication, EnvMapItem } from './Application';
import { Maybe } from './Maybe';
import { IFromatParams, Format } from '../Format';

export type EnvName = 'ALL'
  | 'ET'
  | 'UT'
  | 'QT'
  | 'PT'
  | 'PROD'
  | 'DE'
  | 'CN'
  | 'EU'
  | 'US'
  | 'SANDBOX';


export type EnvFilter = (env: Environment) => boolean;

export interface IRequestOptions {
  url: string;
  headers?: Maybe<{ [h: string]: string }>;
  token?: Maybe<string>;
}

export interface IEnvResponse extends IFromatParams {
  resultLine: string;
  hasError: boolean;
}

export type httpMiddleWare = (opt: Maybe<IRequestOptions>) => Promise<string>;

export interface IEnvironment {
  env: EnvMapItem;
  app: IApplication
}

export class Environment implements IEnvironment {
  constructor(
    public env: EnvMapItem,
    public app: Application
  ) {
  }

  public getStatus(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    switch (this.app.type) {
      case 'WEBAPP':
        return this.fromWebAppFetcher(get, format);
      case 'WEBAPP_EMBBEDDED':
        return this.fromEmbeddedWebAppFetcher(get, format);
      case 'APP_BACKEND':
        return this.fromAppBackendAppFetcher(get, format);
      case 'CLOUD':
        return this.fromCloudAppFetcher(get, format);
      case 'ANDROID':
        return this.fromAndroidAppFetcher(get, format);
      default:
        return Promise.reject(new Error(`appType:${this.app.type} has no mapper`));
    }
  }


  private fromEmbeddedWebAppFetcher(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    const { appShortName, githubRepoUrl } = this.app;
    const [frontEndVersionInfo, backEndVersionInfo] = this.app.getVersionInfo(this.env)
    return Promise
      .all([
        get(frontEndVersionInfo)
          .then(it => JSON.parse(it) as Partial<{ lastCommit: string; buildTimestamp: string; appConfig: { version: string; } }>),
        get(backEndVersionInfo)
          .then(rawBody => JSON.parse(rawBody) as Partial<{ lastCommit: string; buildTimestamp: string; deployTimestamp: string, version: string, serviceName: string }>)
      ])
      .then(([frontEnd, backEnd]) => {

        const frontEndVersion = frontEnd.appConfig ? frontEnd.appConfig.version : Format.UNKNOWN;

        return format.mixinResultLine({
          env: this.env,
          appShortName,
          githubRepoUrl,
          lastCommits: [frontEnd.lastCommit, backEnd.lastCommit],
          buildTimestamps: [frontEnd.buildTimestamp, backEnd.buildTimestamp],
          versions: [frontEndVersion, backEnd.version],
          deployedTimestamp: backEnd.deployTimestamp,
          diffingHash: `${appShortName}-${frontEndVersion}-${frontEnd.lastCommit}-${backEnd.version}-${backEnd.lastCommit}`
        })
      }
      );
  }

  private fromWebAppFetcher(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    const { appShortName, githubRepoUrl } = this.app;
    const [versionInfo] = this.app.getVersionInfo(this.env)
    const deploymentInfo = this.app.getDeploymentInfo(this.env);
    return Promise
      .all([
        get(versionInfo)
          .then(it => JSON.parse(it) as { lastCommit: string; buildTimestamp: string; appConfig: { version: string; } }),
        (deploymentInfo
          ? get(deploymentInfo).then(it => JSON.parse(it))
            .catch(_ => ({ timestamp: null })) // catch 404, and redirects on deploy file.
          : Promise.resolve(({ timestamp: null }))) as Promise<{ timestamp: null | string }>
      ])
      .then(([{ lastCommit, buildTimestamp, appConfig }, { timestamp }]) => format.mixinResultLine({
        env: this.env,
        appShortName,
        githubRepoUrl,
        lastCommits: [lastCommit],
        buildTimestamps: [buildTimestamp],
        versions: [appConfig.version],
        deployedTimestamp: timestamp,
        diffingHash: `${appShortName}-${appConfig.version}-${lastCommit}`
      }));
  }

  private fromCloudAppFetcher(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    const { appShortName, githubRepoUrl } = this.app;
    const [versionInfo] = this.app.getVersionInfo(this.env);
    return get(versionInfo)
      .then(rawBody => {

        let version = null as null | string;
        const exp = new RegExp(/\w+ (\d+\.\d+\.\d+)\+<[^>]+>(\d+)<[^>]+>/);
        if (exp.test(rawBody)) {
          const matches = exp.exec(rawBody);
          version = matches && matches[1] && matches[2] ? matches[1] + '+' + matches[2] : version;
        }

        return format.mixinResultLine({
          env: this.env,
          appShortName,
          githubRepoUrl,
          versions: [version],
          lastCommits: [],
          buildTimestamps: [],
          deployedTimestamp: null,
          diffingHash: `${appShortName}-${version}`
        });
      });
  }

  private fromAppBackendAppFetcher(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    const { appShortName, githubRepoUrl } = this.app;
    const [versionInfo] = this.app.getVersionInfo(this.env)
    return get(versionInfo)
      .then(rawBody => JSON.parse(rawBody) as { lastCommit: string; buildTimestamp: string; deployTimestamp: string, version: string })
      .then(({ lastCommit, version, buildTimestamp, deployTimestamp }) => format.mixinResultLine({
        env: this.env,
        appShortName,
        githubRepoUrl,
        versions: [version],
        lastCommits: [lastCommit],
        buildTimestamps: [buildTimestamp],
        deployedTimestamp: deployTimestamp,
        diffingHash: `${appShortName}-${version}-${lastCommit}`
      }));
  }

  private fromAndroidAppFetcher(get: httpMiddleWare, format: Format): Promise<IEnvResponse> {
    const { appShortName, githubRepoUrl } = this.app;
    const [versionInfo] = this.app.getVersionInfo(this.env)
    return get(versionInfo)
      .then(rawBody => {

        const [it] = (JSON.parse(rawBody) as {
          app_versions: {
            download_url: string;
            shortversion: string;
            updated_at: string;
            notes: string;
          }[], status: 'success'
        }).app_versions;

        let lastCommit = null as Maybe<string>;

        const exp = new RegExp(/\b([a-f0-9]{40})\b/);
        if (exp.test(it.notes)) {
          const matches = exp.exec(it.notes);
          lastCommit = matches && matches[0] ? matches[0] : lastCommit;
        }

        return format.mixinResultLine({
          env: this.env,
          appShortName,
          lastCommits: [lastCommit],
          githubRepoUrl,
          versions: [it.shortversion],
          buildTimestamps: [],
          deployedTimestamp: it.updated_at,
          diffingHash: `${appShortName}-${it.shortversion}-${lastCommit ? lastCommit : ''}`
        });
      });
  }

}
