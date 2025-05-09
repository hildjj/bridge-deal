export let model = null;
export let editor = null;
export function initMonaco(elemId, onChange) {
    return new Promise((resolve, _reject) => {
        require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs',
            },
        });
        require(['vs/editor/editor.main'], () => {
            monaco.languages.register({ id: 'bridge-deal' });
            monaco.languages.setMonarchTokensProvider('bridge-deal', {
                defaultToken: 'source',
                tokenizer: {
                    root: [
                        [/[a-z_$][\w$]*/, { cases: {
                                    '@typeKeywords': 'keyword',
                                    '@keywords': 'keyword',
                                    '@default': 'identifier',
                                } }],
                        { include: '@whitespace' },
                        [/@symbols/, { cases: {
                                    '@operators': 'operator',
                                    '@default': '',
                                } }],
                        [/\d+/, 'number'],
                    ],
                    whitespace: [
                        [/[ \t\r\n]+/, ''],
                        [/\/\/.*$/m, 'comment'],
                    ],
                },
                symbols: /[=><!~?:&|+\-*/^%]+/,
                keywords: [
                    'bid', 'vuln', 'dealer',
                ],
                typeKeywords: [
                    'north', 'south', 'east', 'west',
                ],
                operators: [
                    '<=', '>=', '=', '+', '%', '$', ',',
                ],
            });
            editor = monaco.editor.create(document.getElementById(elemId), {
                detectIndentation: false,
                fontSize: 16,
                language: 'bridge-deal',
                minimap: { enabled: false },
                tabSize: 2,
                theme: 'vs-dark',
            });
            model = editor.getModel();
            model.onDidChangeContent(onChange);
            resolve([editor, model, monaco]);
        });
    });
}
