const MAX_TRIES = 100000;

export enum Suit {
  CLUBS = '♣',
  DIAMONDS = '♢',
  HEARTS = '♡',
  SPADES = '♠',
  NT = 'N',
}

export enum Vuln {
  ALL = 'All',
  NONE = 'None',
  NS = 'NS',
  EW = 'EW',
}

export enum Direction {
  NORTH = 'north',
  EAST = 'east',
  SOUTH = 'south',
  WEST = 'west',
}

export type SuitStr = 'clubs' | 'diamonds' | 'hearts' | 'spades';

let rnk = 0;
export const RankValues = {
  2: rnk++,
  3: rnk++,
  4: rnk++,
  5: rnk++,
  6: rnk++,
  7: rnk++,
  8: rnk++,
  9: rnk++,
  T: rnk++,
  J: rnk++,
  Q: rnk++,
  K: rnk++,
  A: rnk++,
};
export type Rank = keyof typeof RankValues;

export interface Shape {
  spades: number;
  hearts: number;
  diamonds: number;
  clubs: number;
}

function lazy<T>(
  fn: (...args: any[]) => any,
  desc: ClassGetterDecoratorContext
) {
  // eslint-disable-next-line func-names
  return function(this: T, ...args: any[]): any {
    const value = fn.call(this, ...args);
    Object.defineProperty(this, desc.name, {
      value,
    });
    return value;
  };
}

export class Inspected {
  public [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }

  public [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}

export class Card extends Inspected {
  public static POINTS: {
    [key: string]: number;
  } = {A: 4, K: 3, Q: 2, J: 1};

  public rank: Rank;
  public suit: Suit;
  public index: number;
  public points: number;

  public constructor(rank: Rank, suit: Suit, index: number) {
    super();
    this.rank = rank;
    this.suit = suit;
    this.index = index;
    this.points = Card.POINTS[this.rank] ?? 0;
  }

  public toString(): string {
    return `${this.rank}${this.suit}`;
  }
}

rnk = 51;
const Deck = Object
  .values(Suit)
  .flatMap(
    s => (Object.keys(RankValues) as Rank[])
      .map(r => new Card(r, s, rnk--))
  );

export class Hand extends Inspected {
  public cards: Card[] = [];
  public name: string;
  public dir: Direction;

  public constructor(name: string) {
    super();
    this.name = name;
    this.dir = name.toLowerCase() as Direction;
  }

  @lazy
  public get points(): number {
    return this.cards.reduce((t, v) => t + v.points, 0);
  }

  @lazy
  public get spades(): Card[] {
    return this.cards.filter(cd => cd.suit === Suit.SPADES);
  }

  @lazy
  public get hearts(): Card[] {
    return this.cards.filter(cd => cd.suit === Suit.HEARTS);
  }

  @lazy
  public get diamonds(): Card[] {
    return this.cards.filter(cd => cd.suit === Suit.DIAMONDS);
  }

  @lazy
  public get clubs(): Card[] {
    return this.cards.filter(cd => cd.suit === Suit.CLUBS);
  }

  @lazy
  public get shape(): Shape {
    return {
      spades: this.spades.length,
      hearts: this.hearts.length,
      diamonds: this.diamonds.length,
      clubs: this.clubs.length,
    };
  }

  public get needed(): bigint {
    return 13n - BigInt(this.cards.length);
  }

  public static ranks(cards: Card[]): string {
    return cards.map(s => s.rank).join('');
  }

  public isShape(s: number, h: number, d: number, c: number): boolean {
    const {shape} = this;
    return (shape.spades === s) &&
      (shape.hearts === h) &&
      (shape.diamonds === d) &&
      (shape.clubs === c);
  }

  public *suits(): Generator<[name: string, cards: Card[]]> {
    yield ['Spades', this.spades];
    yield ['Hearts', this.hearts];
    yield ['Diamonds', this.diamonds];
    yield ['Clubs', this.clubs];
  }

  public ranks(): string[] {
    return [
      Hand.ranks(this.spades),
      Hand.ranks(this.hearts),
      Hand.ranks(this.diamonds),
      Hand.ranks(this.clubs),
    ];
  }

