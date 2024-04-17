import {
  bytesToBase64url,
  compressString,
  decompressString,
} from '../docs/js/encode.js';
import {equal} from 'node:assert';
import {test} from 'node:test';

const txt = 'north\n  13-15, balanced\n  bid 1N: 13-15';

test('bytesToBase64url', () => {
  const u8 = new Uint8Array([0xfb, 0xf6]);
  equal(bytesToBase64url(u8.buffer), '-_Y');
});

test('compressString', async() => {
  const c = await compressString(txt);
  // Incosistent output.
  // equal(c, 'eJzLyy8qyeBSUDA01jU01VFISsxJzEtOTQGKJGWmKBj6WUFkANtJCkw');
  equal(await decompressString(c), txt);
});

test('decompressString', async() => {
  const c = await decompressString('eJzLyy8qyeBSUDA01jU01VFISsxJzEtOTQGKJGWmKBj6WUFkANtJCkw');
  equal(c, txt);
});
