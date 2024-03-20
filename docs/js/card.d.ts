export declare enum Suit {
    CLUBS = "\u2663",
    DIAMONDS = "\u2662",
    HEARTS = "\u2661",
    SPADES = "\u2660"
}
export type SuitStr = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export declare const RankValues: {
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    T: number;
    J: number;
    Q: number;
    K: number;
    A: number;
};
export type Rank = keyof typeof RankValues;
export interface Shape {
    spades: number;
    hearts: number;
    diamonds: number;
    clubs: number;
}
export declare class Inspected {
}
export declare class Card extends Inspected {
    static POINTS: {
        [key: string]: number;
    };
    rank: Rank;
    suit: Suit;
    index: number;
    points: number;
    constructor(rank: Rank, suit: Suit, index: number);
    toString(): string;
}
export declare class Hand extends Inspected {
    cards: Card[];
    name: string;
    constructor(name: string);
    get points(): number;
    get spades(): Card[];
    get hearts(): Card[];
    get diamonds(): Card[];
    get clubs(): Card[];
    get shape(): Shape;
    get needed(): bigint;
    push(cd: Card): void;
    lin(): string;
    toString(): string;
}
export declare class Deal extends Inspected {
    private static D;
    num: bigint;
    hands: Hand[];
    constructor(num?: bigint);
    get north(): Hand;
    get east(): Hand;
    get south(): Hand;
    get west(): Hand;
    static weight(cards: Card[], weights: number[]): number;
    lin(): string;
    toString(): string;
}
export type DealPredicate = (deal: Deal) => boolean;
export declare function findDeal(filter?: DealPredicate): [Deal, number];
export declare function deals(num: number, filter?: DealPredicate): Deal[];
export declare function prec2d(d: Deal): boolean;
