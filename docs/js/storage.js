const PREC_2D = `\
north
  %points = 4, 3, 2, 1
  !3H, 3S
  // With good clubs and only one 4M, open 2C
  !5C, 3M, C%points > 3
  11-15, <2D, 3-4M, 4-5C
  bid 2D!: 11-15, roughly 4414
`;
export class Storage {
    #db = undefined;
    #stamps = {};
    init() {
        return new Promise((resolve, reject) => {
            const idb = indexedDB.open('bridge-deal', 1);
            if (typeof idb === 'number') {
                reject(new Error('No indexedDB'));
                return;
            }
            idb.onerror = reject;
            idb.onsuccess = () => {
                this.#db = idb.result;
                resolve();
            };
            idb.onblocked = reject;
            idb.onupgradeneeded = () => {
                this.#db = idb.result;
                this.#db.onerror = reject;
                this.#db
                    .createObjectStore('js', { keyPath: 'name' })
                    .createIndex('name', 'name', { unique: true });
                this.#db
                    .createObjectStore('state');
                if (!idb.transaction) {
                    reject(new Error('No transaction'));
                    return;
                }
                idb.transaction.oncomplete = async () => {
                    await this.putJS({
                        name: 'Precision 2D',
                        stamp: Date.now(),
                        code: PREC_2D,
                    }).then(() => resolve());
                    await this.putState({
                        name: 'Precision 2D',
                        num: -1n,
                        stamp: Date.now(),
                    });
                };
            };
        });
    }
    async putJS(code) {
        if (this.#stamps[code.name] !== code.stamp) {
            await this.put('js', code);
            this.#stamps[code.name] = code.stamp;
        }
        return code.stamp;
    }
    async getJS(name, stamp) {
        if (this.#stamps[name] === stamp) {
            return null;
        }
        const js = await this.get('js', name);
        if (!js) {
            return null;
        }
        this.#stamps[js.name] = js.stamp;
        return js;
    }
    async delJS(name) {
        await this.delete('js', name);
        delete this.#stamps[name];
    }
    getJSnames() {
        return new Promise((resolve, reject) => {
            if (!this.#db) {
                reject(new Error('Uninitialized'));
                return;
            }
            const txn = this.#db.transaction('js', 'readonly');
            const req = txn.objectStore('js').getAllKeys();
            req.onerror = reject;
            req.onsuccess = () => {
                resolve(req.result.sort());
            };
        });
    }
    putState(state) {
        return this.put('state', state, 0);
    }
    getState() {
        return this.get('state', 0);
    }
    get(store, key) {
        return new Promise((resolve, reject) => {
            if (!this.#db) {
                reject(new Error('Uninitialized'));
                return;
            }
            const txn = this.#db.transaction(store, 'readonly');
            const req = txn.objectStore(store).get(key);
            req.onerror = reject;
            req.onsuccess = () => {
                resolve(req.result);
            };
        });
    }
    put(store, obj, key) {
        return new Promise((resolve, reject) => {
            if (!this.#db) {
                reject(new Error('Uninitialized'));
                return;
            }
            const txn = this.#db.transaction(store, 'readwrite');
            const req = txn.objectStore(store).put(obj, key);
            req.onerror = reject;
            req.onsuccess = () => {
                resolve();
            };
        });
    }
    delete(store, key) {
        return new Promise((resolve, reject) => {
            if (!this.#db) {
                reject(new Error('Uninitialized'));
                return;
            }
            const txn = this.#db.transaction(store, 'readwrite');
            const req = txn.objectStore(store).delete(key);
            req.onerror = reject;
            req.onsuccess = () => resolve();
        });
    }
}
