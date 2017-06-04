import { Maybe } from "../models/Maybe";
import { Android } from './Android';

export type AppShortName = 'FACADE'
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

export type AppType = 'WEBAPP' | null;

export interface IApp {
    appShortName: AppShortName;
    githubRepoUrl: string;
    type: AppType;
    envMap: { [envName: string]: string }
};

export class App implements IApp {
    appShortName: AppShortName;
    githubRepoUrl: string;
    type: AppType;
    envMap: { [envName: string]: string }
    constructor(obj: IApp) {
        this.appShortName = obj.appShortName;
        this.githubRepoUrl = obj.githubRepoUrl;
        this.type = obj.type;
        this.envMap = obj.envMap;
    }

    getVersionInfo(env: string): Maybe<{ url: string }> {
        if (!this.envMap[env]) {
            return null;
        }
        switch (this.type) {
            case 'WEBAPP':
                return { url: `${this.envMap[env]}/appconfig.json` };
            default:
                return { url: this.envMap[env] }
        }
    }
    getDeploymentInfo(env: string): Maybe<{ url: string }> {
        if (!this.envMap[env]) {
            return null;
        }
        switch (this.type) {
            case 'WEBAPP':
                return { url: `${this.envMap[env]}/deployed.json` };
            default:
                return null;
        }
    }
}

export class AppList {

    private list: App[];

    constructor(list: IApp[]) {
        this.list = list.map(it => new App(it));
    }

    public getAll(): App[] {
        return this.list;
    }

    public getApp(appShortName: AppShortName): Maybe<App> {
        return this.list.find(it => it.appShortName === appShortName);
    }

    public getApps(appShortNames: AppShortName[]): Maybe<App>[] {
        return this.list.filter(it => appShortNames.indexOf(it.appShortName) !== -1);
    }

    public getEnvMapOf(app: Maybe<App>) {
        return app
            ? app.envMap
            : {};
    }

    public getByType(type: AppType): Maybe<App>[] {
        return this.getAll().filter(it => it.type === type);
    }

    public getAllEnv(): string[] {
        const result: string[] = [];
        this.getAll()
            .map(it => this.getEnvMapOf(it))
            .forEach((envMapOfIt) => {
                Object.keys(envMapOfIt).forEach(it => {
                    if (result.indexOf(it) === -1) {
                        result.push(it);
                    }
                });
            });
        return result;
    }
}