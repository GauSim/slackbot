import moment = require('moment-timezone');
import { Maybe } from './models/Maybe';
import { IEnvResponse } from './models/Environment';
import { EnvMapItem } from './models/Application';

export interface IFromatParams {
  env: EnvMapItem;
  appShortName: string;
  versions: Maybe<string>[];
  lastCommits: Maybe<string>[];
  githubRepoUrl: Maybe<string>;
  buildTimestamps: Maybe<string | moment.Moment>[];
  deployedTimestamp: Maybe<string | moment.Moment>;
  diffingHash: string;
}

export class Format {

  public static readonly UNKNOWN = 'UNKNOWN';

  public date(verb: string, stamp?: null | string | moment.Moment): string {
    if (!stamp || stamp === Format.UNKNOWN) return '';

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
    if (!commit || commit === Format.UNKNOWN) return '';
    return githubRepoUrl
      ? `(<${githubRepoUrl}/commits/${commit}|${commit.substr(0, 3) + '...'}>)`
      : `(${commit.substr(0, 3)}...)`;
  }


  public mixinResultLine(response: IFromatParams): IEnvResponse {

    const { lastCommits, githubRepoUrl, buildTimestamps, deployedTimestamp, env, appShortName, versions } = response;
    const pretty = [
      versions
        .reduce((all, it) => it && all.indexOf(it) == -1 ? [...all, it] : all, [] as string[])
        .map(it => `*${it}*`).join(','),
      lastCommits
        .reduce((all, it) => it && all.indexOf(it) == -1 ? [...all, it] : all, [] as string[])
        .map(lastCommit => `*${this.commit(githubRepoUrl, lastCommit)}*`).join(','),
      buildTimestamps.map(it => this.date('build', it)).join(','),
      this.date('deploy', deployedTimestamp)
    ].filter(x => !!x).join(' ');

    const [envName, url] = env;

    const resultLine = ("`" + envName + "`") + ` | <${url}|${appShortName.toUpperCase()}> → ${pretty}`;

    return { ...response, resultLine, hasError: false };
  }
}
