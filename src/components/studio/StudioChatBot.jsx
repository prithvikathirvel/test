"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, CheckCircle, Loader2 ,XCircle, Paperclip, FileText, Trash2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { runFlow } from "@/redux/slices/studioSlice"
import { updateSpecification } from "@/redux/slices/studioSlice" 
import { updateFlow } from "@/redux/slices/studioSlice" 
import { getLastOutputParameter } from "@/utils/commonFunction" 


const StudioChatBot = ({
  // Basic configuration
  primaryColor = "primary",
  botName = "Sify Aurora Assistant",
  botStatus = "Online",
  width = "500px",
  height = "520px",
  position = "bottom-right",
  flow = {},

  // Data configuration
  messagesData = [],
  apiConfig = {},

  // Custom components
  CustomUserMessage = null,
  CustomBotMessage = null,

  // Callbacks
  onMessageSent = null,
  onOptionClicked = null,
  onApiCall = null,
  handleRenderFlow = null,

}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(messagesData)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null); 
  const flowOutput = useSelector((state) => state.studio.flowOutput); 
  
  const dispatch = useDispatch();

  // Use useRef for message ID counter to ensure it persists and updates correctly
  const messageIdCounter = useRef(0)

  // Generate unique message ID
  const generateUniqueId = () => {
    messageIdCounter.current += 1
    return `msg-${Date.now()}-${messageIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Color configurations
  const colorConfig = {
    blue: {
      primary: "bg-blue-600 hover:bg-blue-700",
      gradient: "from-blue-600 to-blue-700",
      text: "text-blue-600",
      border: "border-blue-200 hover:border-blue-300",
      bg: "bg-blue-50",
      userBubble: "bg-blue-600",
    },
    green: {
      primary: "bg-green-600 hover:bg-green-700",
      gradient: "from-green-600 to-green-700",
      text: "text-green-600",
      border: "border-green-200 hover:border-green-300",
      bg: "bg-green-50",
      userBubble: "bg-green-600",
    },
    purple: {
      primary: "bg-purple-600 hover:bg-purple-700",
      gradient: "from-purple-600 to-purple-700",
      text: "text-purple-600",
      border: "border-purple-200 hover:border-purple-300",
      bg: "bg-purple-50",
      userBubble: "bg-purple-600",
    },
    red: {
      primary: "bg-red-600 hover:bg-red-700",
      gradient: "from-red-600 to-red-700",
      text: "text-red-600",
      border: "border-red-200 hover:border-red-300",
      bg: "bg-red-50",
      userBubble: "bg-red-600",
    },
    primary: {
      primary: "bg-[var(--primary-color)] hover:bg-[var(--primary-color)]",
      gradient: "from-[var(--primary-color)] to-[var(--primary-color)]",
      text: "text-[var(--primary-color)]",
      border: "border-[var(--primary-color)] hover:border-[var(--primary-color)]",
      bg: "bg-[var(--primary-color)]",
      userBubble: "bg-[var(--primary-color)]",
    },
  }


    // const RunFlowComponent = ({ flow = { id: "flow-1" } }) => {
    //   const dispatch = useDispatch();
    //   const flowOutput = useSelector((state) => state.studio.flowOutput);
    //   const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);
    //   const specification = useSelector((state) => state.studio.specification);
    //   const [output, setOutput] = useState("<div><h1>Output Rendered as HTML</h1><p>This is an example of HTML content rendering from the flow output.</p></div>");
    //   const [lastParam, setLastParam] = useState("");
    //   const [inputValues, setInputValues] = useState({});
    //   const [showInputForm, setShowInputForm] = useState(true);
    //   const [isSaving, setIsSaving] = useState(false);
    
    //   // Initialize input values from specification
    //   useEffect(() => {
    //     if (specification?.inputs?.length > 0) {
    //       const initialInputs = {};
    //       specification.inputs.forEach((input) => {
    //         initialInputs[input.key] = input.value || "";
    //       });
    //       setInputValues(initialInputs);
    //     }
    //   }, [specification]);
    
    //   // Handle input change
    //   const handleInputChange = (key, value) => {
    //     // If the value is a File object, convert it to base64
    //     if (value instanceof File) {
    //       const reader = new FileReader();
    //       reader.readAsDataURL(value);
    //       reader.onload = () => {
    //         // Get the base64 string
    //         const base64String = reader.result;
    //         // Prepend the filename with a ";" separator
    //         const fileWithMetadata = `${value.name};${base64String}`;
    //         setInputValues((prevValues) => ({
    //           ...prevValues,
    //           [key]: fileWithMetadata,
    //         }));
    //       };
    //       reader.onerror = (error) => {
    //         console.error('Error converting file to base64:', error);
    //       };
    //     } else {
    //       // For non-file inputs, behave as before
    //       setInputValues((prevValues) => ({
    //         ...prevValues,
    //         [key]: value,
    //       }));
    //     }
    //   };
    
    //   // Handle form submission
    //   const handleSubmitInputs = () => {
    //     if (specification?.inputs) {
    //       setIsSaving(true);
    
    //       // Create updated inputs with user values
    //       const updatedInputs = specification.inputs.map((input) => ({
    //         ...input,
    //         value: inputValues[input.key] || input.value || "",
    //       }));
    
    //       // Create updated specification with new inputs
    //       const updatedSpecification = {
    //         ...specification,
    //         inputs: updatedInputs,
    //       };
    
    //       // Update the specification in the Redux store
    //       dispatch(updateSpecification(updatedSpecification));
    
    //       // Save the flow first
    //       if (flow?.id) {
    //         dispatch(
    //           updateFlow({
    //             id: flow.id,
    //             updatedData: updatedSpecification,
    //             onSuccess: () => {
    //               console.log("Flow saved successfully");
    
    //               // After saving, run the flow
    //               const outputParam = getLastOutputParameter(flow);
    //               if (outputParam?.value) {
    //                 setLastParam(outputParam.value);
    //                 setShowInputForm(false);
    
    //                 // Run the flow
    //                 dispatch(
    //                   runFlow({
    //                     data: {agent_id: flow.id},
    //                     onSuccess: () => {
    //                       console.log("Flow successfully executed");
    //                       setIsSaving(false);
    //                     },
    //                   }),
    //                 );
    //               } else {
    //                 setIsSaving(false);
    //               }
    //             },
    //           }),
    //         );
    //       } else {
    //         console.error("Flow ID is missing, cannot save flow");
    //         setIsSaving(false);
    //       }
    //     }
    //   };
    
    //   // Watch for flowOutput updates after flow execution
    //   useEffect(() => {
    //     if (!isFlowRunning && lastParam) {
    //       const updatedOutput = flowOutput?.[lastParam];
    //       if (updatedOutput) {
    //         setOutput(updatedOutput);
    //       } else {
    //         setOutput("No Output available.");
    //       }
    //     }
    //   }, [flowOutput, isFlowRunning, lastParam]);
    
    //   // Render input form
    //   if (showInputForm && specification?.inputs?.length > 0) {
    //     return (
    //       <div className="border border-gray-200 rounded-md overflow-hidden w-full" style={{ backgroundColor: "#f5f8fb" }}>
    //         <div className="px-3 py-2 border-b border-gray-200" style={{ backgroundColor: "#f5f8fb" }}>
    //           <h3 className="text-sm font-medium text-gray-700">Inputs</h3>
    //         </div>
    
    //         <div className="p-3 space-y-3">
    //           {specification.inputs.map((input, index) => (
    //             <div key={index} className="space-y-1">
    //               <label className="block text-xs font-medium text-gray-600">{input.key}</label>
    
    //               {input.type === "file" ? (
    //                 <div className="relative">
    //                   {inputValues[input.key] && (
    //                     <div className="mt-2 mb-3 text-xs text-gray-700">
    //                       <span className="!font-semibold">Current File:</span> {inputValues[input.key].split(';')[0]}
    //                     </div>
    //                   )}
    //                   <p className="mt-2 mb-2 text-xs text-gray-700 text-center">Or</p>
    //                   <input
    //                     type="file"
    //                     className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 
    //                     file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 
    //                     file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
    //                     onChange={(e) => handleInputChange(input.key, e.target.files[0])}
    //                   />
                      
    //                 </div>
    //               ) : input.type === "object" ? (
    //                 <textarea
    //                   value={inputValues[input.key] || ""}
    //                   onChange={(e) => handleInputChange(input.key, e.target.value)}
    //                   placeholder={`Enter ${input.key}`}
    //                   className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-300 
    //                   rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 
    //                   focus:border-gray-400 min-h-[60px] max-h-[120px]"
    //                 />
    //               ) : (
    //                 <input
    //                   type="text"
    //                   value={inputValues[input.key] || ""}
    //                   onChange={(e) => handleInputChange(input.key, e.target.value)}
    //                   placeholder={`Enter ${input.key}`}
    //                   className="w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-300 
    //                   rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
    //                 />
    //               )}
    //             </div>
    //           ))}
    //         </div>
    
    //         <div className="px-3 py-2 border-t border-gray-200" style={{ backgroundColor: "#f5f8fb" }}>
    //           <button
    //             onClick={handleSubmitInputs}
    //             disabled={isSaving}
    //             className={`w-full flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium
    //             ${
    //               isSaving
    //                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    //                 : "!bg-[var(--primary-color)] text-white hover:bg-emerald-700"
    //             } transition-colors duration-150`}
    //           >
    //             {isSaving ? (
    //               <>
    //                 Processing...
    //               </>
    //             ) : (
    //               "Run Flow"
    //             )}
    //           </button>
    //         </div>
    //       </div>
    //     );
    //   }
    //     return (
    //     <div className="border border-gray-200 rounded-md overflow-hidden w-full" style={{ backgroundColor: "#f5f8fb" }}>
    //       <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: "#f5f8fb" }}>
    //         <h3 className="text-sm font-medium text-gray-700">Flow Output</h3>
    //         {!isFlowRunning && (
    //           <button onClick={() => setShowInputForm(true)} className="text-xs text-gray-500 hover:text-gray-700">
    //             Edit Inputs
    //           </button>
    //         )}
    //       </div>
    
    //       <div className="p-3">
    //         {isFlowRunning ? (
    //           <div className="flex flex-col items-center justify-center py-6">
    //             <p className="text-sm text-gray-500">Processing your request...</p>
    //           </div>
    //         ) : (
    //           <div className="flow-output">
    //             {typeof output === "object" ? (
    //               <pre className="p-2 rounded text-xs text-gray-800 overflow-x-auto max-h-[200px] whitespace-pre-wrap" style={{ backgroundColor: "#f5f8fb" }}>
    //                 {JSON.stringify(output, null, 2)}
    //               </pre>
    //             ) : (
    //               <div 
    //                 className="p-2 rounded text-xs text-gray-800 overflow-x-auto max-h-[200px]" 
    //                 style={{ backgroundColor: "#f5f8fb" }}
    //                 dangerouslySetInnerHTML={{ __html: output }}
    //               />
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   );
    // };

  const colors = colorConfig[primaryColor] || colorConfig.blue

  // Position configurations
  const positionConfig = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64 = reader.result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    const pdfFiles = files.filter((file) => file.type === "application/pdf")

    if (pdfFiles.length === 0) {
      alert("Please select only PDF files.")
      return
    }

    try {
      const filePromises = pdfFiles.map(async (file) => {
        const base64 = await convertFileToBase64(file)
        return {
          id: generateUniqueId(),
          name: file.name,
          base64: base64,
          size: file.size,
          formattedData: `${file.name};${base64}`,
        }
      })

      const processedFiles = await Promise.all(filePromises)
      setUploadedFiles((prev) => [...prev, ...processedFiles])

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error processing files:", error)
      alert("Error processing files. Please try again.")
    }
  }

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const addMessage = (text, sender, messageType = "text", customId = null, customData = null, apiResponse = null) => {
    const messageId = customId || generateUniqueId()

    const newMessage = {
      id: messageId,
      text,
      sender,
      messageType,
      customData,
      apiResponse,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    if (onMessageSent) {
      onMessageSent(newMessage)
    }

    return newMessage
  }

  const removeMessageById = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() || uploadedFiles.length > 0) {
      let userMessage = inputValue.trim()
  
      // Prepare file data for payload
      let fileData = [];
      if (uploadedFiles.length > 0) {
        fileData = uploadedFiles.map(file => file.base64);
  
        // If there's no text message but files are uploaded
        if (!userMessage) {
          userMessage = `Uploaded ${uploadedFiles.length} PDF file(s): ${uploadedFiles.map(f => f.name).join(", ")}`;
        }
      }
  
      setIsLoading(true);
  
      // Add user message
      addMessage(userMessage, "user");
  
      const payload = {
        agent_id: flow?.id,
        userInput: {
          message: userMessage,
          uploadedFiles: fileData
        }
      };
  
      // Generate unique loading message ID
      const loadingId = generateUniqueId();
  
      // Add loading message
      addMessage("Thinking...", "bot", "loading", loadingId);
  
      try {
        const resultAction = await dispatch(
          runFlow({
            data: payload,
            onSuccess: () => {
              console.log('Flow executed successfully');
            },
          })
        )
          .unwrap()
          .then((response) => {
            // Remove loading message
            removeMessageById(loadingId);
  
            // Check if response requires input
            if (response?.input) {
              // Add a special message type for input form
              addMessage(
                "",
                "bot",
                "input-forms",
                null,
                { flow: flow} // Pass the flow data to the component
              );
  
              // Check if handleRenderFlow exists and is a function
              console.log("handleRenderFlow is:", typeof handleRenderFlow);
              if (handleRenderFlow && typeof handleRenderFlow === 'function') {
                console.log("Calling handleRenderFlow for input form");
                handleRenderFlow();
              } else {
                console.error("handleRenderFlow is not a function or is undefined");
              }
            } else {
              // Handle regular bot response
              const botResponse = response?.bot_response || "Something went wrong";
              addMessage(botResponse, "bot", "text");
              
              // Also call handleRenderFlow for regular responses
              if (handleRenderFlow && typeof handleRenderFlow === 'function') {
                console.log("Calling handleRenderFlow for regular response");
                handleRenderFlow();
              }
            }
  
            return response;
          })
          .catch((error) => {
            console.error('Error in runFlow:', error);
            removeMessageById(loadingId);
            addMessage("Sorry, something went wrong. Please try again.", "bot", "error");
            throw error;
          })
          .finally(() => {
            setIsLoading(false);
          });
  
        if (resultAction) {
          console.log('Flow executed successfully:', resultAction);
        }
      } catch (error) {
        console.error('Error in handleSendMessage:', error);
      } finally {
        setInputValue("");
      }
    }
  };

  const makeApiCall = async (apiEndpoint, userMessage) => {
    try {
      setIsLoading(true)

      // Add loading message with unique ID
      const loadingId = generateUniqueId()
      addMessage("Let me fetch that information for you...", "bot", "loading", loadingId)

      if (onApiCall) {
        onApiCall(apiEndpoint, userMessage)
      }

      const response = await fetch(apiEndpoint.url)
      const data = await response.json()

      // Remove loading message
      removeMessageById(loadingId)

      // Process API response based on endpoint type
      const processedResponse = apiEndpoint.responseProcessor ? apiEndpoint.responseProcessor(data) : data

      // Add bot response with API data
      addMessage(
        apiEndpoint.successMessage || "Here's what I found:",
        "bot",
        "api-response",
        null,
        {
          endpoint: apiEndpoint,
          originalData: data,
        },
        processedResponse,
      )
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.messageType !== "loading"))

      // Add error message
      addMessage(
        apiEndpoint.errorMessage || "Sorry, I couldn't fetch that information right now. Please try again later.",
        "bot",
        "error",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const findMatchingApiEndpoint = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()

    // Check if message matches any API trigger
    for (const endpoint of apiConfig.endpoints || []) {
      for (const trigger of endpoint.triggers) {
        if (lowerMessage.includes(trigger.toLowerCase())) {
          return endpoint
        }
      }
    }

    return null
  }

  const handleOptionClick = async (option, messageData) => {
    addMessage(option.text, "user")

    if (option.apiEndpoint) {
      await makeApiCall(option.apiEndpoint, option.text)
    } else if (option.nextMessage) {
      setTimeout(() => {
        const nextMessage = {
          ...option.nextMessage,
          id: generateUniqueId(),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, nextMessage])
      }, 1000)
    }

    if (onOptionClicked) {
      onOptionClicked(option, messageData)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Default User Message Component
  const DefaultUserMessage = ({ message, colors }) => (
    <div className={`px-4 py-3 rounded-2xl ${colors.userBubble} text-white rounded-br-md`}>
      <p className="text-sm leading-relaxed">{message.text}</p>
    </div>
  )

  const DefaultBotMessage = ({ message, colors, onOptionClick }) => (
    <div>
      {message.messageType === "loading" ? (
        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
        </div>
      ) : message.messageType === "error" ? (
        <div className="bg-red-50 text-red-800 rounded-2xl rounded-bl-md shadow-sm border border-red-200 px-4 py-3">
          <div className="flex items-start space-x-2">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-sm leading-relaxed">{message.text}</p>
          </div>
        </div>
      ) : 
      // message.messageType === "input-form" ? (
      //   <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      //     <div className="p-3 border-b border-gray-200">
      //       <p className="text-sm text-gray-700 mb-3">{message.text}</p>
      //       <RunFlowComponent flow={message.customData.flow} />
      //     </div>
      //   </div>
      // ) : 
      (
        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3">
          <div 
            className="text-sm leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: message.text }} 
          />
        </div>
      )}
  
      {/* Rest of your component remains the same */}
      {message.options && (
        <div className="mt-3 space-y-2">
          {message.options.map((option, index) => (
            <button
              key={`${message.id}-option-${index}`}
              onClick={() => onOptionClick(option, message)}
              className={`block w-full text-left px-4 py-2 text-sm bg-white border ${colors.border} ${colors.text} rounded-xl hover:${colors.bg} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderMessage = (message) => {
    if (message.sender === "user") {
      return CustomUserMessage ? (
        <CustomUserMessage message={message} colors={colors} />
      ) : (
        <DefaultUserMessage message={message} colors={colors} />
      )
    } else {
      return CustomBotMessage ? (
        <CustomBotMessage message={message} colors={colors} onOptionClick={handleOptionClick} />
      ) : (
        <DefaultBotMessage message={message} colors={colors} onOptionClick={handleOptionClick} />
      )
    }
  }

  return (
    <div className={`fixed ${positionConfig[position]} z-50`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`${colors.primary} text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
          style={{ width, height }}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.gradient} text-white p-5 flex justify-between items-center`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {/* <CheckCircle className="w-5 h-5" /> */}
                <img src="https://images.scalebranding.com/chatbot-woman-logo-0a79f97c-1fde-4cf9-8796-dbbbac54bb34.jpg" alt="Chatbot Logo" className="w-10 h-10 rounded-full object-cover" />
                
              </div>
              <div>
                <h3 className="font-semibold text-base">{botName}</h3>
                <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${botStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>                  <p className="text-sm opacity-90">{botStatus}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white cursor-pointer hover:bg-opacity-20 rounded-full p-2 transition-colors focus:outline-none"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((message,index  ) => (
              <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} items-end space-x-2`}>
              {/* Bot Avatar - Only show for bot messages on the left */}
              {message.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mb-1">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
              )}
            
              {/* Message Container */}
              <div className={`max-w-xs lg:max-w-sm ${message.sender === "user" ? "order-2" : "order-1"}`}>
                {/* Message content */}
                {renderMessage(message)}
                
                {/* Timestamp */}
                <p className={`text-xs mt-2 ${message.sender === "user" ? "text-right" : "text-left"} text-gray-400`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            
              {/* User Avatar - Only show for user messages on the right */}
              {/* {message.sender === "user" && (
                <div className={`w-8 h-8 rounded-full ${colors.userBubble} flex items-center justify-center flex-shrink-0 mb-1 order-3`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )} */}
            </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="px-5 py-3 bg-gray-100 border-t border-gray-200">
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-5 border-t bg-white">
            <div className="flex space-x-3 items-end">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Upload PDF files"
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="custom-scroll flex-1 border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none overflow-y-auto h-15"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading}
                className={`${colors.primary} disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudioChatBot
