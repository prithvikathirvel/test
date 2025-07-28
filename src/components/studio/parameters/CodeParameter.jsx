"use client"
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useState, useCallback } from "react";
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

const CodeParameter = ({ parameters, param, onUpdate }) => {
    const [localValue, setLocalValue] = useState(param?.value || "// Write your code here\nconsole.log('Hello, CodeMirror!');");
    
    const handleChange = useCallback((value) => {
        setLocalValue(value);
        const updatedParams = parameters.map(p => 
            p.key === param.key ? { ...p, value } : p
        );
        onUpdate(updatedParams, param, true);
    }, [parameters, param, onUpdate]);
    
    const extensions = [
        javascript({
            jsx: true,
            typescript: true,
        })
    ];
    
    return (
        <CodeMirror
            value={localValue}
            height="60vh"
            minHeight="300px"
            maxHeight="80vh"
            width="100%"
            extensions={extensions}
            onChange={handleChange}
            theme={vscodeDark}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
                bracketMatching: true,
                autocompletion: true,
                indentOnInput: true,
                tabSize: 2,
                closeBrackets: true,
                highlightSelectionMatches: true,
                searchKeymap: true,
            }}
            autoFocus
            indentWithTab={true}
        />
    )
}

export default CodeParameter;