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
Promise.all([import('./card.js'), wasmReady]).then(([{ Deal, findDeal, prec2d, }]) => {
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
    addEventListener('message', (e) => {
        let d = undefined;
        let tries = 0;
        if (e.data) {
            d = new Deal(e.data);
        }
        else {
            [d, tries] = findDeal(prec2d);
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
