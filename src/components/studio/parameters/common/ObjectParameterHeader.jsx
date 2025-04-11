"use client";
import React from 'react';
import { Code } from 'lucide-react';
import ParameterHeader from './ParameterHeader';

const ObjectParameterHeader = ({ title, description }) => (
  <ParameterHeader
    title={title}
    icon={<Code size={18} />}
    description={description}
  />
);

export default ObjectParameterHeader;
