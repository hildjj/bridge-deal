"use strict";
var Module = null;
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
Promise.all([
    import('./card.js'),
    import('./storage.js'),
    import('./deal.js'),
    wasmReady,
]).then(async ([{ Deal, findDeal, }, { Storage, }, { parse, }]) => {
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
                try {
                    const src = parse(code.code, {
                        grammarSource: 'web',
                    });
                    if (e.data.debug) {
                        pm({
                            type: 'source',
                            src,
                        });
                    }
                    filter = new Function('deal', 'Deal', src);
                }
                catch (error) {
                    pm({
                        type: 'error',
                        error,
                        location: error.location,
                    });
                    return;
                }
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
