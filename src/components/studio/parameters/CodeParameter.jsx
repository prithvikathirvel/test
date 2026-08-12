"use client"
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useState, useCallback } from "react";
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { Box } from '@mui/material';
import ParameterHeader from './common/ParameterHeader';
import { Code } from 'lucide-react';

const CodeParameter = ({ parameters, param = {}, onUpdate }) => {
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
        <Box className="w-full">
            {param.key && (
                <ParameterHeader
                    title={param.key}
                    description={param.description}
                    icon={<Code size={16} />}
                />
            )}
            {/* Height is content-driven between a comfortable floor and a
                viewport-relative ceiling. The previous fixed `60vh` + `300px`
                floor forced a tall editor even for a two-line snippet, which
                pushed the rest of the parameter panel out of view. */}
            <CodeMirror
                value={localValue}
                height="auto"
            minHeight="220px"
            maxHeight="55vh"
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
        </Box>
    )
}

export default CodeParameter;