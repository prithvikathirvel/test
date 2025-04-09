"use client";
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import React, { useState, useCallback, useEffect } from 'react';
import { Bot, MessageCircle, MessageCircleDashed, MessageSquare } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {runFlow} from '@/redux/slices/studioSlice';
import { getLastOutputParameter } from '@/utils/commonFunction';
const theme = {
  background: '#f5f8fb',
  fontFamily: 'Work Sans, sans-serif',
  headerBgColor: 'var(--primary-color)',
  headerFontColor: '#fff',
  headerFontSize: '16px',
  botBubbleColor: 'var(--primary-color)',
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
    const dispatch = useDispatch();
    const flowOutput = useSelector(state => state.studio.flowOutput);
    const isFlowRunning = useSelector(state => state.studio.isFlowRunning);
    const [output, setOutput] = useState("Processing...");
    const [lastParam, setLastParam] = useState('');
  
    // Run the flow when the component mounts
    useEffect(() => {
      const outputParam = getLastOutputParameter(flow);
      if (outputParam?.value) {
        setLastParam(outputParam.value);
  
        dispatch(runFlow({
          data: flow?.id,
          onSuccess: () => {
            // Output will be handled in the next useEffect
            console.log("Flow successfully executed");
          }
        }));
      }
    }, [flow?.id, dispatch]);
  
    // Watch for flowOutput updates after flow execution
    useEffect(() => {
      if (!isFlowRunning && lastParam) {
        const updatedOutput = flowOutput?.[lastParam];
        if (updatedOutput) {
          setOutput(updatedOutput);
        } else {
          setOutput("No Output available.");
        }
      }
    }, [flowOutput, isFlowRunning, lastParam]);
  
    return (
      !isFlowRunning ? (
        <div className="flow-output-html" dangerouslySetInnerHTML={{ __html: JSON.stringify(output, null, 2) }}></div>
      ) : (
        <div>Flow is currently running, please wait...</div>
      )
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
      component: <RunFlowComponent flow={flow} />,
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
        floatingIcon={<MessageSquare size={30} color="white" />}
        floatingStyle={{
          backgroundColor: 'var(--primary-color)',
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
          border: "2px solid var(--primary-color)",
          color: "var(--primary-color)",
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
