import {
  bytesToBase64url,
  compressString,
  decompressString,
} from '../docs/js/encode.js';
import {equal} from 'node:assert';
import {test} from 'node:test';

test('bytesToBase64url', () => {
  const u8 = new Uint8Array([0xfb, 0xf6]);
  equal(bytesToBase64url(u8.buffer), '-_Y');
});

test('compressString', async() => {
  const c = await compressString('north\n  13-15, balanced\n  bid 1N: 13-15');
  equal(c, 'eJzLyy8qyeBSUDA01jU01VFISsxJzEtOTQGKJGWmKBj6WUFkANtJCkw');
});

test('decompressString', async() => {
  const c = await decompressString('eJzLyy8qyeBSUDA01jU01VFISsxJzEtOTQGKJGWmKBj6WUFkANtJCkw');
  equal(c, 'north\n  13-15, balanced\n  bid 1N: 13-15');
});
