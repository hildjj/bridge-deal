const MAX_TRIES = 1000000;
export var Suit;
(function (Suit) {
    Suit["CLUBS"] = "\u2663";
    Suit["DIAMONDS"] = "\u2662";
    Suit["HEARTS"] = "\u2661";
    Suit["SPADES"] = "\u2660";
})(Suit || (Suit = {}));
export var NoTrump;
(function (NoTrump) {
    NoTrump["NT"] = "N";
})(NoTrump || (NoTrump = {}));
export const BidSuit = { ...Suit, ...NoTrump };
export var Vuln;
(function (Vuln) {
    Vuln["ALL"] = "All";
    Vuln["NONE"] = "None";
    Vuln["NS"] = "NS";
    Vuln["EW"] = "EW";
})(Vuln || (Vuln = {}));
export var Direction;
(function (Direction) {
    Direction["NORTH"] = "north";
    Direction["EAST"] = "east";
    Direction["SOUTH"] = "south";
    Direction["WEST"] = "west";
})(Direction || (Direction = {}));
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
export class Inspected {
    [Symbol.for('Deno.customInspect')]() {
        return this.toString();
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
    }
}
export class Ref extends Inspected {
    ref;
    constructor(ref) {
        super();
        this.ref = ref;
    }
    toJSON() {
        return { ref: this.ref };
    }
    toString() {
        return `\${${this.ref}}`;
    }
}
export class Card extends Inspected {
    static POINTS = { A: 4, K: 3, Q: 2, J: 1 };
    rank;
    suit;
    index;
    points;
    constructor(rank, suit, index) {
        super();
        this.rank = rank;
        this.suit = suit;
        this.index = index;
        this.points = Card.POINTS[this.rank] ?? 0;
    }
    toString() {
        return `${this.rank}${this.suit}`;
    }
}
rnk = 51;
export const Deck = Object
    .values(Suit)
    .flatMap(s => Object.keys(RankValues)
    .map(r => new Card(r, s, rnk--)));
