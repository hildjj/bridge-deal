import {Bid, type BidOptions, Direction, Vuln} from './card.js';

// - Deal
// L dir
//   L if reject FAIL
//   L if reject FAIL
//   L if !accept
//     L if reject FAIL
//     L if !accept
//       L if !accept
//         L FAIL
// L dir
// L PASS

export interface VarMap {
  [name: string]: string;
}

class Reject {
  #str: string;
  #not: number;

  public constructor(str: string, not: number) {
    this.#str = str;
    this.#not = not;
  }

  public toString(): string {
    if (this.#not === 1) {
      return `if (${this.#str}) { return false; }`;
    }
    return `if (!(${this.#str})) { return false; }`;
  }
}

class Holder {
  // 0+ reject
  // 0-1 accept
  #reject: (Reject | VarMap)[] = [];
  #accept: Accept | undefined = undefined;
  #depth: number;
  #vars: Set<string>;
  #top: boolean;

  public constructor(depth: number, vars: Set<string>, top = false) {
    this.#depth = depth;
    this.#vars = vars;
    this.#top = top;
  }

  public add(rule: VarMap | string, not: number): Holder {
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
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.#accept = new Accept(rule, this.#vars, this.#depth + 1);
    return this.#accept;
  }

  public toString(): string {
    let ret = '';
    for (const r of this.#reject) {
      if (r instanceof Reject) {
        ret += `${this.indent(1)}${r.toString()}\n`;
      } else {
        for (const [k, v] of Object.entries(r)) {
          if (Array.isArray(v)) {
            ret += `${this.indent(1)}${k} = [${v.join(', ')}];\n`;
          } else {
            ret += `${this.indent(1)}${k} = \`${v}\`;\n`;
          }
        }
      }
    }
    if (this.#accept) {
      ret += this.#accept.toString();
    } else if (!this.#top) {
      ret += `${this.indent(1)}return false;\n`;
    }

    return ret;
  }

  protected indent(extra = 0): string {
    return ''.padEnd((this.#depth + extra) * 2, ' ');
  }
}

class Dir extends Holder {
  #dir: Direction;

  public constructor(d: Direction, vars: Set<string>) {
    super(-1, vars, true);
    this.#dir = d;
  }

  public toString(): string {
    return `dir = deal.${this.#dir};\n${super.toString()}`;
  }
}

class Accept extends Holder {
  #str: string;

  public constructor(str: string, vars: Set<string>, depth = 0) {
    super(depth, vars);
    this.#str = str;
  }

  public toString(): string {
    let ret = `${this.indent()}if (!(${this.#str})) {\n`;
    ret += super.toString();
    ret += `${this.indent()}}\n`;
    return ret;
  }
}

export class DealRules {
  public dealer = Direction.NORTH;
  public vuln: Vuln | undefined = undefined;
  public bids: BidOptions[] = [];

  #cur: Holder | undefined = undefined;
  #dirs: Holder[] = [];
  #vars = new Set<string>(['dir']);

  // eslint-disable-next-line accessor-pairs
  public set dir(d: Direction) {
    this.#cur = new Dir(d, this.#vars);
    this.#dirs.push(this.#cur);
  }

  public add(rule: string, not: number): void {
    if (!this.#cur) {
      throw new Error('Set direction first');
    }
    this.#cur = this.#cur.add(rule, not);
  }

  public isVar(v: string): boolean {
    return this.#vars.has(v);
  }

  public toString(): string {
    let ret = '';
    ret += `deal.dealer = '${this.dealer}';\n`;
    if (this.vuln) {
      ret += `deal.vuln = '${this.vuln}'\n`;
    } else {
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
