import moment = require('moment-timezone');
import { Maybe } from './models/Maybe';
import { IEnvResponse, EnvName } from './models/Environment';

export interface IFromatParams {
    env: [EnvName, string, Maybe<{ [key: string]: string }>];
    appShortName: string;
    version: Maybe<string>;
    lastCommit: Maybe<string>;
    githubRepoUrl: Maybe<string>;
    buildTimestamp: Maybe<string | moment.Moment>;
    lastModifiedTimestamp: Maybe<string | moment.Moment>;
    deployedTimestamp: Maybe<string | moment.Moment>;
    diffingHash: string;
}

export class Format {

    public UNKNOWN = 'UNKNOWN';

    public date(verb: string, stamp?: null | string | moment.Moment): string {
        if (!stamp || stamp === this.UNKNOWN) return '';

        let stampAsMoment: moment.Moment | null = null;

        if (moment.isMoment(stamp)) {

            stampAsMoment = stamp;

        } else {

            stampAsMoment = moment.utc(new Date(stamp).toISOString());

            // hack, 2016-12-30T21:03:51.813Z => missing offset, adding 1 hour :) 
            if (stamp.indexOf('Z') > -1) {
                stampAsMoment = stampAsMoment.add(1, 'hours');
            }

        }

        const now = moment(new Date().toISOString()); //todays date        
        const duration = moment.duration(now.diff(stampAsMoment));
        const days = duration.asDays();

        const dateString = days <= 1 ? stampAsMoment.utc().fromNow() : stampAsMoment.utc().format('DD.MM h:mm');

        return `${verb}: ${dateString}`;
    }

    public commit(githubRepoUrl: Maybe<string>, commit: Maybe<string>): string {
        if (!commit || commit === this.UNKNOWN) return '';
        return githubRepoUrl
            ? `(<${githubRepoUrl}/commits/${commit}|${commit.substr(0, 5) + '...'}>)`
            : commit.substr(0, 5) + '...';
    }


    public mixinResultLine(response: IFromatParams): IEnvResponse {

        const { lastCommit, githubRepoUrl, buildTimestamp, lastModifiedTimestamp, deployedTimestamp, env, appShortName, version } = response;

        const pretty = [
            `*${version}*`,
            `*${this.commit(githubRepoUrl, lastCommit)}*`,
            this.date('[last-modified]', lastModifiedTimestamp),
            this.date('build', buildTimestamp),
            this.date('deployed', deployedTimestamp)
        ]
            .filter(x => !!x && x !== '')
            .join(' ');

        const [envName, url] = env;

        const resultLine = ("`" + envName + "`") + ` | <${url}|${appShortName.toUpperCase()}> → ${pretty}`;

        return Object.assign({}, response, { resultLine, hasError: false });
    }
}
