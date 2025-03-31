import { Bid, Direction } from './card.js';
class Reject {
    #str;
    #not;
    constructor(str, not) {
        this.#str = str;
        this.#not = not;
    }
    toString() {
        if (this.#not === 1) {
            return `if (${this.#str}) { return false; }`;
        }
        return `if (!(${this.#str})) { return false; }`;
    }
}
class Holder {
    #reject = [];
    #accept = undefined;
    #depth;
    #vars;
    #top;
    constructor(depth, vars, top = false) {
        this.#depth = depth;
        this.#vars = vars;
        this.#top = top;
    }
    add(rule, not) {
        if (typeof rule !== 'string') {
            for (const k of Object.keys(rule)) {
                this.#vars.add(k);
            }
            this.#reject.push(rule);
            return this;
        }
        if (not) {
            this.#reject.push(new Reject(rule, not));
            return this;
        }
        this.#accept = new Accept(rule, this.#vars, this.#depth + 1);
        return this.#accept;
    }
    toString() {
        let ret = '';
        for (const r of this.#reject) {
            if (r instanceof Reject) {
                ret += `${this.indent(1)}${r.toString()}\n`;
            }
            else {
                for (const [k, v] of Object.entries(r)) {
                    if (Array.isArray(v)) {
                        ret += `${this.indent(1)}${k} = [${v.join(', ')}];\n`;
                    }
                    else {
                        ret += `${this.indent(1)}${k} = \`${v}\`;\n`;
                    }
                }
            }
        }
        if (this.#accept) {
            ret += this.#accept.toString();
        }
        else if (!this.#top) {
            ret += `${this.indent(1)}return false;\n`;
        }
        return ret;
    }
    indent(extra = 0) {
        return ''.padEnd((this.#depth + extra) * 2, ' ');
    }
}
class Dir extends Holder {
    #dir;
    constructor(d, vars) {
        super(-1, vars, true);
        this.#dir = d;
    }
    toString() {
        return `dir = deal.${this.#dir};\n${super.toString()}`;
    }
}
class Accept extends Holder {
    #str;
    constructor(str, vars, depth = 0) {
        super(depth, vars);
        this.#str = str;
    }
    toString() {
        let ret = `${this.indent()}if (!(${this.#str})) {\n`;
        ret += super.toString();
        ret += `${this.indent()}}\n`;
        return ret;
    }
}
export class DealRules {
    dealer = Direction.NORTH;
    vuln = undefined;
    bids = [];
    #cur = undefined;
    #dirs = [];
    #vars = new Set(['dir']);
    set dir(d) {
        this.#cur = new Dir(d, this.#vars);
        this.#dirs.push(this.#cur);
    }
    add(rule, not) {
        if (!this.#cur) {
            throw new Error('Set direction first');
        }
        this.#cur = this.#cur.add(rule, not);
    }
    isVar(v) {
        return this.#vars.has(v);
    }
    toString() {
        let ret = '';
        ret += `deal.dealer = '${this.dealer}';\n`;
        if (this.vuln) {
            ret += `deal.vuln = '${this.vuln}'\n`;
        }
        else {
            ret += 'deal.randVuln();\n';
        }
        for (const v of this.#vars) {
            ret += `let ${v} = null;\n`;
        }
        for (const d of this.#dirs) {
            ret += d.toString();
        }
        for (const b of this.bids) {
            ret += `deal.bid(${new Bid(b).serialize()});\n`;
        }
        ret += 'return true;\n';
        return ret;
    }
}
