
const PREC_2D = `\
north
  %points = 4, 3, 2, 1
  !3H, 3S
  // With good clubs and only one 4M, open 2C
  !5C, 3M, C%points > 3
  11-15, <2D, 3-4M, 4-5C
  bid 2D!: 11-15, roughly 4414
`;

export interface jsCode {
  name: string;
  stamp: number;
  code: string;
}

export interface State {
  name: string;
  num: bigint;
  stamp: number;
}

export class Storage {
  #db: IDBDatabase | undefined = undefined;
  #stamps: {
    [key: string]: number;
  } = {};

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const idb = indexedDB.open('bridge-deal', 1);
      if (typeof idb === 'number') {
        reject(new Error('No indexedDB'));
        return;
      }
      idb.onerror = reject;
      idb.onsuccess = (): void => {
        this.#db = idb.result;
        resolve();
      };
      idb.onblocked = reject;
      idb.onupgradeneeded = (): void => {
        this.#db = idb.result;
        this.#db.onerror = reject;
        this.#db
          .createObjectStore('js', {keyPath: 'name'})
          .createIndex('name', 'name', {unique: true});
        this.#db
          .createObjectStore('state');

        if (!idb.transaction) {
          reject(new Error('No transaction'));
          return;
        }
        idb.transaction.oncomplete = async(): Promise<void> => {
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

  public async putJS(code: jsCode): Promise<number> {
    if (this.#stamps[code.name] !== code.stamp) {
      await this.put('js', code);
      this.#stamps[code.name] = code.stamp;
    }
    return code.stamp;
  }

  public async getJS(name: string, stamp: number): Promise<jsCode | null> {
    if (this.#stamps[name] === stamp) {
      return null;
    }
    const js = await this.get<jsCode>('js', name);
    if (!js) {
      return null;
    }
    this.#stamps[js.name] = js.stamp;
    return js;
  }

  public async delJS(name: string): Promise<void> {
    await this.delete('js', name);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.#stamps[name];
  }

  public getJSnames(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject(new Error('Uninitialized'));
        return;
      }
      const txn = this.#db.transaction('js', 'readonly');
      const req = txn.objectStore('js').getAllKeys();
      req.onerror = reject;
      req.onsuccess = (): void => {
        resolve((req.result as string[]).sort());
      };
    });
  }

  public putState(state: State): Promise<void> {
    return this.put('state', state, 0);
  }

  public getState(): Promise<State> {
    return this.get<State>('state', 0);
  }

  private get<T>(store: string, key: IDBValidKey): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject(new Error('Uninitialized'));
        return;
      }
      const txn = this.#db.transaction(store, 'readonly');
      const req = txn.objectStore(store).get(key);
      req.onerror = reject;
      req.onsuccess = (): void => {
        resolve(req.result);
      };
    });
  }

  private put<T>(store: string, obj: T, key?: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject(new Error('Uninitialized'));
        return;
      }
      const txn = this.#db.transaction(store, 'readwrite');
      const req = txn.objectStore(store).put(obj, key);
      req.onerror = reject;
      req.onsuccess = (): void => {
        resolve();
      };
    });
  }

  private delete(store: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.#db) {
        reject(new Error('Uninitialized'));
        return;
      }
      const txn = this.#db.transaction(store, 'readwrite');
      const req = txn.objectStore(store).delete(key);
      req.onerror = reject;
      req.onsuccess = (): void => resolve();
    });
  }
}
