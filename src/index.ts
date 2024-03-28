import {type State, Storage} from './storage.js';
import {Deal} from './card.js';
import {initMonaco} from './monaco.js';

// @ts-expect-error require is provided by loader.min.js.
require.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs',
  },
});

const db = new Storage();
let model: any = null;
let work: Worker | null = null;
let codeLastStored = NaN;
let state: State = {
  name: '',
  num: -1n,
  stamp: Date.now(),
};
const history: bigint[] = [];

const copy = document.getElementById('btnCopy') as HTMLButtonElement;
const files = document.getElementById('files') as HTMLSelectElement;
const nxt = document.getElementById('btnNext') as HTMLButtonElement;
const parResults = document.getElementById('parResults') as HTMLSpanElement;
const parScore = document.getElementById('parScore') as HTMLSpanElement;
const prev = document.getElementById('btnPrev') as HTMLButtonElement;
const tries = document.getElementById('tries') as HTMLSpanElement;
const holdings = document.querySelectorAll<HTMLSpanElement>('.holding');
const points = document.querySelectorAll<HTMLSpanElement>('.points');
const out = document.querySelectorAll<HTMLSpanElement>('.out');

if (!copy || !files || !nxt || !parResults || !parScore || !prev || !tries) {
  throw new Error('Element not found');
}

function clear(): void {
  for (const h of holdings) {
    h.innerText = '';
  }
  for (const p of points) {
    p.innerText = '-';
  }
  for (const o of out) {
    o.innerText = '-';
  }
  tries.innerText = '';
  parResults.innerText = '';
  parScore.innerText = '';
}

async function nextDeal(num?: bigint): Promise<void> {
  state.num = num ?? -1n;

  clear();
  if (codeLastStored !== state.stamp) {
    codeLastStored = state.stamp;
    let code = '';
    const snap = model.createSnapshot();
    let block: string = snap.read();
    while (block) {
      code += block;
      block = snap.read();
    }
    await db.putJS({
      name: state.name,
      stamp: state.stamp,
      code,
    });
  }
  db.putState(state);
  work?.postMessage(state);
}

function plusMinus(str: string): string {
  if (str.length < 3) {
    return str;
  }

  const firstNum = Number(str.charAt(0));
  const lastNum = Number(str.charAt(str.length - 2));
  return `${str.charAt(0) + str.charAt(str.length - 1)}+${lastNum - firstNum}`;
}

function parContract(str: string): string {
  return str
    .replace(/[0-9]+[CDHSN]/g, n => plusMinus(n))
    .replace(/^(?:NS|EW):/, '');
}

async function gotMessage(e: MessageEvent): Promise<void> {
  if (e.data === 'ready') {
    const {hash} = window.location;
    if (hash) {
      await nextDeal(BigInt(`0x${hash.replace(/^#/, '')}`));
    } else {
      await nextDeal();
    }
    return;
  }

  if (typeof e.data.num === 'bigint') {
    state.num = e.data.num;
    const deal = new Deal(state.num);

    for (const h of deal.hands) {
      for (const [suit, cards] of h.suits()) {
        const holding = document.querySelector<HTMLSpanElement>(`#${h.dir}${suit}`);
        if (holding) {
          holding.innerText = cards.map(c => c.rank).join('');
        }
      }
      const pts = document.querySelector<HTMLSpanElement>(`#${h.dir}Points`);
      if (pts) {
        pts.innerText = String(h.points);
      }
    }

    const u = new URL(window.location.href);
    u.hash = state.num.toString(16);
    window.history.replaceState(state.num, '', u);
    document.title = `Bridge Dealer - ${u.hash}`;
    copy.disabled = false;

    if (e.data.tries) {
      tries.innerText = `Found deal after ${e.data.tries} tries.`;
    }
    return;
  }

  if (!e.data.sess) {
    throw new Error('Bad session');
  }
  if (e.data.sess.sockref !== state.num.toString(16)) {
    return;
  }

  let i = 0;
  for (const dir of ['North', 'South', 'East', 'West']) {
    for (const trump of ['NT', 'Spades', 'Hearts', 'Diamonds', 'Clubs']) {
      const tricks = parseInt(e.data.sess.ddtricks[i++], 16);
      const outDir = document.querySelector<HTMLSpanElement>(`#out${dir}${trump}`);
      if (outDir) {
        outDir.innerText = (tricks > 6) ? String(tricks - 6) : '-';
      }
    }
  }
  parResults.innerText = parContract(e.data.contractsNS);
  parScore.innerText = e.data.scoreNS;
}

db.init().then(async() => {
  model = await initMonaco('monaco', () => {
    state.stamp = Date.now();
  });
  state = await db.getState();
  const names = await db.getJSnames();
  names.sort();
  for (const n of names) {
    files.add(new Option(n, undefined, n === state.name));
  }
  files.add(new Option('New filter'));
  const js = await db.getJS(state.name, state.stamp);
  if (js) {
    model.setValue(js.code);
  }
  work = new Worker('./js/worker.js');
  work.onmessage = gotMessage;
});

prev.onclick = (): void => {
  const last = history.pop();
  if (last !== undefined) {
    if (history.length === 0) {
      prev.disabled = true;
    }
    nextDeal(last);
  }
};

copy.onclick = (): void => {
  navigator.clipboard.writeText(window.location.href);
};

nxt.onclick = (): void => {
  prev.disabled = false;
  history.push(state.num);
  nextDeal();
};
prev.disabled = history.length < 2;

window.onkeydown = (ev: KeyboardEvent): boolean => {
  // See:
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  if (ev.isComposing || ev.keyCode === 229) {
    return true;
  }
  if (ev.ctrlKey && !ev.altKey && !ev.metaKey) {
    switch (ev.key) {
      case 'c':
        copy.click();
        break;
      case 'n':
        nxt.click();
        break;
      case 'p':
        prev.click();
        break;
      default:
        return true;
    }
    return false;
  }
  return true;
};