  public range(min: number, max: number): boolean {
    const pts = this.points;
    return (pts >= min) && (pts <= max);
  }

  public balanced(): boolean {
    const lens = [
      this.spades.length,
      this.hearts.length,
      this.diamonds.length,
      this.clubs.length,
    ];
    return !lens.some(s => s < 2 || s > 5);
  }

  public push(cd: Card): void {
    this.cards.push(cd);
    if (this.cards.length > 13) {
      throw new Error('Bad deal');
    }
  }

  public pbn(): string {
    return this.ranks().join('.');
  }

  public lin(): string {
    return `S${Hand.ranks(this.spades)}H${Hand.ranks(this.hearts)}D${Hand.ranks(this.diamonds)}C${Hand.ranks(this.clubs)}`;
  }

  public toString(): string {
    return `${Object
      .values(Suit)
      .map(s => `${s}: ${this.cards
        .filter(cd => cd.suit === s)
        .map(cd => cd.rank)
        .join('')}`)
      .join(' ')} (${this.points})`;
  }
}

export interface BidOptions {
  level: number;
  suit?: Suit;
  alert?: boolean;
  description?: string;
}

export interface BidJSON {
  level: number;
  suit?: Suit;
  alert: boolean;
  description?: string;
}

export class Bid extends Inspected {
  public static PASS = 0;
  public static DOUBLE = -1;
  public static REDOUBLE = -2;

  public level: number;
  public suit?: Suit;
  public alert: boolean;
  public description: string | undefined;

  public constructor(opts?: BidOptions | string) {
    super();

    if (!opts) {
      opts = 'P';
    }

    if (typeof opts === 'string') {
      const m = opts.match(/^(?<bid>P|X|XX|(?<level>[1-7])(?<suit>[CDHSN]))(?<alert>!)?(?::\s*(?<description>.*))?$/i);
      if (!m?.groups) {
        throw new Error(`Invalid bid: "${opts}"`);
      }
      const level = m.groups.level ?
        parseInt(m.groups.level, 10) :
        {
          P: Bid.PASS,
          X: Bid.DOUBLE,
          XX: Bid.REDOUBLE,
        }[m.groups.bid];
      if (typeof level === 'undefined') {
        throw new Error(`Unknown bid: "${opts}"`);
      }
      opts = {
        level,
        alert: Boolean(m.groups.alert),
      };
      if (m.groups.suit) {
        opts.suit = {
          C: Suit.CLUBS,
          D: Suit.DIAMONDS,
          H: Suit.HEARTS,
          S: Suit.SPADES,
          N: Suit.NT,
        }[m.groups.suit.toUpperCase()];
      }
      if (m.groups.description) {
        opts.description = m.groups.description;
      }
    }

    if (opts.suit) {
      if ((opts.level < 1) || (opts.level > 7)) {
        throw new Error(`Invalid level: "${opts.level}"`);
      }
    } else if ((opts.level > Bid.PASS) || (opts.level < Bid.REDOUBLE)) {
      throw new Error(`Invalid level: "${opts.level}"`);
    }

    this.level = opts.level;
    this.suit = opts.suit;
    this.alert = opts.alert ?? false;
    this.description = opts.description;
  }

  public toString(bare = false): string {
    let ret = '';
    switch (this.level) {
      case -2:
        ret = 'XX';
        break;
      case -1:
        ret = 'X';
        break;
      case 0:
        ret = 'P';
        break;
      default:
        ret = `${this.level}${this.suit}`;
        break;
    }

    if (!bare) {
      if (this.alert) {
        ret += '!';
      }
      if (this.description) {
        ret += ` (${this.description})`;
      }
    }
    return ret;
  }

  public toJSON(): BidJSON {
    return {
      level: this.level,
      suit: this.suit,
      alert: this.alert,
      description: this.description,
    };
  }
}

export interface DealJSON {
  num: string;
  vuln: Vuln;
  dealer: Direction;
  bids: BidJSON[];
  names: string[];
}

export class Deal extends Inspected {
  // 52! / (13!)**4
  private static D = 53_644_737_765_488_792_839_237_440_000n;
  private static randBuf = new Uint8Array(16);
  private static randBI = new BigUint64Array(
    this.randBuf.buffer,
    this.randBuf.byteOffset,
    this.randBuf.byteLength / BigUint64Array.BYTES_PER_ELEMENT
  );

