import assert = require('assert');
import { actions } from './whats-online';


describe('whats-online.spec.ts', () => {


  describe('bot module', () => {

    it('as action', () => {
      actions.forEach(action => {
        assert(action.triggers);
        assert(action.help);
        assert(action.handler);
      });
    });

  })

});