"use client";
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import React, { useState, useCallback, useEffect } from 'react';
import { Bot, MessageCircle, MessageCircleDashed, MessageSquare } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {runFlow, updateSpecification, updateFlow} from '@/redux/slices/studioSlice';
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

  const RunFlowComponent = ({ flow = { id: "flow-1" } }) => {
    const dispatch = useDispatch();
    const flowOutput = useSelector((state) => state.studio.flowOutput);
    const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);
    const specification = useSelector((state) => state.studio.specification);
    const [output, setOutput] = useState("<div><h1>Output Rendered as HTML</h1><p>This is an example of HTML content rendering from the flow output.</p></div>");
    const [lastParam, setLastParam] = useState("");
    const [inputValues, setInputValues] = useState({});
    const [showInputForm, setShowInputForm] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
  
    // Initialize input values from specification
    useEffect(() => {
      if (specification?.inputs?.length > 0) {
        const initialInputs = {};
        specification.inputs.forEach((input) => {
          initialInputs[input.key] = input.value || "";
        });
        setInputValues(initialInputs);
      }
    }, [specification]);
  
    // Handle input change
    const handleInputChange = (key, value) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [key]: value,
      }));
    };
  
    // Handle form submission
    const handleSubmitInputs = () => {
      if (specification?.inputs) {
        setIsSaving(true);
  
        // Create updated inputs with user values
        const updatedInputs = specification.inputs.map((input) => ({
          ...input,
          value: inputValues[input.key] || input.value || "",
        }));
  
        // Create updated specification with new inputs
        const updatedSpecification = {
          ...specification,
          inputs: updatedInputs,
        };
  
        // Update the specification in the Redux store
        dispatch(updateSpecification(updatedSpecification));
  
        // Save the flow first
        if (flow?.id) {
          dispatch(
            updateFlow({
              id: flow.id,
              updatedData: updatedSpecification,
              onSuccess: () => {
                console.log("Flow saved successfully");
  
                // After saving, run the flow
                const outputParam = getLastOutputParameter(flow);
                if (outputParam?.value) {
                  setLastParam(outputParam.value);
                  setShowInputForm(false);
  
                  // Run the flow
                  dispatch(
                    runFlow({
                      data: flow.id,
                      onSuccess: () => {
                        console.log("Flow successfully executed");
                        setIsSaving(false);
                      },
                    }),
                  );
                } else {
                  setIsSaving(false);
                }
              },
            }),
          );
        } else {
          console.error("Flow ID is missing, cannot save flow");
          setIsSaving(false);
        }
      }
    };
  
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
  
    // Render input form
    if (showInputForm && specification?.inputs?.length > 0) {
      return (
        <div className="border border-gray-200 rounded-md overflow-hidden w-full" style={{ backgroundColor: "#f5f8fb" }}>
          <div className="px-3 py-2 border-b border-gray-200" style={{ backgroundColor: "#f5f8fb" }}>
            <h3 className="text-sm font-medium text-gray-700">Flow Parameters</h3>
          </div>
  
          <div className="p-3 space-y-3">
            {specification.inputs.map((input, index) => (
              <div key={index} className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">{input.key}</label>
  
                {input.type === "file" ? (
                  <div className="relative">
                    <input
                      type="file"
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 
                      file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 
                      file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
                      onChange={(e) => handleInputChange(input.key, e.target.files[0])}
                    />
                  </div>
                ) : input.type === "object" ? (
                  <textarea
                    value={inputValues[input.key] || ""}
                    onChange={(e) => handleInputChange(input.key, e.target.value)}
                    placeholder={`Enter ${input.key}`}
                    className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-300 
                    rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 
                    focus:border-gray-400 min-h-[60px] max-h-[120px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={inputValues[input.key] || ""}
                    onChange={(e) => handleInputChange(input.key, e.target.value)}
                    placeholder={`Enter ${input.key}`}
                    className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-300 
                    rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                )}
              </div>
            ))}
          </div>
  
          <div className="px-3 py-2 border-t border-gray-200" style={{ backgroundColor: "#f5f8fb" }}>
            <button
              onClick={handleSubmitInputs}
              disabled={isSaving}
              className={`w-full flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium
              ${
                isSaving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "!bg-[var(--primary-color)] text-white hover:bg-emerald-700"
              } transition-colors duration-150`}
            >
              {isSaving ? (
                <>
                  Processing...
                </>
              ) : (
                "Run Flow"
              )}
            </button>
          </div>
        </div>
      );
    }
      return (
      <div className="border border-gray-200 rounded-md overflow-hidden w-full" style={{ backgroundColor: "#f5f8fb" }}>
        <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: "#f5f8fb" }}>
          <h3 className="text-sm font-medium text-gray-700">Flow Output</h3>
          {!isFlowRunning && (
            <button onClick={() => setShowInputForm(true)} className="text-xs text-gray-500 hover:text-gray-700">
              Edit Inputs
            </button>
          )}
        </div>
  
        <div className="p-3">
          {isFlowRunning ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm text-gray-500">Processing your request...</p>
            </div>
          ) : (
            <div className="flow-output">
              {typeof output === "object" ? (
                <pre className="p-2 rounded text-xs text-gray-800 overflow-x-auto max-h-[200px] whitespace-pre-wrap" style={{ backgroundColor: "#f5f8fb" }}>
                  {JSON.stringify(output, null, 2)}
                </pre>
              ) : (
                <div 
                  className="p-2 rounded text-xs text-gray-800 overflow-x-auto max-h-[200px]" 
                  style={{ backgroundColor: "#f5f8fb" }}
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              )}
            </div>
          )}
        </div>
      </div>
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
