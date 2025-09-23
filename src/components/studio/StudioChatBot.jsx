"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, Loader2, XCircle, Paperclip, FileText, Trash2 } from "lucide-react"
import { parseAndNormalizeFormData } from "@/utils/commonFunction" // Assuming this utility function exists in your project

// ==============================================================================
// 1. DYNAMIC FORM COMPONENT (Self-contained and complete)
// ==============================================================================
const DynamicFormComponent = ({ formData, resultActionbmit, colors }) => {
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialValues = Object.keys(formData.formValues).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setFormValues(initialValues);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitInfo = {
        templateName: formData['template Name'],
        submitUrl: formData.submit
    };
    await resultActionbmit(formValues, submitInfo);
  };
  
  const renderInput = (key, type) => {
    const inputType = {
      'string': 'text',
      'number': 'number',
      'date': 'date',
      'email': 'email',
      'password': 'password'
    }[type] || 'text';

    return (
      <div key={key} className="mb-4">
        <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize mb-1">
          {key.replace(/_/g, ' ')}
        </label>
        <input
          type={inputType}
          id={key}
          name={key}
          value={formValues[key] || ''}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
    );
  };

  return (
    <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">
        {formData['template Name'] || 'Please fill the form'}
      </h4>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData.formValues).map(([key, type]) => renderInput(key, type))}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 ${colors.primary} disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
             <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
             </div>
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  );
};


