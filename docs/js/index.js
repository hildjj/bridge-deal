import { Storage } from './storage.js';
import { compressString, decompressString } from './encode.js';
import { Deal } from './card.js';
import { initMonaco } from './monaco.js';
const db = new Storage();
let editor = null;
let model = null;
let monaco = null;
let work = null;
let codeLastStored = NaN;
let state = {
    name: '',
    num: -1n,
    stamp: Date.now(),
};
const history = [];
const add = document.getElementById('btnAdd');
const bidding = document.getElementById('bidding');
const copy = document.getElementById('btnCopy');
const copyFilter = document.getElementById('btnCopyFilter');
const del = document.getElementById('btnDelete');
const diag = document.getElementById('diag');
const diagFilter = document.getElementById('diagFilter');
const diagMessage = document.getElementById('diagMessage');
const error = document.getElementById('error');
const files = document.getElementById('files');
const nxt = document.getElementById('btnNext');
const parResults = document.getElementById('parResults');
const parScore = document.getElementById('parScore');
const prev = document.getElementById('btnPrev');
const rename = document.getElementById('btnRename');
const share = document.getElementById('btnShare');
const tries = document.getElementById('tries');
const holdings = document.querySelectorAll('.holding');
const points = document.querySelectorAll('.points');
const out = document.querySelectorAll('.out');
if (!add || !bidding || !copy || !copyFilter || !del || !diag || !diagFilter ||
    !diagMessage || !error || !files || !nxt || !parResults || !parScore ||
    !prev || !rename || !share || !tries) {
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
        o.innerText = '';
    }
    for (const b of document.querySelectorAll('.bid')) {
        b.remove();
    }
    for (const b of document.querySelectorAll('.bidDir')) {
        b.classList.remove('vuln');
    }
    bidding.style.visibility = 'hidden';
    tries.innerText = '';
    error.innerText = '';
    parResults.innerText = '';
    parScore.innerText = '';
    monaco.editor.removeAllMarkers('web');
}
function snap() {
    const shot = model.createSnapshot();
    let code = '';
    let block = shot.read();
    while (block) {
        code += block;
        block = shot.read();
    }
    return code;
}
function fileOption(text) {
    for (const opt of files.options) {
        if (opt.text === text) {
            return opt;
        }
    }
    return undefined;
}
function fileSelect(text) {
    let i = 0;
    for (const opt of files.options) {
        if (opt.text === text) {
            files.selectedIndex = i;
            break;
        }
        i++;
    }
}
async function nextDeal(num) {
    state.num = num ?? -1n;
    clear();
    if (codeLastStored !== state.stamp) {
        codeLastStored = state.stamp;
        await db.putJS({
            name: state.name,
            stamp: state.stamp,
            code: snap(),
        });
    }
    db.putState(state);
    work?.postMessage(state);
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
let diagResolve = null;
diag.onclose = () => {
    diagResolve?.(diag.returnValue ? diagFilter.value : null);
};
function diagPrompt(msg, filter) {
    return new Promise(resolve => {
        diag.returnValue = '';
        diagMessage.innerText = msg;
        diagFilter.value = filter;
        diagResolve = resolve;
        diag.showModal();
    });
}
async function gotMessage(e) {
    const typ = e.data.type;
    if (typ === 'ready') {
        const u = new URL(window.location.href);
        let name = u.searchParams.get('name');
        const stamp = u.searchParams.get('stamp');
        const code = u.searchParams.get('code');
        if (name && stamp && code) {
            const ns = parseInt(stamp, 10);
            const newJs = await decompressString(code);
            if (fileOption(name)) {
                const js = await db.getJS(name, ns);
                if (js?.code === newJs) {
                    fileSelect(name);
                    name = null;
                }
                else {
                    name = await diagPrompt('Replace or rename?', name);
                }
            }
            if (name) {
                if (!fileOption(name)) {
                    files.add(new Option(name));
                }
                fileSelect(name);
                state.name = name;
                state.stamp = ns;
                model.setValue(newJs);
            }
        }
        const keys = [...u.searchParams.keys()];
        for (const k of keys) {
            u.searchParams.delete(k);
        }
        if (u.hash) {
            const num = BigInt(`0x${u.hash.replace(/^#/, '')}`);
            window.history.replaceState(num, '', u);
            await nextDeal(num);
        }
        else {
            window.history.replaceState(-1n, '', u);
            await nextDeal();
        }
        return;
    }
    if (typ === 'deal') {
        const deal = Deal.fromJSON(e.data.deal);
        state.num = deal.num;
        for (const h of deal.hands) {
            for (const [suit, cards] of h.suits()) {
                const holding = document.querySelector(`#${h.dir}${suit}`);
                if (holding) {
                    holding.innerText = cards.map(c => c.rank).join('');
                }
            }
            const nm = document.querySelector(`#${h.dir}Name`);
            if (nm) {
                nm.innerText = h.name;
            }
            const pts = document.querySelector(`#${h.dir}Points`);
            if (pts) {
                pts.innerText = String(h.points);
            }
        }
        const vulnDirs = {
            All: ['north', 'south', 'east', 'west'],
            None: [],
            NS: ['north', 'south'],
            EW: ['east', 'west'],
        }[deal.vuln] ?? [];
        for (const v of vulnDirs) {
            const dirDiv = document.querySelector(`#${v}Bid`);
            if (dirDiv) {
                dirDiv.classList.add('vuln');
            }
        }
        if (deal.bids.length > 0) {
            let i = 0;
            for (const bid of deal.bids) {
                const div = document.createElement('div');
                div.innerText = bid.toString(true);
                if (!i++) {
                    div.style.gridColumnStart = {
                        west: '1',
                        north: '2',
                        east: '3',
                        south: '4',
                    }[deal.dealer];
                }
                div.classList.add('bid');
                if (bid.level !== 0) {
                    div.classList.add('notPass');
                }
                if (bid.alert) {
                    div.classList.add('alert');
                }
                if (bid.description) {
                    div.title = bid.description;
                }
                bidding.appendChild(div);
            }
            bidding.style.visibility = 'visible';
        }
        const u = new URL(window.location.href);
        u.hash = state.num.toString(16);
        window.history.replaceState(state.num, '', u);
        document.title = `Bridge Dealer - ${u.hash}`;
        copy.classList.remove('md-inactive');
        copy.disabled = false;
        if (e.data.tries) {
            tries.innerHTML = `Found deal after <code>${e.data.tries.toLocaleString()}</code> tries.`;
        }
        return;
    }
    if (typ === 'tricks') {
        if (e.data.sess.sockref !== state.num.toString(16)) {
            return;
        }
        let i = 0;
        for (const dir of ['North', 'South', 'East', 'West']) {
            for (const trump of ['NT', 'Spades', 'Hearts', 'Diamonds', 'Clubs']) {
                const tricks = parseInt(e.data.sess.ddtricks[i++], 16);
                const outDir = document.querySelector(`#out${dir}${trump}`);
                if (outDir) {
                    outDir.innerText = (tricks > 6) ? String(tricks - 6) : '-';
                }
            }
        }
        parResults.innerText = parContract(e.data.contractsNS);
        parScore.innerText = e.data.scoreNS;
        return;
    }
    if (typ === 'error') {
        if (e.data.location) {
            error.innerText = 'Deal syntax error';
            const { start, end } = e.data.location;
            monaco.editor.setModelMarkers(model, 'web', [{
                    startLineNumber: start.line,
                    startColumn: start.column,
                    endLineNumber: end.line,
                    endColumn: end.column,
                    message: e.data.error.message,
                    severity: monaco.MarkerSeverity.Error,
                }]);
        }
        else {
            error.innerText = e.data.error.message;
        }
        return;
    }
    error.innerText = `Invalid message type: "${typ}"`;
}
db.init().then(async () => {
    ([editor, model, monaco] = await initMonaco('monaco', () => {
        state.stamp = Date.now();
        monaco.editor.removeAllMarkers('web');
    }));
    editor.addAction({
        id: 'bridge-deal-next',
        label: 'Next Deal',
        keybindings: [
            monaco.KeyMod.WinCtrl | monaco.KeyCode.KeyN,
        ],
        contextMenuGroupId: 'navigation',
        run: () => nextDeal(),
    });
    state = await db.getState();
    const names = await db.getJSnames();
    names.sort();
    let i = 0;
    let index = 0;
    for (const n of names) {
        const selected = (n === state.name);
        files.add(new Option(n));
        if (selected) {
            index = i;
        }
        i++;
    }
    files.selectedIndex = index;
    const js = await db.getJS(state.name, state.stamp);
    if (js) {
        model.setValue(js.code);
    }
    work = new Worker('./js/worker.js');
    work.onmessage = gotMessage;
});
prev.onclick = () => {
    const last = history.pop();
    if (last !== undefined) {
        if (history.length === 0) {
            prev.classList.add('md-inactive');
            prev.disabled = true;
        }
        nextDeal(last);
    }
};
copy.onclick = () => {
    navigator.clipboard.writeText(window.location.href);
};
nxt.onclick = () => {
    prev.classList.remove('md-inactive');
    prev.disabled = false;
    history.push(state.num);
    nextDeal();
};
rename.onclick = async () => {
    const name = await diagPrompt('New name?', state.name);
    if (name !== null) {
        const opt = files.item(files.selectedIndex);
        if (opt) {
            opt.text = name;
        }
        await db.delJS(state.name);
        state.name = name;
        state.stamp = Date.now();
        nextDeal();
    }
};
copyFilter.onclick = async () => {
    const name = await diagPrompt('Save as?', state.name);
    if (!name) {
        return;
    }
    state.name = name;
    state.stamp = Date.now();
    files.add(new Option(name));
    files.selectedIndex = files.options.length - 1;
    nextDeal();
};
share.onclick = async () => {
    const u = new URL(window.location.href);
    u.hash = '';
    u.searchParams.append('name', state.name);
    u.searchParams.append('stamp', String(state.stamp));
    u.searchParams.append('code', await compressString(snap()));
    await navigator.clipboard.writeText(u.href);
};
async function newFilter() {
    let defName = 'Filter';
    for (let i = 0; i < 1000; i++) {
        defName = `Filter ${i}`;
        if (!fileOption(defName)) {
            break;
        }
    }
    const name = await diagPrompt('New name?', defName) || defName;
    files.add(new Option(name));
    model.setValue('return true');
    files.selectedIndex = files.options.length - 1;
    state.name = name;
    state.stamp = Date.now();
    await nextDeal();
}
del.onclick = async () => {
    let opt = files.item(files.selectedIndex);
    if (opt) {
        const old = opt.text;
        files.remove(files.selectedIndex);
        files.selectedIndex = 0;
        await db.delJS(old);
        if (files.options.length > 0) {
            opt = files.item(0);
            if (opt) {
                const code = await db.getJS(opt.text, Date.now());
                if (!code) {
                    error.innerText = `Unknown filter "${opt.text}"`;
                    return;
                }
                state.stamp = code.stamp;
                state.name = code.name;
                model.setValue(code.code);
                nextDeal();
            }
        }
        else {
            await newFilter();
        }
    }
};
add.onclick = newFilter;
window.onkeydown = (ev) => {
    if (ev.isComposing || ev.keyCode === 229) {
        return true;
    }
    if (ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        switch (ev.key) {
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
files.onchange = async (ev) => {
    await db.putJS({
        name: state.name,
        stamp: state.stamp,
        code: snap(),
    });
    const name = files.item(files.selectedIndex)?.value;
    if (name) {
        const code = await db.getJS(name, Date.now());
        if (code) {
            state.name = name;
            state.stamp = code.stamp;
            model?.setValue(code.code);
            editor?.setScrollTop(0, 1);
            nextDeal();
        }
    }
};