export class Hand extends Inspected {
    cards = [];
    name;
    dir;
    #points = undefined;
    #suits = undefined;
    constructor(name) {
        super();
        this.name = name;
        this.dir = name.toLowerCase();
    }
    get points() {
        if (this.#points === undefined) {
            this.#points = this.cards.reduce((t, v) => t + v.points, 0);
        }
        return this.#points;
    }
    get spades() {
        return this.#getSuits()[Suit.SPADES];
    }
    get hearts() {
        return this.#getSuits()[Suit.HEARTS];
    }
    get diamonds() {
        return this.#getSuits()[Suit.DIAMONDS];
    }
    get clubs() {
        return this.#getSuits()[Suit.CLUBS];
    }
    get shape() {
        const s = this.#getSuits();
        return {
            spades: s[Suit.SPADES].length,
            hearts: s[Suit.HEARTS].length,
            diamonds: s[Suit.DIAMONDS].length,
            clubs: s[Suit.CLUBS].length,
        };
    }
    get shapeAny() {
        return Object
            .values(this.shape)
            .sort((a, b) => b - a);
    }
    get needed() {
        return 13n - BigInt(this.cards.length);
    }
    static ranks(cards) {
        return cards.map(s => s.rank).join('');
    }
    shapeStr() {
        return Object
            .values(this.shape)
            .join('');
    }
    isShape(s, h, d, c) {
        const { shape } = this;
        return (shape.spades === s) &&
            (shape.hearts === h) &&
            (shape.diamonds === d) &&
            (shape.clubs === c);
    }
    isShapeAny(...nums) {
        const sa = this.shapeAny;
        const nums_len = nums.length;
        for (let i = 0; i < nums_len; i++) {
            if (sa[i] !== nums[i]) {
                return false;
            }
        }
        return true;
    }
    hasVoid() {
        const sa = this.shapeAny;
        return sa[3] === 0;
    }
    hasSingleton() {
        const sa = this.shapeAny;
        return sa.includes(1);
    }
    hasSingletonOrVoid() {
        const sa = this.shapeAny;
        return sa.findIndex(s => (s === 0) || (s === 1)) !== -1;
    }
    hasCards(cards) {
        const suit = {
            C: this.clubs,
            D: this.diamonds,
            H: this.hearts,
            S: this.spades,
        }[cards[0]];
        for (const c of cards.slice(1)) {
            if (!suit?.some(card => card.rank === c)) {
                return false;
            }
        }
        return true;
    }
    *suits() {
        yield ['Spades', this.spades];
        yield ['Hearts', this.hearts];
        yield ['Diamonds', this.diamonds];
        yield ['Clubs', this.clubs];
    }
    ranks() {
        return [
            Hand.ranks(this.spades),
            Hand.ranks(this.hearts),
            Hand.ranks(this.diamonds),
            Hand.ranks(this.clubs),
        ];
    }
    range(min, max) {
        const pts = this.points;
        return (pts >= min) && (pts <= max);
    }
    balanced() {
        const { shapeAny } = this;
        return (shapeAny[0] < 6) && (shapeAny[3] > 1) &&
            !((shapeAny[0] === 5) && (shapeAny[1] === 4));
    }
    balancedNoM() {
        return this.balanced() && this.spades.length < 5 && this.hearts.length < 5;
    }
    push(cd) {
        this.cards.push(cd);
    }
    pbn() {
        return this.ranks().join('.');
    }
    lin() {
        return `S${Hand.ranks(this.spades)}H${Hand.ranks(this.hearts)}D${Hand.ranks(this.diamonds)}C${Hand.ranks(this.clubs)}`;
    }
    toString() {
        return `${Object
            .values(Suit)
            .map(s => `${s}: ${this.cards
            .filter(cd => cd.suit === s)
            .map(cd => cd.rank)
            .join('')}`)
            .join(' ')} (${this.points})`;
    }
    #getSuits() {
        if (!this.#suits) {
            this.#suits = {
                [Suit.SPADES]: [],
                [Suit.HEARTS]: [],
                [Suit.DIAMONDS]: [],
                [Suit.CLUBS]: [],
            };
            for (const c of this.cards) {
                this.#suits[c.suit].push(c);
            }
        }
        return this.#suits;
    }
}
export class Bid extends Inspected {
    static PASS = 0;
    static DOUBLE = -1;
    static REDOUBLE = -2;
    static BidFromName = {
        p: Bid.PASS,
        P: Bid.PASS,
        X: Bid.DOUBLE,
        x: Bid.DOUBLE,
        XX: Bid.REDOUBLE,
        xx: Bid.REDOUBLE,
    };
    level;
    suit;
    alert;
    description;
    constructor(opts) {
        super();
        if (!opts) {
            opts = { level: Bid.PASS };
        }
        if (typeof opts !== 'object') {
            throw new TypeError(`Invalid opts: "${opts}"`);
        }
        if (typeof opts.level === 'string') {
            const lev = parseInt(opts.level, 10);
            if (isNaN(lev)) {
                throw new Error(`Invalid level: "${opts.level}"`);
            }
            opts.level = lev;
        }
        if (typeof opts.level === 'number') {
            if (opts.suit) {
                if ((opts.level < 1) || (opts.level > 7)) {
                    throw new Error(`Invalid level: "${opts.level}"`);
                }
            }
            else if ((opts.level > Bid.PASS) || (opts.level < Bid.REDOUBLE)) {
                throw new Error(`Invalid level: "${opts.level}"`);
            }
        }
        this.level = opts.level;
        if (typeof opts.suit === 'string') {
            this.suit = {
                C: BidSuit.CLUBS,
                D: BidSuit.DIAMONDS,
                H: BidSuit.HEARTS,
                S: BidSuit.SPADES,
                N: BidSuit.NT,
                [BidSuit.CLUBS]: BidSuit.CLUBS,
                [BidSuit.DIAMONDS]: BidSuit.DIAMONDS,
                [BidSuit.HEARTS]: BidSuit.HEARTS,
                [BidSuit.SPADES]: BidSuit.SPADES,
            }[opts.suit.toUpperCase()];
            if (!this.suit) {
                throw new Error(`Invalid suit lookup: "${opts.suit.toUpperCase()}"`);
            }
        }
        else {
            this.suit = opts.suit;
        }
        this.alert = opts.alert ?? false;
        this.description = opts.description;
    }
    toString(bare = false) {
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
                ret += ': ';
                ret += this.description;
            }
        }
        return ret;
    }
    toJSON() {
        return {
            level: this.level,
            suit: this.suit,
            alert: this.alert,
            description: this.description,
        };
    }
    serialize() {
        let ret = '{';
        if (this.level instanceof Ref) {
            if (this.level.ref === 'level') {
                ret += 'level,';
            }
            else {
                ret += `level: ${this.level.ref},`;
            }
        }
        else {
            ret += `level: ${this.level},`;
        }
        if (this.suit) {
            if (this.suit instanceof Ref) {
                if (this.suit.ref === 'suit') {
                    ret += 'suit,';
                }
                else {
                    ret += `suit: ${this.suit.ref},`;
                }
            }
            else {
                ret += `suit: '${this.suit}',`;
            }
        }
        if (this.alert) {
            ret += 'alert: true,';
        }
        if (this.description) {
            ret += `description: \`${this.description}\`,`;
        }
        ret += '}';
        return ret;
    }
}
export class Deal extends Inspected {
    static D = 53644737765488792839237440000n;
    static randBuf = new Uint8Array(16);
    static randBI = new BigUint64Array(this.randBuf.buffer, this.randBuf.byteOffset, this.randBuf.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
    num;
    vuln = Vuln.NONE;
    dealer = Direction.NORTH;
    bids = [];
    hands = [
        new Hand('North'), new Hand('East'), new Hand('South'), new Hand('West'),
    ];
    constructor(num) {
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
                if (I < X) {
                    h.push(Deck[Number(C) - 1]);
                    break;
                }
            }
            K = X;
        }
    }
    get north() {
        return this.hands[0];
    }
    get east() {
        return this.hands[1];
    }
    get south() {
        return this.hands[2];
    }
    get west() {
        return this.hands[3];
    }
    static fromJSON(o) {
        if (typeof o === 'string') {
            o = JSON.parse(o);
        }
        const d = new Deal(BigInt(`0x${o.num}`));
        o.names.forEach((v, i) => {
            d.hands[i].name = v;
        });
        d.vuln = o.vuln;
        d.dealer = o.dealer;
        d.bids = o.bids.map(b => new Bid(b));
        return d;
    }
    static weight(cards, weights) {
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
    static randD() {
        crypto.getRandomValues(this.randBuf);
        return ((this.randBI[0] << 64n) | this.randBI[1]) % this.D;
    }
    randVuln() {
        const v = Math.floor(Math.random() * 4);
        this.vuln = Object.values(Vuln)[v];
    }
    isVulnerable(hand) {
        switch (this.vuln) {
            case Vuln.ALL:
                return true;
            case Vuln.NONE:
                return false;
            case Vuln.NS:
                return (hand.dir === Direction.NORTH) || (hand.dir === Direction.SOUTH);
            case Vuln.EW:
                return (hand.dir === Direction.EAST) || (hand.dir === Direction.WEST);
        }
        throw new TypeError(`Invalid vulnerability: "${this.vuln}"`);
    }
    bid(opts) {
        this.bids.push(new Bid(opts));
    }
    lin() {
        return `https://www.bridgebase.com/tools/handviewer.html?lin=qx|o${this.num}|md|3${this.south.lin()},${this.west.lin()},${this.north.lin()}|rh||ah|${this.num}|sv|0|pg||`;
    }
    pbn() {
        return `N:${this.north.pbn()} ${this.east.pbn()} ${this.south.pbn()} ${this.west.pbn()}`;
    }
    toString() {
        let ret = `Dealer: ${this.dealer}, Vuln: ${this.vuln}\n`;
        ret += this.hands
            .map(h => `${h.name}: ${h.toString()}`)
            .join('\n');
        ret += '\n';
        if (this.bids.length) {
            ret += this.bids.map(b => b.toString()).join('-');
            ret += '\n';
        }
        return ret;
    }
    toJSON() {
        return {
            num: this.num.toString(16),
            vuln: this.vuln,
            dealer: this.dealer,
            bids: this.bids.map(b => b.toJSON()),
            names: this.hands.map(h => h.name),
        };
    }
}
export function findDeal(filter, maxTries = MAX_TRIES) {
    let tries = 0;
    while (true) {
        if (tries++ > maxTries) {
            throw new Error(`Too many tries: ${tries}`);
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
export function deals(num, filter) {
    const ret = new Array(num);
    let count = 0;
    while (count < num) {
        [ret[count++]] = findDeal(filter);
    }
    return ret;
}
