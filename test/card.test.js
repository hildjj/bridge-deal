import {
  Bid,
  Card,
  Deal,
  Deck,
  Suit,
  deals,
  findDeal,
} from '../docs/js/card.js';
import {default as assert, deepEqual, equal, throws} from 'node:assert/strict';
import {test} from 'node:test';
import util from 'node:util';

test('card', () => {
  const c = new Card('2', Suit.CLUBS, 0);
  equal(c.points, 0);
  equal(c.toString(), '2♣');
  equal(util.inspect(c, {colors: false}), '2♣');
  equal(c[Symbol.for('Deno.customInspect')](), '2♣');
});

test('hand', () => {
  const d = new Deal(22920490249857295463399012200n);
  // Ensure laziness works
  const n = d.north;
  equal(n.dir, 'north');
  equal(Object.getOwnPropertyDescriptor(n, 'points'), undefined);
  equal(n.points, 7);

  equal(d.toString(), `\
Dealer: north, Vuln: None
North: ♣: Q73 ♢: 74 ♡: KQT83 ♠: 954 (7)
East: ♣: J2 ♢: T953 ♡: 975 ♠: AJ82 (6)
South: ♣: KT864 ♢: Q8 ♡: AJ4 ♠: K73 (13)
West: ♣: A95 ♢: AKJ62 ♡: 62 ♠: QT6 (14)
`);

  deepEqual(Object.getOwnPropertyDescriptor(n, 'points'), {
    value: 7, writable: false, enumerable: false, configurable: false,
  });
  equal(n.points, 7);

  equal(n.clubs.length, 3);
  equal(n.diamonds.length, 2);
  equal(n.hearts.length, 5);
  equal(n.spades.length, 3);
  deepEqual(n.shape, {
    clubs: 3,
    diamonds: 2,
    hearts: 5,
    spades: 3,
  });
  deepEqual(n.shapeAny, [5, 3, 3, 2]);
  equal(n.needed, 0n);

  equal([...n.suits()][0][1].length, 3);

  // Calls ranks()
  equal(d.pbn(), 'N:954.KQT83.74.Q73 AJ82.975.T953.J2 K73.AJ4.Q8.KT864 QT6.62.AKJ62.A95');
  equal(d.lin(), 'https://www.bridgebase.com/tools/handviewer.html?lin=qx|o22920490249857295463399012200|md|3SK73HAJ4DQ8CKT864,SQT6H62DAKJ62CA95,S954HKQT83D74CQ73|rh||ah|22920490249857295463399012200|sv|0|pg||');
  equal(n.shapeStr(), '3523');
  equal(n.isShape(3, 5, 2, 3), true);
  equal(n.isShapeAny(5, 3, 3, 2), true);
  equal(n.isShapeAny(5, 4, 2, 2), false);
  equal(n.hasVoid(), false);
  equal(n.hasSingleton(), false);
  equal(n.hasSingletonOrVoid(), false);
  equal(n.hasCards('HKQ'), true);
  equal(n.hasCards('SKQ'), false);
  equal(n.range(5, 8), true);
  equal(n.range(5, 7), true);
  equal(n.range(7, 9), true);
  equal(n.range(10, 12), false);
  equal(n.range(3, 5), false);
  equal(n.balanced(), true);
  equal(n.balancedNoM(), false);
});

test('Bid', () => {
  equal(new Bid().toString(), 'P');
  throws(() => new Bid('jjjjjj'));
  equal(new Bid('1C').toString(), '1♣');
  equal(new Bid('X').toString(), 'X');
  equal(new Bid('XX').toString(), 'XX');
  equal(new Bid('1♣!: 16+, artificial').toString(), '1♣! (16+, artificial)');
  deepEqual(new Bid('1♣!: 16+, artificial').toJSON(), {
    level: 1,
    suit: '♣',
    alert: true,
    description: '16+, artificial',
  });
  throws(() => new Bid({
    level: 8,
    suit: Suit.HEARTS,
  }));
  throws(() => new Bid({
    level: 8,
  }));
});

test('Deal', () => {
  const d = new Deal(); // Random
  d.bid();
  d.bid('1C!: 16+');
  d.randVuln();
  equal(typeof d.toString(), 'string');
  const json = d.toJSON();
  assert(json);
  equal(typeof json, 'object');
  const e = Deal.fromJSON(json);
  equal(d.num, e.num);
  equal(Deal.fromJSON(JSON.stringify(json)).num, e.num);

  equal(Deal.weight([], []), 0);
  equal(Deal.weight([], [4, 3, 2, 1]), 0);
  equal(Deal.weight(Deck.slice(-5).reverse(), [4, 3, 2, 1]), 10);
});

test('findDeal', () => {
  const [d, tries] = findDeal(() => true);
  assert(d instanceof Deal);
  equal(tries, 1);
  equal(findDeal()[1], 1);
  throws(() => findDeal(undefined, -1));
  throws(() => findDeal(() => 0));
});

test('deals', () => {
  const res = deals(3);
  equal(res.length, 3);
});
