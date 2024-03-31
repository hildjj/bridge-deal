async function bytesToBase64url(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = reader.result;
            if (typeof dataUrl === 'string') {
                const [_, base64] = dataUrl.split(',');
                resolve(base64.replace(/[+/]/g, (s) => ({
                    '+': '-',
                    '/': '_',
                    '=': '',
                }[s] ?? s)));
            }
            else {
                reject(new Error('Invalid FileReader onload event'));
            }
        };
        reader.readAsDataURL(blob);
    });
}
export async function compressString(txt) {
    const te = new TextEncoderStream();
    const rd = te.readable.pipeThrough(new CompressionStream('deflate'));
    const w = te.writable.getWriter();
    await w.write(txt);
    await w.close();
    const r = new Response(rd);
    return bytesToBase64url(await r.blob());
}
export async function decompressString(compressed) {
    const b64 = compressed.replace(/[_-]/g, (s) => ({
        '-': '+',
        '_': '/',
    }[s] ?? s));
    const resp = await fetch(`data:text/javascript;base64,${b64}`);
    const dec = resp.body?.pipeThrough(new DecompressionStream('deflate'));
    const res = new Response(dec);
    return res.text();
}
