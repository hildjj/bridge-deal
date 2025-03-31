declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var monaco: any;
  // eslint-disable-next-line vars-on-top, no-var
  var require: any;
}

export let model: any = null;
export let editor: any = null;

export function initMonaco(
  elemId: string,
  onChange: () => void
): Promise<[editor: any, model: any, monaco: any]> {
  return new Promise((resolve, _reject) => {
    require.config({
      paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(['vs/editor/editor.main'], () => {
      monaco.languages.register({id: 'bridge-deal'});
      monaco.languages.setMonarchTokensProvider('bridge-deal', {
        defaultToken: 'source',
        tokenizer: {
          root: [
            // Identifiers and keywords
            [/[a-z_$][\w$]*/, {cases: {
              '@typeKeywords': 'keyword',
              '@keywords': 'keyword',
              '@default': 'identifier',
            }}],
            // Whitespace
            {include: '@whitespace'},

            // Delimiters and operators
            [/@symbols/, {cases: {
              '@operators': 'operator',
              '@default': '',
            }}],
            // Numbers
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

      editor = monaco.editor.create(
        document.getElementById(elemId),
        {
          detectIndentation: false,
          fontSize: 16,
          language: 'bridge-deal',
          minimap: {enabled: false},
          tabSize: 2,
          theme: 'vs-dark',
        }
      );
      model = editor.getModel();
      model.onDidChangeContent(onChange);
      resolve([editor, model, monaco]);
    });
  });
}
