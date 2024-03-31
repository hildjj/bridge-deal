const PREC_2D = `\
const SUIT_POINTS = [4, 3, 2, 1];
const np = deal.north.points;
if (np < 11 || np > 15) {
    return false;
}
const sp = deal.south.points;
if (sp < 11) {
    return false;
}
const ns = deal.north.shape;
if (ns.spades < 3 || ns.spades > 4 ||
    ns.hearts < 3 || ns.hearts > 4 ||
    ns.diamonds > 1 ||
    ns.clubs > 5) {
    return false;
}
if (ns.spades === 3 && ns.hearts === 3) {
    return false;
}
if ((ns.clubs === 5) && Deal.weight(deal.north.clubs, SUIT_POINTS) > 3) {
    return false;
}
deal.north.name = '2D';
deal.randVuln();
deal.bid('2D!: 11-15, ~4414')
deal.bid('P')
deal.bid('2N!: Forcing, asks clarification')

return true;
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
