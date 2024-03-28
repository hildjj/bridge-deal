"use strict";
var Module = null;
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
    let filter = () => true;
    addEventListener('message', async (e) => {
        const code = await db.getJS(e.data.name, e.data.stamp);
        if (code) {
            filter = new Function('deal', 'Deal', code.code);
        }
        let d = undefined;
        let tries = 0;
        if ((typeof e.data.num === 'bigint') && (e.data.num >= 0n)) {
            d = new Deal(e.data.num);
        }
        else {
            [d, tries] = findDeal(filter);
        }
        postMessage({
            num: d.num,
            tries,
        });
        const pbn = d.pbn();
        const tricks = JSON.parse(handleDDSRequest(pbn, null, 'm', null, 'None', null, null, null, d.num.toString(16), null));
        postMessage(tricks);
    });
    postMessage('ready');
}, console.error);
