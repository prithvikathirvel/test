"use client";
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import React, { useState, useCallback } from 'react';
import { Bot } from 'lucide-react';

const theme = {
  background: '#f5f8fb',
  fontFamily: 'Work Sans, sans-serif',
  headerBgColor: '#6e48aa',
  headerFontColor: '#fff',
  headerFontSize: '16px',
  botBubbleColor: '#6e48aa',
  botFontColor: '#fff',
  userBubbleColor: '#fff',
  userFontColor: '#4a4a4a',
};

const StudioChatBot = ({ flow, handleRunFlow }) => {
  const [opened, setOpened] = useState(false);
  const [key, setKey] = useState('chatbot-1');

  const toggleChatbot = useCallback(() => {
    setOpened((prev) => {
      if (!prev) {
        setKey(`chatbot-${Date.now()}`);
      }
      return !prev;
    });
  }, []);

  const handleOptionSelection = (value) => {
    console.log("User selected option:", value);
  };

  const steps = [
    {
      id: 'greeting',
      message: 'Welcome to Sify Aurora!',
      trigger: 'flowDetails',
      delay: 1000,
    },
    {
      id: 'flowDetails',
      message: `Flow Name: ${flow.name}`,
      trigger: 'options',
      delay: 500,
    },
    {
      id: 'options',
      message: 'Please choose an option to proceed:',
      trigger: 'chooseOption',
    },
    {
      id: 'chooseOption',
      options: [
        {
          value: 'run',
          label: 'Run Flow',
          trigger: () => {
            handleRunFlow(flow?.id);
            return 'runningResponse';
          },
        },
      ],
    },
    {
      id: 'runningResponse',
      message: 'Your flow is running!',
      end: true, // Ends the conversation after displaying the message
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <ChatBot
        key={key}
        steps={steps}
        floating={true}
        opened={opened}
        toggleFloating={toggleChatbot}
        floatingIcon={<Bot size={32} color="white" />}
        floatingStyle={{
          backgroundColor: '#6e48aa',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          bottom: '20px',
          right: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
        cache={false}
        hideUserAvatar={true}
        botDelay={800}
        headerTitle="Sify Aurora Assistant"
        enableMobileAutoFocus={false}
        enableSmoothScroll={true}
        recognitionEnable={false}
        style={{ maxWidth: '350px' }}
        userDelay={0}
      />
    </ThemeProvider>
  );
};

export default StudioChatBot;
