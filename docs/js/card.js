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
export var Suit;
(function (Suit) {
    Suit["CLUBS"] = "\u2663";
    Suit["DIAMONDS"] = "\u2662";
    Suit["HEARTS"] = "\u2661";
    Suit["SPADES"] = "\u2660";
})(Suit || (Suit = {}));
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
c = 51;
const Deck = Object
    .values(Suit)
    .flatMap(s => Object.keys(RankValues)
    .map(r => new Card(r, s, c--)));
let Hand = (() => {
    let _classSuper = Inspected;
    let _instanceExtraInitializers = [];
    let _get_points_decorators;
    let _get_spades_decorators;
    let _get_hearts_decorators;
    let _get_diamonds_decorators;
    let _get_clubs_decorators;
    let _get_shape_decorators;
    return class Hand extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _get_points_decorators = [lazy];
            _get_spades_decorators = [lazy];
            _get_hearts_decorators = [lazy];
            _get_diamonds_decorators = [lazy];
            _get_clubs_decorators = [lazy];
            _get_shape_decorators = [lazy];
            __esDecorate(this, null, _get_points_decorators, { kind: "getter", name: "points", static: false, private: false, access: { has: obj => "points" in obj, get: obj => obj.points }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_spades_decorators, { kind: "getter", name: "spades", static: false, private: false, access: { has: obj => "spades" in obj, get: obj => obj.spades }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_hearts_decorators, { kind: "getter", name: "hearts", static: false, private: false, access: { has: obj => "hearts" in obj, get: obj => obj.hearts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_diamonds_decorators, { kind: "getter", name: "diamonds", static: false, private: false, access: { has: obj => "diamonds" in obj, get: obj => obj.diamonds }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_clubs_decorators, { kind: "getter", name: "clubs", static: false, private: false, access: { has: obj => "clubs" in obj, get: obj => obj.clubs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _get_shape_decorators, { kind: "getter", name: "shape", static: false, private: false, access: { has: obj => "shape" in obj, get: obj => obj.shape }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        cards = (__runInitializers(this, _instanceExtraInitializers), []);
        name;
        constructor(name) {
            super();
            this.name = name;
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
        get needed() {
            return 13n - BigInt(this.cards.length);
        }
        push(cd) {
            this.cards.push(cd);
            if (this.cards.length > 13) {
                throw new Error('Bad deal');
            }
        }
        lin() {
            return `S${this.spades.map(s => s.rank).join('')}H${this.hearts.map(s => s.rank).join('')}D${this.diamonds.map(s => s.rank).join('')}C${this.clubs.map(s => s.rank).join('')}`;
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
        num = __runInitializers(this, _instanceExtraInitializers);
        hands = [
            new Hand('N'), new Hand('E'), new Hand('S'), new Hand('W'),
        ];
        constructor(num) {
            super();
            if (num === undefined) {
                const buf = new Uint8Array(12);
                crypto.getRandomValues(buf);
                const hex = Array.prototype.map.call(buf, i => i.toString(16).padStart(2, '0')).join('');
                num = BigInt(`0x${hex}`) % Deal.D;
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
        lin() {
            return `https://www.bridgebase.com/tools/handviewer.html?lin=qx|o${this.num}|md|3${this.south.lin()},${this.west.lin()},${this.north.lin()}|rh||ah|${this.num}|sv|0|pg||`;
        }
        toString() {
            return this.hands
                .map(h => `${h.name}: ${h.toString()}`)
                .join('\n');
        }
    };
})();
export { Deal };
export function findDeal(filter) {
    let tries = 0;
    while (true) {
        tries++;
        const d = new Deal();
        if (!filter || filter(d)) {
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
const SUIT_POINTS = [4, 3, 2, 1];
export function prec2d(d) {
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
