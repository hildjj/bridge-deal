export let model = null;
export let editor = null;
export function initMonaco(elemId, onChange) {
    return new Promise((resolve, reject) => {
        require(['vs/editor/editor.main'], () => {
            editor = monaco.editor.create(document.getElementById(elemId), {
                detectIndentation: false,
                fontSize: 16,
                language: 'javascript',
                minimap: { enabled: false },
                tabSize: 2,
                theme: 'vs-dark',
            });
            model = editor.getModel();
            model.onDidChangeContent(onChange);
            resolve([editor, model]);
        });
    });
}
