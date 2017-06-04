import { IEnv } from './Repository'
import { Config } from '../config';
import { Maybe } from "../models/Maybe";

export type androidVersion = 'nightly'
    | 'beta'
    | 'store'
    | 'iron'
    | 'tosca';

type androidSecret = [string | null, string | null];  // tuple of appKey,ApiToken


export class Android {

    public static readonly ENV_NAME = 'ANDROID';

    public static getSecret(config: Config, version: androidVersion) {


        let androidSecretMap: { [env: string]: androidSecret } = {};
        try {
            androidSecretMap
                = JSON.parse(config.androidSecretMap);
        } catch (ex) {
            console.error(ex);
            androidSecretMap = {
                nightly: [null, null],
                beta: [null, null],
                store: [null, null],
                iron: [null, null],
                tosca: [null, null]
            }
        }


        return (androidSecretMap[version] || [null, null]) as androidSecret;
    }
    public static getEnv(config: Config, appShortName: androidVersion): Maybe<IEnv> {
       return null;
       /* const [appId, token] = this.getSecret(config, appShortName);
        if (!appId || !token) {
            return null
        }
        return {
            appShortName,
            env: Android.ENV_NAME,
            githubRepoUrl: 'https://github.com/coresystemsFSM/android-coresuite',
            versionInfo: {
                url: `https://rink.hockeyapp.net/api/2/apps/${appId}/app_versions/`,
                headers: {
                    'X-HockeyAppToken': token
                }
            },
            deploymentInfo: null,
        }
        */
    }
}