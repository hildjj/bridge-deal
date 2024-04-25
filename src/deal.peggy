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
  = (_ command? (_ comment)?)|.., CRLF| CRLF? { return rules.toString(); }

command
  = dealer
  / vuln
  / hand
  / setVar
  / bid
  / rule
  / comment

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
  }

suit
  = "C"i { return 'clubs'; }
  / "D"i { return 'diamonds'; }
  / "H"i { return 'hearts'; }
  / "S"i { return 'spades'; }

comment
  = "//" $commentChar*

commentChar
  = !CRLF .

description
  = desc:$normalChar+ { return desc.trim(); }

normalChar
  = !CRLF !"//" .

rule
  = not:(@"!"|0..2| _)? parts:part|1.., "," _| {
    rules.add(parts.join(' && '), not?.length ?? 0);
  }

// Return the "not" versions
part
  = holding
  / weight
  / compare
  / distribution
  / singleton
  / void
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
  / cards

hcp
  = @n:$([0-9] [0-9]?) &{ return parseInt(n, 10) <= 37; }

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
  = holdingPlus
  / holdingLess
  / holdingRange

holdingPlus
  = num:[0-9] plus:"+"? suits:(suitSet / suit+) {
      const op = plus ? ">=" : "==="
      return '(' + suitOps(op, num, suits).join(' || ') + ')';
    }

holdingLess
  = op:$("<" "="?) _ num:[0-9] suits:(suitSet / suit+) {
      return suitOps(op, num, suits).join(' && ');
    }

holdingRange
  = a:[0-9] "-" b:[0-9] suits:(suitSet / suit+) {
      return suitOps(">=", a, suits).join(' && ') + ' && ' +
        suitOps("<=", b, suits).join(' && ');
    }

suitSet
  = "X"i { return ['clubs', 'diamonds', 'hearts', 'spades'] }
  / "M"  { return ['hearts', 'spades'] }
  / "m"  { return ['clubs', 'diamonds'] }
  / "P" { return ['diamonds', 'spades'] }
  / "R" { return ['clubs', 'hearts'] }
  / "r" { return ['diamonds', 'hearts'] }
  / "b" { return ['clubs', 'spades'] }

distribution
  = any:"any"? _ dist:[0-9]|4| {
    if (any) {
      return `dir.isShapeAny(${dist.join(', ')})`
    }
    return `dir.isShape(${dist.join(', ')})`
  }

singleton
  = "singleton" {
    return `dir.hasSingleton()`;
  }

void
  = "void" {
    return `dir.hasVoid()`;
  }

cards
  = sc:suitCards|1..4, __| {
    return '(' + sc.join(' && ') + ')';
  }

suitCards
  = cards:$(suit card+) {
    return `dir.hasCards('${cards}')`;
  }

card
  = [2-9TJQKA]

__
  = WS+ {}

_
  = WS* {}

WS
  = [ \t] {}

CRLF
  = "\r\n" {}
  / "\n" {}

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
