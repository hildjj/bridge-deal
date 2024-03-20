"use strict";
const work = new Worker('./js/worker.js', { type: 'module' });
const hv = document.getElementById('handviewer');
const btn = document.getElementById('btnNext');
const prev = document.getElementById('btnPrev');
const tries = document.getElementById('tries');
if (!hv || !btn || !prev || !work || !tries) {
    throw new Error('Element not found');
}
work.onmessage = (e) => {
    const hp = hv.parentElement;
    hv.remove();
    hv.src = e.data.lin;
    hp?.append(hv);
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
};
function nextDeal(num) {
    work.postMessage(num);
}
addEventListener('popstate', ev => {
    if (ev.state) {
        nextDeal(ev.state);
    }
});
prev.onclick = () => history.back();
btn.onclick = () => nextDeal();
prev.disabled = history.length < 2;
const { hash } = window.location;
if (hash) {
    nextDeal(BigInt(`0x${hash.replace(/^#/, '')}`));
}
else {
    nextDeal();
}
