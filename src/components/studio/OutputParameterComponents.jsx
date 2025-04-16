import React from 'react';
import { truncateLongStrings } from '@/utils/commonFunction';


const OutputParameterComponents = ({ param }) => {
  
  const greenColor = '#a2fca2';   // String values (as requested)
  const whiteColor = '#ffffff';   // Keys and structural elements
  const blueColor = '#71ADFF';    // Numbers
  const yellowColor = '#FFD700';  // Booleans
  const redColor = '#FF6B6B';     // Null values

  const formatJsonWithStyling = (data) => {
    try {
      const truncatedData = truncateLongStrings(data, 300);
      let jsonString = JSON.stringify(truncatedData, null, 2);
      
      jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      jsonString = jsonString
        .replace(/: null/g, ': <span style="color: ' + redColor + '">null</span>')
        
        .replace(/: (true|false)/g, (match, value) => 
          ': <span style="color: ' + yellowColor + '">' + value + '</span>')
        
        .replace(/: (-?\d+(\.\d+)?([eE][+-]?\d+)?)/g, (match, value) => 
          ': <span style="color: ' + blueColor + '">' + value + '</span>')
        
        .replace(/: "([^"]*)"/g, (match, value) => 
          ': <span style="color: ' + greenColor + '">"' + value + '"</span>')
        
        .replace(/({|}|\[|\])/g, '<span style="color: ' + whiteColor + '">$1</span>')
        
        .replace(/"([^"]+)":/g, 
          '<span style="color: ' + whiteColor + '">"$1"</span><span style="color: ' + whiteColor + '">:</span>');

      return jsonString;
    } catch (error) {
      console.error('Error formatting JSON:', error);
      return 'Invalid JSON';
    }
  };

  return (
    <div className="!h-dvh bg-[#1E1E1E] rounded-md p-4 overflow-auto">
      <pre className="font-mono text-sm whitespace-pre-wrap">
        {formatJsonWithStyling(param).split('\n').map((line, index) => (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        ))}
      </pre>
    </div>
  );
};

export default OutputParameterComponents;
