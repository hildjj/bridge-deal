// This isn't actually ES6, because I can't recompile the WASM wrapper.

// import {Deal, findDeal, prec2d} from './card.js';

// Has to be var for stinky non-modularized emscripten output.
// eslint-disable-next-line no-var
var Module: any = null;
const wasmReady = new Promise<void>((resolve, reject) => {
  // eslint-disable-next-line no-var
  Module = {
    onAbort(...args: any): void {
      // eslint-disable-next-line no-console
      console.error('Abort', ...args);
    },
    onRuntimeInitialized(): void {
      resolve();
    },
  };
  importScripts('./dds.js'); // Magic happens to add to Module.
});

Promise.all([import('./card.js'), wasmReady]).then(([{
  Deal,
  findDeal,
  prec2d,
}]) => {
  const handleDDSRequest = Module.cwrap(
    'handleDDSRequest',
    'string',
    [
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
    ]
  );

  addEventListener('message', (e): void => {
    let d: any = undefined;
    let tries = 0;
    if (e.data) {
      d = new Deal(e.data);
    } else {
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
// eslint-disable-next-line no-console
}, console.error);

