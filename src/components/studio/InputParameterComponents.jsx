"use client";
import React from 'react';
import StringParameter from './parameters/StringParameter';
import NumberParameter from './parameters/NumberParameter';
import BooleanParameter from './parameters/BooleanParameter';
import ObjectParameter from './parameters/ObjectParameter';
import FileParameter from './parameters/FileParameter';
import ArrayParameter from './parameters/ArrayParameter';
import DropdownParameter from './parameters/DropdownParameter';
import CodeParameter from './parameters/CodeParameter';

export const getParameterComponent = (param, color, onUpdate, parameters, parameter) => {
  const props = { param, color, onUpdate, parameters, parameter };

  if (!param) {
    console.warn('Undefined parameter passed to getParameterComponent');
    return null;
  }

  console.log("parameter inside getParameterComponent", parameter);
  console.log('param', param);

  switch (param.type?.toLowerCase()) {
    case 'string':
      return <StringParameter {...props} />;
    case 'number':
      return <NumberParameter {...props} />;
    case 'boolean':
      return <BooleanParameter {...props} />;
    case 'object':  
      return <ObjectParameter {...props} />;
    case 'file':
      return <FileParameter {...props} />;
    case 'array':
      return <ArrayParameter {...props} />;
    case 'dropdown':
      return <DropdownParameter {...props} />;
    case 'code':
      return <CodeParameter {...props} />;
    default:
      return <StringParameter {...props} />;
  }
};
