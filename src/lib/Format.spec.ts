import assert = require('assert');
import { Format, IFromatParams } from './Format';
import { EnvName, Environment } from './models/Environment';
import { Repository } from './env/Repository';

const RANDOM_COMMIT_HASH = '0eefb30189d7295dd071c369f06eafa3205ee955';
const RANDOM_URL = 'https://example.com';
const RANDOM_VERSION = '1.2.3';

describe('whats-online.spec.ts', () => {

  describe('#commit', () => {
    it('should format commits', () => {
      const githubRepoUrl = RANDOM_URL;
      const commitHash = RANDOM_COMMIT_HASH;

      const result = new Format().commit(githubRepoUrl, commitHash);
      assert.deepEqual(result, '(<https://example.com/commits/0eefb30189d7295dd071c369f06eafa3205ee955|0eefb...>)');
    });

    it('should deal with [null] commits', () => {
      const githubRepoUrl = RANDOM_URL;
      const commitHash = null;

      const result = new Format().commit(githubRepoUrl, commitHash);
      assert.deepEqual(result, '');
    });

    it('shuld deal with [UNKNOWN] commits', () => {
      const githubRepoUrl = RANDOM_URL;
      const commitHash = Format.UNKNOWN;

      const result = new Format().commit(githubRepoUrl, commitHash);
      assert.deepEqual(result, '');
    });

    it('shuld deal with missing [githubRepoUrl]', () => {
      const githubRepoUrl = ''
      const commitHash = RANDOM_COMMIT_HASH;

      const result = new Format().commit(githubRepoUrl, commitHash);
      assert.deepEqual(result, '(0eefb...)');
    });
  })

  describe('#mixinResultLine', () => {

    const mockFromatParams = (it: Environment): IFromatParams => {
      return {
        env: it.env,
        appShortName: it.app.appShortName,
        githubRepoUrl: it.app.githubRepoUrl,
        lastCommits: [RANDOM_COMMIT_HASH, RANDOM_COMMIT_HASH],
        buildTimestamps: [],
        versions: ['version1', 'version2'],
        deployedTimestamp: null,
        diffingHash: `${it.app.appShortName}-${RANDOM_VERSION}`
      }
    }

    it('should format the resultLine', () => {

      Repository.filter(_ => true).forEach(it => {
        const params = mockFromatParams(it);
        const result = new Format().mixinResultLine(params);

        assert.deepEqual(result.hasError, false);

        assert(result.resultLine.indexOf(it.app.githubRepoUrl) !== -1);
        assert(result.resultLine.indexOf(it.app.appShortName) !== -1);

        params.lastCommits.forEach((commit: string) => {
          assert(result.resultLine.indexOf(commit) !== -1);
        });

        params.versions.forEach((version: string) => {
          assert(result.resultLine.indexOf(version) !== -1);
        });

      });

    });
  });

});