const b64ToUrl: {[key: string]: string} = {
  '+': '-',
  '/': '_',
  '=': '',
};

const urlToB64: {[key: string]: string} = {
  '-': '+',
  '_': '/',
};

export function bytesToBase64url(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  // https://developer.mozilla.org/en-US/docs/Glossary/Base64
  const binString = Array.from(
    u8,
    (byte: number): string => String.fromCodePoint(byte)
  ).join('');
  return btoa(binString).replace(
    /[+/=]/g,
    (s: string): string => b64ToUrl[s]
  );
}

/**
 * Compress text by utf-8 encoding, deflating, then base64url encoding.
 *
 * @param txt String to compress.
 * @returns base64url string.
 */
export async function compressString(txt: string): Promise<string> {
  const te = new TextEncoderStream();
  const rd = te.readable.pipeThrough(new CompressionStream('deflate'));
  const w = te.writable.getWriter();
  await w.write(txt);
  await w.close();
  const r = new Response(rd);
  return bytesToBase64url(await r.arrayBuffer());
}

export async function decompressString(compressed: string): Promise<string> {
  let b64 = compressed.replace(
    /[_-]/g,
    (s: string): string => (urlToB64[s] ?? s)
  );
  while (b64.length % 4) {
    b64 += '=';
  }
  const resp = await fetch(`data:text/javascript;base64,${b64}`);
  const dec = resp.body?.pipeThrough(new DecompressionStream('deflate'));

  const res = new Response(dec);
  return res.text();
}