  public num: bigint;
  public vuln: Vuln = Vuln.NONE;
  public dealer: Direction = Direction.NORTH;
  public bids: Bid[] = [];
  public hands = [
    new Hand('North'), new Hand('East'), new Hand('South'), new Hand('West'),
  ];

  public constructor(num?: bigint) {
    super();
    if ((num === undefined) || (num < 0n)) {
      num = Deal.randD();
    }
    this.num = num;

    let K = Deal.D;
    let I = this.num;
    for (let C = 52n; C > 0; C--) {
      let X = 0n;
      for (const h of this.hands) {
        I -= X;
        X = K * h.needed / C;
        if (I < X || h.name === 'W') {
          h.push(Deck[Number(C) - 1]);
          break;
        }
      }
      K = X;
    }
    // No need to sort, cards are inserted in order
  }

  @lazy
  public get north(): Hand {
    return this.hands[0];
  }

  @lazy
  public get east(): Hand {
    return this.hands[1];
  }

  @lazy
  public get south(): Hand {
    return this.hands[2];
  }

  @lazy
  public get west(): Hand {
    return this.hands[3];
  }

  public static fromJSON(o: DealJSON | string): Deal {
    if (typeof o === 'string') {
      o = JSON.parse(o) as DealJSON;
    }
    const d = new Deal(BigInt(`0x${o.num}`));
    o.names.forEach((v: string, i: number) => {
      d.hands[i].name = v;
    });
    d.vuln = o.vuln;
    d.dealer = o.dealer;
    d.bids = o.bids.map(b => new Bid(b));
    return d;
  }

  /**
   * Add all of the weights for the cards held.
   *
   * @param cards Cards to compute over
   * @param weights Weights for A, K, Q, etc. in order.  0 is the default.
   */
  public static weight(cards: Card[], weights: number[]): number {
    let tot = 0;
    for (const cd of cards) {
      const pos = 12 - RankValues[cd.rank];
      if (pos >= weights.length) {
        break;
      }
      tot += weights[pos];
    }
    return tot;
  }

  private static randD(): bigint {
    crypto.getRandomValues(this.randBuf);
    return ((this.randBI[0] << 64n) | this.randBI[1]) % this.D;
  }

  public randVuln(): void {
    const v = Math.floor(Math.random() * 4);
    this.vuln = Object.values(Vuln)[v];
  }

  public bid(opts: BidOptions | string): void {
    this.bids.push(new Bid(opts));
  }

  public lin(): string {
    return `https://www.bridgebase.com/tools/handviewer.html?lin=qx|o${this.num}|md|3${this.south.lin()},${this.west.lin()},${this.north.lin()}|rh||ah|${this.num}|sv|0|pg||`;
  }

  public pbn(): string {
    return `N:${this.north.pbn()} ${this.east.pbn()} ${this.south.pbn()} ${this.west.pbn()}`;
  }

  public toString(): string {
    return this.hands
      .map(h => `${h.name}: ${h.toString()}`)
      .join('\n');
  }

  public toJSON(): DealJSON {
    return {
      num: this.num.toString(16),
      vuln: this.vuln,
      dealer: this.dealer,
      bids: this.bids.map(b => b.toJSON()),
      names: this.hands.map(h => h.name),
    };
  }
}

export type DealPredicate =
  (deal: Deal, cls: typeof Deal.constructor) => boolean;

export function findDeal(filter?: DealPredicate): [Deal, number] {
  let tries = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (tries++ > MAX_TRIES) {
      throw new Error('Too many tries');
    }
    const d = new Deal();
    if (!filter) {
      return [d, tries];
    }
    const ret = filter.call({}, d, Deal);
    if (typeof ret !== 'boolean') {
      throw new Error(`Invalid return: "${ret}"`);
    }
    if (ret) {
      return [d, tries];
    }
  }
}

export function deals(num: number, filter?: DealPredicate): Deal[] {
  const ret: Deal[] = new Array(num);
  let count = 0;
  while (count < num) {
    [ret[count++]] = findDeal(filter);
  }

  return ret;
}