// ==============================================================================
// 2. MAIN CHATBOT COMPONENT (Full implementation)
// ==============================================================================
const StudioChatBot = ({
  primaryColor = "primary",
  botName = "Sify Aurora Assistant",
  botStatus = "Online",
  width = "500px",
  height = "520px",
  position = "bottom-right",
  flow = {},
  messagesData = [],
  apiConfig = {},
  CustomUserMessage = null,
  CustomBotMessage = null,
  onMessageSent = null,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(messagesData)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [threadId, setThreadId] = useState(null);

  const flowStartedRef = useRef(false);
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null); 
  const messageIdCounter = useRef(0)

  const generateUniqueId = () => `msg-${Date.now()}-${++messageIdCounter.current}`;

  const colorConfig = { primary: { primary: "bg-[var(--primary-color)]", gradient: "from-[var(--primary-color)] to-[var(--primary-color)]", text: "text-[var(--primary-color)]", border: "border-gray-300 hover:border-[var(--primary-color)]", bg: "bg-blue-50", userBubble: "bg-[var(--primary-color)]" } };
  const colors = colorConfig[primaryColor] || colorConfig.primary;

  const positionConfig = { "bottom-right": "bottom-6 right-6", "bottom-left": "bottom-6 left-6", "top-right": "top-6 right-6", "top-left": "top-6 left-6" };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom() }, [messages]);

  useEffect(() => {
    if (isOpen && !flowStartedRef.current) {
      startNewFlow();
      flowStartedRef.current = true;
    }
  }, [isOpen]);

  // --- START: Full File Handling Logic ---
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    try {
      const filePromises = files.map(async (file) => {
        const base64 = await convertFileToBase64(file);
        return { id: generateUniqueId(), name: file.name, base64: base64, size: file.size };
      });
      const processedFiles = await Promise.all(filePromises);
      setUploadedFiles((prev) => [...prev, ...processedFiles]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error processing files:", error);
      addMessage("Error processing files. Please try again.", "bot", "error");
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  // --- END: Full File Handling Logic ---

  const addMessage = (text, sender, messageType = "text", customData = null) => {
    const newMessage = { id: generateUniqueId(), text, sender, messageType, customData, timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    if (onMessageSent) onMessageSent(newMessage);
    return newMessage;
  };

  const removeMessageById = (messageId) => setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

  // --- START: Core API Logic ---
  const processApiResponse = (data) => {
    if (!data || !data.response_type) {
        addMessage("Sorry, I received an invalid response from the server.", "bot", "error");
        return;
    }
    setThreadId(data.thread_id);
    switch (data.response_type) {
        case "QUESTION": addMessage(data.payload.question_text, "bot", "question", { payload: data.payload }); break;
        case "MESSAGE": addMessage(data.payload.text, "bot", "text"); setThreadId(null); flowStartedRef.current = false; break;
        case "END_OF_FLOW": addMessage(data.payload.message || "The flow has completed.", "bot", "text"); setThreadId(null); flowStartedRef.current = false; break;
        default: addMessage("Sorry, I'm not sure how to handle that response.", "bot", "error"); break;
    }
  };

  const startNewFlow = async () => {
    setIsLoading(true);
    const loadingId = addMessage("Connecting...", "bot", "loading").id;
    try {
        const response = await fetch('http://localhost:8000/start-flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flow_id: flow?.id || "default-flow-id" }) });
        removeMessageById(loadingId);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        processApiResponse(data);
    } catch (error) {
        console.error('Error starting flow:', error);
        removeMessageById(loadingId);
        addMessage("Sorry, I couldn't start the conversation. Please try again.", "bot", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResumeFlow = async (resumeValue) => {
    addMessage(resumeValue, "user");
    setIsLoading(true);
    const loadingId = addMessage("Thinking...", "bot", "loading").id;
    try {
        const response = await fetch('http://localhost:8000/resume-flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thread_id: threadId, resume_value: resumeValue }) });
        removeMessageById(loadingId);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        processApiResponse(data);
    } catch (error) {
        console.error('Error resuming flow:', error);
        removeMessageById(loadingId);
        addMessage("Sorry, something went wrong. Please try again.", "bot", "error");
    } finally {
        setIsLoading(false);
    }
  };
  // --- END: Core API Logic ---

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!threadId) {
        addMessage(inputValue.trim(), "user");
        setInputValue("");
        startNewFlow(); 
    } else {
        addMessage("Please select one of the options above to continue.", "bot", "error");
    }
  };

  const handleFormSubmit = async (formData, submitInfo) => {
    addMessage(`Submitted: ${submitInfo.templateName}`, 'user');
    setIsLoading(true);
    const loadingId = addMessage("Processing your submission...", "bot", "loading").id;
    try {
      const response = await fetch(submitInfo.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      removeMessageById(loadingId);
      if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);
      const result = await response.json();
      const botResponse = result?.bot_response || "Thank you! Your submission has been received.";
      addMessage(botResponse, "bot", "text");
    } catch (error) {
      console.error('Error in handleFormSubmit -> fetch:', error);
      removeMessageById(loadingId);
      addMessage("Sorry, there was an error submitting your form. Please try again.", "bot", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const DefaultUserMessage = ({ message, colors }) => (
    <div className={`px-4 py-3 rounded-2xl ${colors.userBubble} text-white rounded-br-md`}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
    </div>
  );
  
  const DefaultBotMessage = ({ message, colors, onOptionSelect, onFormSubmit }) => {
    const baseBubbleClasses = "bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm px-4 py-3";
    switch (message.messageType) {
      case "loading": return <div className={baseBubbleClasses}><div className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin text-blue-500" /><p className="text-sm">{message.text}</p></div></div>;
      case "error": return <div className="bg-red-50 text-red-800 rounded-2xl rounded-bl-none shadow-sm border border-red-200 px-4 py-3"><div className="flex items-start space-x-2"><XCircle className="w-4 h-4 mt-0.5 text-red-500" /><p className="text-sm">{message.text}</p></div></div>;
      case "form": return <DynamicFormComponent formData={message.customData.formData} resultActionbmit={onFormSubmit} colors={colors} />;
      case "question":
        const { payload } = message.customData;
        return (
          <div>
            <div className={baseBubbleClasses}><p className="text-sm leading-relaxed">{payload.question_text}</p></div>
            {payload.options && (
              <div className="mt-3 space-y-2">
                {Object.entries(payload.options).map(([key, value]) => (
                  <button key={key} onClick={() => onOptionSelect(value)} disabled={isLoading} className={`block w-full text-left px-4 py-2 text-sm bg-white border ${colors.border} ${colors.text} rounded-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      default: return <div className={baseBubbleClasses}><div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }} /></div>;
    }
  };

  const renderMessage = (message) => {
    const props = { message, colors, onFormSubmit: handleFormSubmit, onOptionSelect: handleResumeFlow };
    if (message.sender === "user") {
      return CustomUserMessage ? <CustomUserMessage {...props} /> : <DefaultUserMessage {...props} />;
    }
    return CustomBotMessage ? <CustomBotMessage {...props} /> : <DefaultBotMessage {...props} />;
  };

  return (
    <div className={`fixed ${positionConfig[position]} z-50`}>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className={`${colors.primary} text-white rounded-full p-4 shadow-xl transform transition-all duration-300 hover:scale-110 focus:outline-none`} aria-label="Open chat">
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width, height }}>
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.gradient} text-white p-4 flex justify-between items-center flex-shrink-0`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <img src="https://images.scalebranding.com/chatbot-woman-logo-0a79f97c-1fde-4cf9-8796-dbbbac54bb34.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold">{botName}</h3>
                <div className="flex items-center space-x-1.5"><span className={`w-2 h-2 rounded-full ${botStatus === 'Online' ? 'bg-green-400' : 'bg-red-400'}`}></span><p className="text-xs opacity-90">{botStatus}</p></div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors" aria-label="Close chat"><X className="w-5 h-5" /></button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} items-end space-x-2`}>
                {message.sender === "bot" && <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mb-1 flex items-center justify-center"><Bot className="w-5 h-5 text-gray-500" /></div>}
                <div className="max-w-xs lg:max-w-md">
                  {renderMessage(message)}
                  <p className={`text-xs mt-1.5 ${message.sender === "user" ? "text-right" : "text-left"} text-gray-400`}>{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 flex-shrink-0">
              <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label="Remove file">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex space-x-3 items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" disabled={isLoading}>
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="custom-scroll flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[48px] max-h-24 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                disabled={isLoading || threadId}
                rows={1}
              />
              <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading || threadId} className={`${colors.primary} disabled:bg-gray-400 text-white rounded-lg p-3 transition-all`}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudioChatBot;