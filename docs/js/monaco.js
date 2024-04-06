export let model = null;
export let editor = null;
export function initMonaco(elemId, onChange) {
    return new Promise((resolve, reject) => {
        require(['vs/editor/editor.main'], () => {
            editor = monaco.editor.create(document.getElementById(elemId), {
                language: 'javascript',
                theme: 'vs-dark',
                fontSize: 16,
                tabSize: 2,
                minimap: { enabled: false },
            });
            model = editor.getModel();
            model.onDidChangeContent(onChange);
            resolve([editor, model]);
        });
    });
}
