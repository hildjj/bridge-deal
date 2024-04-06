export let model: any = null;
export let editor: any = null;

export function initMonaco(
  elemId: string,
  onChange: () => void
): Promise<[editor: any, model: any]> {
  return new Promise((resolve, reject) => {
    // @ts-expect-error require is provided by loader.min.js.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(['vs/editor/editor.main'], () => {
      // @ts-expect-error monaco is provided by require
      editor = monaco.editor.create(
        document.getElementById(elemId),
        {
          detectIndentation: false,
          fontSize: 16,
          language: 'javascript',
          minimap: {enabled: false},
          tabSize: 2,
          theme: 'vs-dark',
        }
      );
      model = editor.getModel();
      model.onDidChangeContent(onChange);
      resolve([editor, model]);
    });
  });
}
