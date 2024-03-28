export let model = null;
export function initMonaco(elemId, onChange) {
    return new Promise((resolve, reject) => {
        require(['vs/editor/editor.main'], () => {
            const editor = monaco.editor.create(document.getElementById(elemId), {
                language: 'javascript',
                theme: 'vs-dark',
                fontSize: 16,
                minimap: false,
            });
            model = editor.getModel();
            model.onDidChangeContent(onChange);
            resolve(model);
        });
    });
}
