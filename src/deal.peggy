{{
import {DealRules} from './ast.js'
import {Direction, Vuln} from './card.js'

function suitOps(op, num, suits) {
  let ret = [];
  for (const s of suits) {
    ret.push(`(dir.${s}.length ${op} ${num})`);
  }
  return ret;
}
}}

{
const rules = new DealRules();
}

commands
  = commands:command|.., _ comment? CRLF| EOL { return rules.toString(); }

command
  = dealer
  / vuln
  / hand
  / _ @setVar
  / _ @bid
  / _ @rule
  / _

dealer
  = "dealer" __ d:dir { rules.dealer = d; }

hand
  = d:dir { rules.dir = d }

setVar
  = "$" id:identifier _ "=" _ desc:description {
    rules.add({[id]: desc});
  }
  / "%" id:identifier _ "=" _ nums:($[0-9]+)|1.., _ "," _| {
    rules.add({[id]: nums});
  }

dir
  = "north"i { return Direction.NORTH; }
  / "south"i { return Direction.SOUTH; }
  / "east"i { return Direction.EAST; }
  / "west"i { return Direction.WEST; }
  / "n"i &(__ / EOL) { return Direction.NORTH; }
  / "s"i &(__ / EOL) { return Direction.SOUTH; }
  / "e"i &(__ / EOL) { return Direction.EAST; }
  / "w"i &(__ / EOL) { return Direction.WEST; }

vuln
  = "vuln" __ vuln:vulnerability { rules.vuln = vuln; }

vulnerability
  = "all"i { return Vuln.ALL; }
  / "both"i { return Vuln.ALL; }
  / "NS"i { return Vuln.NS; }
  / "EW"i { return Vuln.EW; }
  / "none"i { return Vuln.NONE; }
  / "neither"i { return Vuln.NONE; }
  / "random"i { return undefined; }

bid
 = "bid" __ bid:description {
    rules.bids.push(bid);
    return null;
  }

suit
  = "C"i { return 'clubs'; }
  / "D"i { return 'diamonds'; }
  / "H"i { return 'hearts'; }
  / "S"i { return 'spades'; }

alert
  = "!"

comment
  = "//" description

description
  = $(!EOL .)+

rule
  = not:(@"!" _)? parts:part|1.., "," _| {
    rules.add(parts.join(' && '), Boolean(not));
  }

// Return the "not" versions
part
  = holding
  / weight
  / compare
  / distribution
  / min:hcp "-" max:hcp { return `dir.range(${min}, ${max})`; }
  / p:hcp more:"+"? {
      if (more) {
        return `(dir.points >= ${p})`;
      } else {
        return `(dir.points === ${p})`
      }
    }
  / "balanced5" { return 'dir.balanced()'; }
  / "balanced" { return 'dir.balancedNoM()'; }

hcp
  = @n:$([0-9] [0-9]?) &{ return parseInt(n, 10) < 37; }

weight
  = suit:suit "%" id:ref _ op:op _ num:$[0-9]+ {
    return `(Deal.weight(dir.${suit}, ${id}) ${op} ${num})`;
  }

ref
  = id:identifier {
    if (!rules.isVar(id)) {
      error(`Unknown variable: "${id}"`);
    }
    return id;
  }

compare
  = a:suit _ op:op _ b:suit {
    return `(dir.${a}.length ${op} dir.${b}.length)`;
  }

op
  = $([<>] "=")
  / [<>]
  / "=" { return "==="; }

holding
  = num:[0-9] plus:"+"? suits:(suitSet / suit+) {
      const op = plus ? ">=" : "==="
      return '(' + suitOps(op, num, suits).join(' || ') + ')';
    }
  / op:$("<" "="?) _ num:[0-9] suits:(suitSet / suit+) {
      return suitOps(op, num, suits).join(' && ');
    }
  / a:[0-9] "-" b:[0-9] suits:(suitSet / suit+) {
    return suitOps(">=", a, suits).join(' && ') + ' && ' +
      suitOps("<=", b, suits).join(' && ');
  }

suitSet
  = "X"i { return ['clubs', 'diamonds', 'hearts', 'spades'] }
  / "M"  { return ['hearts', 'spades'] }
  / "m"  { return ['clubs', 'diamonds'] }
  / "P"i { return ['diamonds', 'spades'] }
  / "R"i { return ['clubs', 'hearts'] }

distribution
  = any:"any"? _ dist:[0-9]|4| {
    if (any) {
      return `dir.isShapeAny(${dist.join(', ')})`
    }
    return `dir.isShape(${dist.join(', ')})`
  }
__
  = $WS+

_
  = $WS*

WS
  = [ \t]

CRLF
  = "\r\n"
  / "\n"

EOL
  = CRLF
  / !.

identifier
  = $(XID_Start XID_Continue*)

XID_Start
  = c:ValidSourceCharacter &{ return /\p{XID_Start}/u.test(c) }

XID_Continue
  = c:ValidSourceCharacter &{ return /\p{XID_Continue}/u.test(c) }

ValidSourceCharacter
  = _SourceCharacterLow
  / _SurrogatePair

// Not surrogates
_SourceCharacterLow
  = [\u0000-\uD7FF\uE000-\uFFFF]

_SurrogatePair
  = $( [\uD800-\uDBFF][\uDC00-\uDFFF] )
