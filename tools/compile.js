#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs/promises';
import {parse} from '../docs/js/deal.js';

async function compile(source) {
  const text = await fs.readFile(source, 'utf8');
  try {
    const res = parse(text, {
      grammarSource: source,
    });
    const out = `${source.toString()}.js`;
    await fs.writeFile(out, res);
  } catch (er) {
    if (typeof er.format === 'function') {
      console.error(er.format([{source, text}]));
    } else {
      throw er;
    }
  }
}

let args = process.argv.slice(2);
if (args.length === 0) {
  const hands = new URL('../hands/', import.meta.url);
  args = (await fs.readdir(hands))
    .filter(f => /\.deal$/.test(f))
    .map(f => new URL(f, hands));
}

for (const f of args) {
  await compile(f);
}
