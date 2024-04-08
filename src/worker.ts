// This isn't actually ES6, because I can't recompile the WASM wrapper.

// Has to be var for stinky non-modularized emscripten output.
// eslint-disable-next-line no-var
var Module: any = null;

const pm = postMessage;

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

Promise.all([
  import('./card.js'),
  import('./storage.js'),
  // @ts-expect-error Don't bother with .d.ts for now
  import('./deal.js'),
  wasmReady,
]).then(async([{
  Deal,
  findDeal,
}, {
  Storage,
}, {
  parse,
}]) => {
  const db = new Storage();
  await db.init();

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

  type DealPredicate = Parameters<typeof findDeal>[0];

  const noOp = (): boolean => true;
  let filter: DealPredicate = noOp;
  addEventListener('message', async(e): Promise<void> => {
    const code = await db.getJS(e.data.name, e.data.stamp);
    if (code) {
      if (code.code.trim()) {
        try {
          const src = parse(code.code, {
            grammarSource: 'web',
          });
          console.log(src);
          // eslint-disable-next-line @stylistic/max-len
          // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
          filter = new Function('deal', 'Deal', src) as DealPredicate;
        } catch (error) {
          pm({
            type: 'error',
            error,
            location: (error as any).location,
          });
          return;
        }
      } else {
        filter = noOp;
      }
    }
    let d: any = undefined;
    let tries = 0;
    if ((typeof e.data.num === 'bigint') && (e.data.num >= 0n)) {
      d = new Deal(e.data.num);
    } else {
      try {
        [d, tries] = findDeal(filter);
      } catch (error) {
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
// eslint-disable-next-line no-console
}, console.error);

