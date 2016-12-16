const assert = require('assert');
const sinon = require('sinon');
const WhatsOnlineModul = require('./whats-online');
const WhatsOnline = WhatsOnlineModul.default;


describe('#whats-online', () => {


  describe('bot module', () => {

    it('as action', () => {
      assert(WhatsOnlineModul.action);
      assert(WhatsOnlineModul.action.triggers);
      assert(WhatsOnlineModul.action.help);
      assert(WhatsOnlineModul.action.handler);
    });

    xit('[integration] action handler calls bot back', done => {

      const mockBot = {
        reply: (message, text) => {
          // assert here 

          done();

        }
      }
      const mockMsg = 'test';

      WhatsOnlineModul.action.handler(mockBot, mockMsg);

    });
  })


  it('should perform all remote calls and return a string msg', done => {

    const expectedCallCount = 52;

    const jsonString = JSON.stringify({
      environment: '',
      appConfig: {
        title: '',
        version: ''
      }
    });
    const requestMock = sinon.stub().returns(Promise.resolve(jsonString));
    const whatsOnline = new WhatsOnline(requestMock, false);


    whatsOnline.checkAll()
      .then(resultMsg => {
        assert.equal(typeof resultMsg, 'string');
        assert.deepEqual(requestMock.callCount, expectedCallCount, `should tigger ${expectedCallCount} remote calls`);
      })
      .then(_ => done())
      .catch(done);

  });


  it('getVersionFrontend', done => {

    const response = {
      "appConfig": {
        "version": "5.40.0.67",
        "title": "Project Management",
        "clientIdentifier": "COR_FSM_PORTAL",
        "clientVersion": "COR_FSM_PROJECT_MANAGEMENT"
      },
      "environment": "et",
      "lastCommit": "078e5aa80c37cff8c82de1ab1496efd2459da225",
      "buildTimestamp": "2016-12-16T13:48:24.098Z"
    };

    const whatsOnline = new WhatsOnline(sinon.stub().returns(Promise.resolve(JSON.stringify(response))), false);

    const url = 'http://someurl.com';
    const env = `ET`;
    const app = response.appConfig.title.toUpperCase();


    const expected = '<http://someurl.com|ET> | PROJECT MANAGEMENT => <https://github.com/coresystemsFSM/portal/releases/tag/PROJECT MANAGEMENT-5.40.0.67|5.40.0.67> (<https://github.com/coresystemsFSM/portal/commit/078e5aa80c37cff8c82de1ab1496efd2459da225|view commit>)';


    whatsOnline.getVersionFrontend(env, app, url)
      .then(actual => {
        assert(actual.indexOf(expected) !== -1);
      })
      .then(() => done())
      .catch(done)

  })

});