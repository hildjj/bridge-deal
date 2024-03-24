import { Deal } from './card.js';
const work = new Worker('./js/worker.js');
const btn = document.getElementById('btnNext');
const prev = document.getElementById('btnPrev');
const tries = document.getElementById('tries');
const parResults = document.getElementById('parResults');
const parScore = document.getElementById('parScore');
const holdings = document.querySelectorAll('.holding');
const points = document.querySelectorAll('.points');
const out = document.querySelectorAll('.out');
if (!btn || !prev || !work || !tries || !parResults || !parScore) {
    throw new Error('Element not found');
}
function clear() {
    for (const h of holdings) {
        h.innerText = '';
    }
    for (const p of points) {
        p.innerText = '-';
    }
    for (const o of out) {
        o.innerText = '-';
    }
    parResults.innerText = '';
    parScore.innerText = '';
}
function nextDeal(num) {
    clear();
    work.postMessage(num);
}
function plusMinus(str) {
    if (str.length < 3) {
        return str;
    }
    const firstNum = Number(str.charAt(0));
    const lastNum = Number(str.charAt(str.length - 2));
    return `${str.charAt(0) + str.charAt(str.length - 1)}+${lastNum - firstNum}`;
}
function parContract(str) {
    return str
        .replace(/[0-9]+[CDHSN]/g, n => plusMinus(n))
        .replace(/^(?:NS|EW):/, '');
}
work.onmessage = (e) => {
    if (e.data === 'ready') {
        const { hash } = window.location;
        if (hash) {
            nextDeal(BigInt(`0x${hash.replace(/^#/, '')}`));
        }
        else {
            nextDeal();
        }
        return;
    }
    if (typeof e.data.num === 'bigint') {
        const deal = new Deal(e.data.num);
        for (const h of deal.hands) {
            for (const [suit, cards] of h.suits()) {
                const holding = document.querySelector(`#${h.dir}${suit}`);
                if (holding) {
                    holding.innerText = cards.map(c => c.rank).join('');
                }
            }
            const pts = document.querySelector(`#${h.dir}Points`);
            if (pts) {
                pts.innerText = String(h.points);
            }
        }
        const u = new URL(window.location.href);
        u.hash = e.data.num.toString(16);
        if (history.state !== e.data.num) {
            history.pushState(e.data.num, '', u);
            document.title = `Bridge Dealer - ${u.hash}`;
        }
        if (e.data.tries) {
            tries.innerText = `Found deal after ${e.data.tries} tries.`;
        }
        else {
            tries.innerText = '';
        }
        return;
    }
    let i = 0;
    for (const dir of ['North', 'South', 'East', 'West']) {
        for (const trump of ['NT', 'Spades', 'Hearts', 'Diamonds', 'Clubs']) {
            const tricks = parseInt(e.data.sess.ddtricks[i++], 16);
            if (tricks > 6) {
                const outDir = document.querySelector(`#out${dir}${trump}`);
                if (outDir) {
                    outDir.innerText = String(tricks - 6);
                }
            }
        }
    }
    parResults.innerText = parContract(e.data.contractsNS);
    parScore.innerText = e.data.scoreNS;
};
addEventListener('popstate', ev => {
    if (ev.state) {
        nextDeal(ev.state);
    }
});
prev.onclick = () => {
    if (history.state) {
        history.back();
    }
};
btn.onclick = () => nextDeal();
prev.disabled = history.length < 2;
