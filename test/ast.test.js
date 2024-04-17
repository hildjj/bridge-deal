import {Direction, Vuln} from '../docs/js/card.js';
import {default as assert, equal, throws} from 'node:assert';
import {DealRules} from '../docs/js/ast.js';
import snap from 'snappy-snaps';
import {test} from 'node:test';

test('DealRules', async() => {
  const d = new DealRules();
  assert(d);
  throws(() => d.add('foo', 0));
  d.dealer = Direction.SOUTH;
  d.vuln = Vuln.ALL;
  d.dir = Direction.SOUTH;
  d.add({foo: 1}, 0);
  d.add({points: [4, 3, 2, 1]}, 0);
  equal(d.isVar('foo'), true);
  equal(d.isVar('bar'), false);
  d.add('dir.balancedNoM()', 1);
  d.add('dir.points === 17', 0);
  // eslint-disable-next-line no-template-curly-in-string
  d.bids.push('P: ${foo}');
  const code = d.toString();
  const expected = await snap('DealRules', code);
  equal(code, expected);
  // eslint-disable-next-line no-template-curly-in-string
  d.bids.push('P: ${bar}');
  throws(() => d.toString());
  d.bids.pop();
});
