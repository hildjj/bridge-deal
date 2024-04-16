#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises';
import {parse} from '../docs/js/deal.js';

const hands = new URL('../hands/', import.meta.url);
for (const f of await fs.readdir(hands)) {
  if (/\.deal$/.test(f)) {
    const source = new URL(f, hands);
    const text = await fs.readFile(source, 'utf8');
    try {
      const res = parse(text, {
        grammarSource: source,
      });
      const out = new URL(`${source.toString()}.js`);
      await fs.writeFile(out, res);
    } catch (er) {
      if (typeof er.format === 'function') {
        console.error(er.format([{source, text}]));
      }
    }
  }
}
