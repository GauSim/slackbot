import { Maybe } from '../models/Maybe';
import { Android } from './Android';
import { Application, IApplication, AppName, AppType } from "../models/Application";
import { EnvName } from '../models/Environment';


export class AppCollection {

    private list: Application[];

    constructor(list: IApplication[]) {
        this.list = list.map(it => new Application(it));
    }

    public get all(): Application[] {
        return this.list;
    }

    public getApp(appShortName: AppName): Maybe<Application> {
        return this.all.find(it => it.appShortName === appShortName);
    }

    public getApps(appShortNames: AppName[]): Application[] {
        return this.all.filter(it => appShortNames.indexOf(it.appShortName) !== -1);
    }

    public getByType(type: AppType): Maybe<Application>[] {
        return this.all.filter(it => it.type === type);
    }

    public getAllAppNames(): AppName[] {
        return this.all.map(it => it.appShortName);
    }

    public getAllEnvNames(): EnvName[] {
        const result: EnvName[] = [];
        this.all.forEach(app => app.envMap.map(([envName, url]) => {
            if (result.indexOf(envName) === -1) {
                result.push(envName);
            }
        }));
        return result;
    }

    public getDefaultEnvNames() {
        return [
            'ET',
            'QT',
            'PT',
            'PROD',
            'SANDBOX'
        ].filter(e => this.getAllEnvNames().indexOf(e) !== -1);
    };
}