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
          language: 'javascript',
          theme: 'vs-dark',
          fontSize: 16,
          tabSize: 2,
          minimap: {enabled: false},
        }
      );
      model = editor.getModel();
      model.onDidChangeContent(onChange);
      resolve([editor, model]);
    });
  });
}
