import {default as assert, equal, throws} from 'node:assert/strict';
import {parse} from '../docs/js/deal.js';
import snap from 'snappy-snaps';
import {test} from 'node:test';
import {testPeggy} from '@peggyjs/coverage';

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

test('peggyCoverage', async() => {
  await testPeggy(new URL('../docs/js/deal.js', import.meta.url), [
    {
      validInput: '',
      validResult: "deal.dealer = 'north';\ndeal.randVuln();\nlet dir = null;\nreturn true;\n",
      invalidInput: 'aaa',
    },
    {invalidInput: 'north\naaa'},
    {invalidInput: '/'},
    {invalidInput: 'bid:'},
    {invalidInput: 'north\nbid:'},
  ]);
});

test('parse', async() => {
  for (const src of [
    'dealer north',
    'dealer south',
    'dealer eAst',
    'dealer west',
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
    'north\nsouth // foo',
    'north\n$suit = S',
    'south\n%points = 4, 3, 2, 1',
    'bid P',
    'bid 1C!: 16+, artificial',
    'bid 1C!://\n',
    'bid 1C!:// \n',
    'bid 1C!:// ',
    'north\n  !22-23, balanced',
    'north\n  !22-23, balanced5',
    'north\n  8',
    'north\n  13-15',
    'north\n  13+',
    'north\n  13',
    'north\n  37',
    'north\n  4CD',
    'north\n  4HS',
    'north\n  4+M',
    'north\n  <6R',
    'north\n  <5r',
    'north\n  <5b',
    'north\n  <=6P',
    'north\n  4-6S',
    'north\n  4X',
    'north\n  4m',
    'north\n  S > H',
    'north\n  S >= H',
    'north\n  S = H',
    'north\n  S < H',
    'north\n  S <= H',
    'north\n  %POINTS = 40, 30, 2, 1\n  S%POINTS > 3',
    'north\n  %POINTS = 40, 30, 2, 1\n  S%POINTS > 30',
    'north\n  4441',
    'north\n  any 4441',
    'north\r\n  CAK',
    'north\n  $𞋄 = H',
    'north\n  !!11-13\n  4D',
    'north\n  void',
    'north\n  singleton',
    '',
    '\n',
    '//',
    '// ',
    '//\n',
    '//a',
    '//a\n',
    '//ab',
    '//ab\n',
    '//abc',
    '//abc\n',
    '//abcd',
    '//abcd\n',
    '//abcde',
    '//abcde\n',
    '//abcdef',
    '//abcdef\n',
    '//abcdefg',
    '//abcdefg\n',
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
    'nor',
    'north\n  C%foo = 2',
    'north\n  8,',
    'north\n  8a',
    'north\n  8-a',
    'north\n  8-9a',
    'north\n  38',
    'north\n  <',
    'north\n  <=',
    'north\n  <=6I',
    'north\n  <6HI',
    'north\n  H < I',
    'north\n  C',
    'north\n  CAI',
    'north\n  CA ',
    'north\n  CA DJ HT S9 C4',
    'north\n  $',
    'north\n  $\n',
    'north\n  $ \n',
    'north\n  $ ',
    'north\n  $}',
    'north\n  $} = S',
    'north\n  $a} = S',
    'north\n  $a\ud800 = S',
    'north\n  $a =',
    'north\n  $a =\n',
    'north\n  %',
    'north\n  %\n',
    'north\n  % \n',
    'north\n  % ',
    'north\n  %}',
    'north\n  %} = 1',
    'north\n  %a} = 2',
    'north\n  %a\ud800 = 3',
    'north\n  %a =',
    'north\n  %a =\n',
    'north\n  %a = b\n',
    'north\n  %a = 1,\n',
    'north\n  %a = 1,b\n',
    'north\n  C%}',
    'north\n  C%a',
    'north\n  C%a < 4',
    'north\n  %a=4,2\nC%a .',
    'north\n  %a=4,2\nC%a < b',
    'north\n  %a=4,2\nC%a < 1b',
    'north ',
    'dealer',
    'dealer ',
    'dealer\n',
    'vuln',
    'vuln\n',
    'vuln ',
    'bid',
    'bid ',
    'bid\n',
    '\n I',
  ]) {
    throws(() => parse(src, {
      grammarSource: 'test',
    }), er => {
      if (er.format) {
        assert(er.format([{source: 'test', text: src}]));
        return true;
      }
      return false;
    }, `"${src}"`);
  }

  throws(() => parse('', {startRule: 'ref'}));
  throws(() => parse('', {startRule: 'BAD RULE NAME'}));
});
