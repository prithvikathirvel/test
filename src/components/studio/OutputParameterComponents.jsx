import React from 'react'; 
import { Box, Typography } from '@mui/material';

const OutputParameterComponents = ({ param }) => {
    const greenColor = '#a2fca2';

    const formatJsonWithStyling = (data) => {
        try {
            let jsonString = JSON.stringify(data, null, 2);
            
            // First color all the values in green (including arrays and nested objects)
            jsonString = jsonString.replace(
                /: (.*?)(?=,|\n|$)/g,
                (match, value) => `: <span style="color: ${greenColor}">${value}</span>`
            );

            // Then color the keys and structural elements in white
            jsonString = jsonString
                .replace(/({|}|\[|\])/g, '<span style="color: white">$1</span>')
                .replace(
                    /"([^"]+)":/g,
                    '<span style="color: white">"$1"</span><span style="color: white">:</span>'
                );

            return jsonString;
        } catch (error) {
            return 'Invalid JSON';
        }
    };

    return (
        <Box className="bg-[#333333] h-auto rounded-sm p-4">
            {formatJsonWithStyling(param).split('\n').map((line, index) => (
                // <Typography 
                <Typography 
                    key={index} 
                    component="div" 
                    sx={{ 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                    }}
                    dangerouslySetInnerHTML={{ __html: line }}
                />
            ))}
        </Box>
    );
};

export default OutputParameterComponents;