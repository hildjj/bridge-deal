import {default as assert, equal, throws} from 'node:assert/strict';
import {parse} from '../docs/js/deal.js';
import snap from 'snappy-snaps';
import {test} from 'node:test';

async function snapParse(src) {
  try {
    const filter = parse(src, {
      grammarSource: import.meta.url,
    });
    const expected = await snap(src.replaceAll('\r', ''), filter);
    equal(filter, expected);
  } catch (e) {
    if (e.format) {
      e.message = e.format([{source: import.meta.url, text: src}]);
    }
    throw e;
  }
}

test('parse', async() => {
  for (const src of [
    'dealer north',
    'dealer south',
    'dealer eAst',
    'dealer west',
    'dealer n',
    'dealer s',
    'dealer e',
    'dealer W',
    'vuln all',
    'vuln BOTH',
    'vuln ns',
    'vuln ew',
    'vuln none',
    'vuln neither',
    'vuln random',
    'north',
    'south',
    'east',
    'west',
    'n',
    's',
    'e',
    'w',
    'north\n$suit = S',
    'south\n%points = 4, 3, 2, 1',
    'bid P',
    'bid 1C!: 16+, artificial',
    'north\n  !22-23, balanced',
    'north\n  !22-23, balanced5',
    'north\n  13-15',
    'north\n  13+',
    'north\n  13',
    'north\n  4CD',
    'north\n  4HS',
    'north\n  4+M',
    'north\n  <6r',
    'north\n  <=6p',
    'north\n  4-6S',
    'north\n  4X',
    'north\n  4m',
    'north\n  S > H',
    'north\n  S = H',
    'north\n  %POINTS = 4, 3, 2, 1\n  S%POINTS > 3',
    'north\n  4441',
    'north\n  any 4441',
    'north\r\n  CAK',
    'north\n  $𞋄 = H',
    'north\n  !!11-13\n  4D',
  ]) {
    await snapParse(src);
  }

  assert(parse('', {startRule: 'commands'}));
  assert(parse('', {peg$library: true}));
});

test('parse errors', () => {
  try {
    parse('foo', {
      grammarSource: 'testing',
    });
  } catch (er) {
    equal(typeof er.format, 'function');
    snap('format error', er.format([{
      source: 'testing',
      text: 'foo',
    }]));
  }
  for (const src of [
    'foo',
    'north\n  C%foo = 2',
    'north\n  $',
    'north\n  $}',
    'north\n  $} = S',
    'north\n  $a} = S',
    'north\n  $a\ud800 = S',
    'north ',
  ]) {
    throws(() => parse(src));
  }

  throws(() => parse('', {startRule: 'ref'}));
  throws(() => parse('', {startRule: 'BAD RULE NAME'}));
});
