"use client";
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import React, { useState, useCallback } from 'react';
import { Bot } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {runFlow} from '@/redux/slices/studioSlice';
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

const StudioChatBot = ({ flow }) => {
  const [opened, setOpened] = useState(false);
  const [key, setKey] = useState('chatbot-1');
  
  const dispatch = useDispatch();
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

  const RunFlowComponent = ({ flow }) => {
    const [output, setOutput] = React.useState("Processing...");
    const flowOutput = useSelector(state => state.studio.flowOutput);
    const isFlowRunning = useSelector(state => state.studio.isFlowRunning);
  
    // Watch for flow output changes
    React.useEffect(() => {
      if (flowOutput && !isFlowRunning) {
        setOutput(flowOutput?.retrieved_summary || "No summary available");
      }
    }, [flowOutput, isFlowRunning]);
  
    // Execute flow
    React.useEffect(() => {
      const executeFlow = async () => {
         dispatch(runFlow({data: flow?.id, onSuccess: () => {console.log('executtt')}}));
      };
      executeFlow();
    }, [flow?.id, dispatch]);
  
    return !isFlowRunning ? (
      <div className="flow-output-html" dangerouslySetInnerHTML={{ __html: output }}></div>
    ) : (
      <div>Flow is currently running, please wait...</div>
    );
  };

  const steps = [
    {
      id: 'greeting',
      message: 'Welcome to Sify Aurora!',
      trigger: 'chooseOption',
      delay: 1000,
    },
    {
      id: 'chooseOption',
      options: [
        {
          value: 'run',
          label: 'Run Flow',
          trigger: 'runningResponse',
        },
      ],
    },
    {
      id: 'runningResponse',
      message: 'Your flow is running!',
      trigger: 'executeFlow',
    },
    {
      id: 'executeFlow',
      component: <RunFlowComponent flow={flow}  />,
      end: true,
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
        // userDelay={0}
        bubbleOptionStyle={{
          backgroundColor: "transparent",
          border: "2px solid #6e48aa",
          color: "#6e48aa",
          padding: "8px 15px",
          borderRadius: "20px",
          margin: "5px 0px 0px 45px",
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        submitButtonStyle={{
          backgroundColor: "#6e48aa",
          color: "#fff",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
        }}
        userDelay={500}
      />
    </ThemeProvider>
  );
};

export default StudioChatBot;
