"use client"
import React, { useState, useEffect } from 'react';
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

  return (
    <ThemeProvider theme={theme}>
      <ChatBot
        steps={[
          {
            id: 'start',
            message: 'Hi, how can we help?',
            trigger: 'userMessage',
          },
          {
            id: 'userMessage',
            user: true,
            trigger: 'botResponse',
          },
          {
            id: 'botResponse',
            component: <WebhookResponse />,
            waitAction: true,
            asMessage: true,
            trigger: 'userMessage',
          }
        ]}
        recognitionEnable={false}
        hideSubmitButton={false}
        // floating={true}
        opened={false}
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
        width={'100%'}
        height={'550px'}
        borderRadius={'0px'}
        cache={false}
        hideUserAvatar={true}
        botDelay={800}
        headerTitle="Holiday Checker"
      />
    </ThemeProvider>
  );
};

const WebhookResponse = (props) => {
  const { steps, triggerNextStep } = props;
  const [responseProcessed, setResponseProcessed] = useState(false);
  const [responseText, setResponseText] = useState('...');
  
  useEffect(() => {
    // Only run this effect once per component instance
    if (responseProcessed) return;
    
    const userInput = steps.userMessage ? steps.userMessage.value : '';
    
    const callWebhook = async () => {
      try {
        const res = await axios.post(
          'https://nivahev691neuraxo.app.n8n.cloud/webhook/c9d5e0e4-00c1-4018-84ad-669d9073dcd1/chat',
          {
            action: 'sendMessage',
            route: 'general',
            chatInput: userInput,
            sessionId: '7dde7d92-3914-44ba-ba4b-31b2d2039bd3'
          }
        );
        
        console.log('Response received:', res.data);
        const output = res.data.output || 'Got it!';
        setResponseText(output);
        setResponseProcessed(true);
        triggerNextStep({ value: output });
      } catch (err) {
        console.error('Error in webhook call:', err);
        const errorMsg = 'Sorry, something went wrong.';
        setResponseText(errorMsg);
        setResponseProcessed(true);
        triggerNextStep({ value: errorMsg });
      }
    };
    
    callWebhook();
  }, [steps, triggerNextStep, responseProcessed]);
  
  return <div dangerouslySetInnerHTML={{ __html: responseText }}></div>;
};

export default ChatWidget;