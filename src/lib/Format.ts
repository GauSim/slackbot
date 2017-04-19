import moment = require('moment-timezone');


interface IFromatParams {
    env: string;
    appShortName: string;
    versionInfo: { url: string };
    version: string;
    lastCommit: string;
    buildTimestamp: string | moment.Moment;
    lastModifiedTimestamp: string | moment.Moment;
    deployedTimestamp: string | moment.Moment
}

export interface IEnvResponse extends IFromatParams {
    resultLine: string;
    hasError: boolean;
}

export class Format {

    public UNKNOWN = 'UNKNOWN';

    public date(verb: string, stamp?: string | moment.Moment): string {
        if (!stamp || stamp === this.UNKNOWN) return '';

        let stampAsMoment: moment.Moment = null;

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

    public commit(commit?: string) {
        if (!commit || commit === this.UNKNOWN) return '';

        return `(<https://github.com/coresystemsFSM/portal/commits/${commit}|${commit.substr(0, 5) + '...'}>)`;
    }


    public mixinResultLine(response: IFromatParams): IEnvResponse {

        const { lastCommit, buildTimestamp, lastModifiedTimestamp, deployedTimestamp, env, versionInfo, appShortName, version } = response;

        const commitStr = this.commit(lastCommit);
        const buildStr = this.date('[build]', buildTimestamp);
        const lastModifiedStr = this.date('[last-modified]', lastModifiedTimestamp);
        const deployedStr = this.date('[deployed]', deployedTimestamp);

        const pretty = [
            version,
            commitStr,
            lastModifiedStr,
            buildStr,
            deployedStr
        ]
            .filter(x => x !== '')
            .join(' ');


        const resultLine = ("`" + env + "`") + ` | <${versionInfo.url}|${appShortName.toUpperCase()}> → ${pretty}`;

        return Object.assign({}, response, { resultLine, hasError: false });
    }
}
