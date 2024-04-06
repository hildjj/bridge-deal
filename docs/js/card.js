var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
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
const BidSuit = { ...Suit, ...NoTrump };
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
function lazy(fn, desc) {
    return function (...args) {
        const value = fn.call(this, ...args);
        Object.defineProperty(this, desc.name, {
            value,
        });
        return value;
    };
}
export class Inspected {
    [Symbol.for('Deno.customInspect')]() {
        return this.toString();
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.toString();
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
const Deck = Object
    .values(Suit)
    .flatMap(s => Object.keys(RankValues)
    .map(r => new Card(r, s, rnk--)));
let Hand = (() => {
    let _classSuper = Inspected;
    let _instanceExtraInitializers = [];
    let _get_points_decorators;
    let _get_spades_decorators;
    let _get_hearts_decorators;
    let _get_diamonds_decorators;
    let _get_clubs_decorators;
    let _get_shape_decorators;
    let _get_shapeAny_decorators;
    return class Hand extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _get_points_decorators = [lazy];
            _get_spades_decorators = [lazy];
            _get_hearts_decorators = [lazy];
            _get_diamonds_decorators = [lazy];
            _get_clubs_decorators = [lazy];
            _get_shape_decorators = [lazy];
            _get_shapeAny_decorators = [lazy];
            __esDecorate(this, null, _get_points_decorators, { kind: "getter", name: "points", static: false, private: false, access: { has: obj => "points" in obj, get: obj => obj.points }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_spades_decorators, { kind: "getter", name: "spades", static: false, private: false, access: { has: obj => "spades" in obj, get: obj => obj.spades }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_hearts_decorators, { kind: "getter", name: "hearts", static: false, private: false, access: { has: obj => "hearts" in obj, get: obj => obj.hearts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_diamonds_decorators, { kind: "getter", name: "diamonds", static: false, private: false, access: { has: obj => "diamonds" in obj, get: obj => obj.diamonds }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_clubs_decorators, { kind: "getter", name: "clubs", static: false, private: false, access: { has: obj => "clubs" in obj, get: obj => obj.clubs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_shape_decorators, { kind: "getter", name: "shape", static: false, private: false, access: { has: obj => "shape" in obj, get: obj => obj.shape }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_shapeAny_decorators, { kind: "getter", name: "shapeAny", static: false, private: false, access: { has: obj => "shapeAny" in obj, get: obj => obj.shapeAny }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        cards = (__runInitializers(this, _instanceExtraInitializers), []);
        name;
        dir;
        constructor(name) {
            super();
            this.name = name;
            this.dir = name.toLowerCase();
        }
        get points() {
            return this.cards.reduce((t, v) => t + v.points, 0);
        }
        get spades() {
            return this.cards.filter(cd => cd.suit === Suit.SPADES);
        }
        get hearts() {
            return this.cards.filter(cd => cd.suit === Suit.HEARTS);
        }
        get diamonds() {
            return this.cards.filter(cd => cd.suit === Suit.DIAMONDS);
        }
        get clubs() {
            return this.cards.filter(cd => cd.suit === Suit.CLUBS);
        }
        get shape() {
            return {
                spades: this.spades.length,
                hearts: this.hearts.length,
                diamonds: this.diamonds.length,
                clubs: this.clubs.length,
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
            const lens = [
                this.spades.length,
                this.hearts.length,
                this.diamonds.length,
                this.clubs.length,
            ];
            return !lens.some(s => s < 2 || s > 5);
        }
        push(cd) {
            this.cards.push(cd);
            if (this.cards.length > 13) {
                throw new Error('Bad deal');
            }
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
    };
})();
export { Hand };
export class Bid extends Inspected {
    static PASS = 0;
    static DOUBLE = -1;
    static REDOUBLE = -2;
    level;
    suit;
    alert;
    description;
    constructor(opts) {
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
                    C: BidSuit.CLUBS,
                    D: BidSuit.DIAMONDS,
                    H: BidSuit.HEARTS,
                    S: BidSuit.SPADES,
                    N: BidSuit.NT,
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
        }
        else if ((opts.level > Bid.PASS) || (opts.level < Bid.REDOUBLE)) {
            throw new Error(`Invalid level: "${opts.level}"`);
        }
        this.level = opts.level;
        this.suit = opts.suit;
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
                ret += ` (${this.description})`;
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
}
let Deal = (() => {
    let _classSuper = Inspected;
    let _instanceExtraInitializers = [];
    let _get_north_decorators;
    let _get_east_decorators;
    let _get_south_decorators;
    let _get_west_decorators;
    return class Deal extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _get_north_decorators = [lazy];
            _get_east_decorators = [lazy];
            _get_south_decorators = [lazy];
            _get_west_decorators = [lazy];
            __esDecorate(this, null, _get_north_decorators, { kind: "getter", name: "north", static: false, private: false, access: { has: obj => "north" in obj, get: obj => obj.north }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_east_decorators, { kind: "getter", name: "east", static: false, private: false, access: { has: obj => "east" in obj, get: obj => obj.east }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_south_decorators, { kind: "getter", name: "south", static: false, private: false, access: { has: obj => "south" in obj, get: obj => obj.south }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_west_decorators, { kind: "getter", name: "west", static: false, private: false, access: { has: obj => "west" in obj, get: obj => obj.west }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static D = 53644737765488792839237440000n;
        static randBuf = new Uint8Array(16);
        static randBI = new BigUint64Array(this.randBuf.buffer, this.randBuf.byteOffset, this.randBuf.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
        num = __runInitializers(this, _instanceExtraInitializers);
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
                    if (I < X || h.name === 'W') {
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
            return this.hands
                .map(h => `${h.name}: ${h.toString()}`)
                .join('\n');
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
    };
})();
export { Deal };
export function findDeal(filter) {
    let tries = 0;
    while (true) {
        if (tries++ > MAX_TRIES) {
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
