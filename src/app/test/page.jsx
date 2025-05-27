"use client"
import React, { useState, useEffect, useRef } from 'react';
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';

const ChatWidget = () => {
  const theme = {
    background: '#ffffff',
    fontFamily: 'Geist Sans, sans-serif',
    headerBgColor: '#854fff',
    headerFontColor: '#fff',
    headerFontSize: '16px',
    botBubbleColor: '#854fff',
    botFontColor: '#fff',
    userBubbleColor: '#f2f2f2',
    userFontColor: '#333',
  };

  // Track conversation state
  const [currentInputType, setCurrentInputType] = useState('text');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  
  // Create dynamic steps based on the conversation
  const generateSteps = () => {
    // Base steps that will always be included
    const baseSteps = [
      {
        id: 'start',
        message: 'Hi, how can I help you today?',
        trigger: 'requestInputType',
      },
      {
        id: 'requestInputType',
        message: 'What would you like to do?',
        trigger: 'selectInputType',
      },
      {
        id: 'selectInputType',
        options: [
          { value: 'text', label: 'Send a message', trigger: 'textInput' },
          { value: 'file', label: 'Upload a file', trigger: 'fileInput' },
          { value: 'date', label: 'Select a date', trigger: 'dateInput' },
        ],
      },
    ];

    // Dynamic steps based on input type
    const dynamicSteps = [
      {
        id: 'textInput',
        component: <CustomInput inputType="text" />,
        waitAction: true,
        trigger: 'processInput',
      },
      {
        id: 'fileInput',
        component: <CustomInput inputType="file" />,
        waitAction: true,
        trigger: 'processInput',
      },
      {
        id: 'dateInput',
        component: <CustomInput inputType="date" />,
        waitAction: true,
        trigger: 'processInput',
      },
      {
        id: 'processInput',
        component: <ProcessInput />,
        waitAction: true,
        trigger: 'requestInputType',
      },
    ];

    return [...baseSteps, ...dynamicSteps];
  };

  return (
    <ThemeProvider theme={theme}>
      <ChatBot
        steps={generateSteps()}
        recognitionEnable={false}
        hideSubmitButton={true}
        floating={true}
        opened={true}
        floatingIcon={<MessageSquare size={30} color="white" />}
        floatingStyle={{
          backgroundColor: 'var(--primary-color)',
          borderRadius: '50%',
          width: '10px',
          height: '60px',
          bottom: '20px',
          right: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
        borderRadius={'0px'}
        cache={false}
        hideUserAvatar={true}
        botDelay={800}
        headerTitle="Holiday Checker"
        userDelay={0}
      />
    </ThemeProvider>
  );
};

// Custom input component that can render different input types
const CustomInput = ({ inputType, triggerNextStep }) => {
  const [value, setValue] = useState('');
  const [base64Data, setBase64Data] = useState('');
  const fileInputRef = useRef(null);
  
  const handleTextChange = (e) => {
    setValue(e.target.value);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result;
        setBase64Data(base64String);
        setValue(file.name); // Set the display value to file name
      };
      reader.onerror = (error) => {
        console.error('Error converting file to base64:', error);
      };
    }
  };
  
  const handleDateChange = (e) => {
    setValue(e.target.value);
  };
  
  const handleSubmit = () => {
    // Trigger next step with the appropriate value
    const submitValue = inputType === 'file' ? base64Data : value;
    
    if (value) {
      triggerNextStep({ value: submitValue, inputType });
    }
  };
  
  // Render appropriate input based on type
  let inputField;
  switch (inputType) {
    case 'file':
      inputField = (
        <div className="file-input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="file-input"
            style={{ 
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '3px',
              border: '1px solid #ccc' 
            }}
          />
          <div className="file-name">{value}</div>
        </div>
      );
      break;
    case 'date':
      inputField = (
        <input
          type="date"
          onChange={handleDateChange}
          className="date-input"
          style={{ 
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '3px',
            border: '1px solid #ccc' 
          }}
        />
      );
      break;
    default: // text input
      inputField = (
        <input
          type="text"
          onChange={handleTextChange}
          className="text-input"
          placeholder="Type your message..."
          style={{ 
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '3px',
            border: '1px solid #ccc' 
          }}
        />
      );
  }
  
  return (
    <div className="custom-input">
      {inputField}
      <button
        onClick={handleSubmit}
        className="submit-button"
        style={{
          backgroundColor: '#854fff',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Submit
      </button>
    </div>
  );
};

// Component to process the input and determine next steps
const ProcessInput = ({ steps, triggerNextStep }) => {
  const [response, setResponse] = useState('Processing your input...');
  
  useEffect(() => {
    const lastUserStep = Object.values(steps).reverse()
      .find(step => step.value && step.id !== 'processInput');
      
    if (!lastUserStep) {
      setResponse("I didn't receive any input. Let's try again.");
      triggerNextStep();
      return;
    }
    
    const userValue = lastUserStep.value;
    const inputType = lastUserStep.inputType || 'text';
    
    // Process based on input type
    const processInput = async () => {
      try {
        // Here you would typically call your API with the input
        // For demo purposes, we'll just echo back the input type and value
        
        let displayResponse = '';
        
        switch (inputType) {
          case 'file':
            // If it's a file, we'd typically send the base64 to the backend
            // For demo, just show that we received a file
            displayResponse = `Received your file. Processing...`;
            break;
          case 'date':
            displayResponse = `You selected the date: ${userValue}`;
            break;
          default:
            displayResponse = `You said: "${userValue}"`;
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResponse(displayResponse);
        
        // After processing, trigger the next step
        setTimeout(() => {
          triggerNextStep();
        }, 2000);
        
      } catch (error) {
        console.error('Error processing input:', error);
        setResponse('Sorry, there was an error processing your input.');
        triggerNextStep();
      }
    };
    
    processInput();
  }, [steps, triggerNextStep]);
  
  return <div>{response}</div>;
};

export default ChatWidget;