"use strict";
var Module = null;
let KILL = Object
    .keys(globalThis)
    .map(k => `let ${k} = undefined;`)
    .join('\n');
KILL += 'globalThis = undefined; global = undefined;';
const pm = postMessage;
const wasmReady = new Promise((resolve, reject) => {
    Module = {
        onAbort(...args) {
            console.error('Abort', ...args);
        },
        onRuntimeInitialized() {
            resolve();
        },
    };
    importScripts('./dds.js');
});
Promise.all([import('./card.js'), import('./storage.js'), wasmReady]).then(async ([{ Deal, findDeal, }, { Storage, }]) => {
    const db = new Storage();
    await db.init();
    const handleDDSRequest = Module.cwrap('handleDDSRequest', 'string', [
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
    ]);
    const noOp = () => true;
    let filter = noOp;
    addEventListener('message', async (e) => {
        const code = await db.getJS(e.data.name, e.data.stamp);
        if (code) {
            if (code.code.trim()) {
                filter = new Function('deal', 'Deal', KILL + code.code);
            }
            else {
                filter = noOp;
            }
        }
        let d = undefined;
        let tries = 0;
        if ((typeof e.data.num === 'bigint') && (e.data.num >= 0n)) {
            d = new Deal(e.data.num);
        }
        else {
            try {
                [d, tries] = findDeal(filter);
            }
            catch (error) {
                pm({
                    type: 'error',
                    error,
                });
                return;
            }
        }
        const pbn = d.pbn();
        pm({
            type: 'deal',
            num: d.num,
            deal: d.toJSON(),
            tries,
            pbn,
        });
        const tricks = JSON.parse(handleDDSRequest(pbn, null, 'm', null, d.vuln, null, null, null, d.num.toString(16), null));
        tricks.type = 'tricks';
        pm(tricks);
    });
    pm({
        type: 'ready',
    });
}, console.error);
