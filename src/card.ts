export enum Suit {
  CLUBS = '♣',
  DIAMONDS = '♢',
  HEARTS = '♡',
  SPADES = '♠',
}

export type SuitStr = 'clubs' | 'diamonds' | 'hearts' | 'spades';

let c = 0;
export const RankValues = {
  2: c++,
  3: c++,
  4: c++,
  5: c++,
  6: c++,
  7: c++,
  8: c++,
  9: c++,
  T: c++,
  J: c++,
  Q: c++,
  K: c++,
  A: c++,
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

c = 51;
const Deck = Object
  .values(Suit)
  .flatMap(
    s => (Object.keys(RankValues) as Rank[])
      .map(r => new Card(r, s, c--))
  );

export class Hand extends Inspected {
  public cards: Card[] = [];
  public name: string;

  public constructor(name: string) {
    super();
    this.name = name;
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

  public push(cd: Card): void {
    this.cards.push(cd);
    if (this.cards.length > 13) {
      throw new Error('Bad deal');
    }
  }

  public lin(): string {
    return `S${this.spades.map(s => s.rank).join('')}H${this.hearts.map(s => s.rank).join('')}D${this.diamonds.map(s => s.rank).join('')}C${this.clubs.map(s => s.rank).join('')}`;
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

export class Deal extends Inspected {
  // 52! / (13!)**4
  private static D = 53_644_737_765_488_792_839_237_440_000n;
  public num: bigint;
  public hands = [
    new Hand('N'), new Hand('E'), new Hand('S'), new Hand('W'),
  ];

  public constructor(num?: bigint) {
    super();
    if (num === undefined) {
      const buf = new Uint8Array(12);
      crypto.getRandomValues(buf);
      const hex = Array.prototype.map.call(
        buf,
        i => i.toString(16).padStart(2, '0')
      ).join('');
      num = BigInt(`0x${hex}`) % Deal.D; // Is `% D` right?
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

  public lin(): string {
    return `https://www.bridgebase.com/tools/handviewer.html?lin=qx|o${this.num}|md|3${this.south.lin()},${this.west.lin()},${this.north.lin()}|rh||ah|${this.num}|sv|0|pg||`;
  }

  public toString(): string {
    return this.hands
      .map(h => `${h.name}: ${h.toString()}`)
      .join('\n');
  }
}

export type DealPredicate = (deal: Deal) => boolean;

export function findDeal(filter?: DealPredicate): [Deal, number] {
  let tries = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    tries++;
    const d = new Deal();
    if (!filter || filter(d)) {
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

const SUIT_POINTS = [4, 3, 2, 1];
export function prec2d(d: Deal): boolean {
  const np = d.north.points;
  if (np < 11 || np > 15) {
    return false;
  }
  const sp = d.south.points;
  if (sp < 11) {
    return false;
  }

  const ns = d.north.shape;
  if (ns.spades < 3 || ns.spades > 4 ||
      ns.hearts < 3 || ns.hearts > 4 ||
      ns.diamonds > 1 ||
      ns.clubs > 5) {
    return false;
  }
  if (ns.spades === 3 && ns.hearts === 3) {
    return false;
  }
  if ((ns.clubs === 5) && Deal.weight(d.north.clubs, SUIT_POINTS) > 3) {
    return false;
  }
  return true;
}
