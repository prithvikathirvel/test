  "use client"

  import { useState, useRef, useEffect } from "react"
  import { MessageCircle, X, Send, User, Bot, CheckCircle, Loader2 ,XCircle, Paperclip, FileText, Trash2 } from "lucide-react"
  import { useDispatch, useSelector } from "react-redux"
  import { parseAndNormalizeFormData } from "@/utils/commonFunction"

  // ============================================================================
  // DYNAMIC FORM COMPONENT (unchanged)
  // ============================================================================
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
      // parent handles further state changes
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
            className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
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

  // ============================================================================
  // MAIN CHATBOT COMPONENT (updated with flow state management)
  // ============================================================================
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
    onOptionClicked = null,
    onApiCall = null,
    handleRenderFlow = null,
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(messagesData)
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [threadId, setThreadId] = useState(null)
    const [pausedContext, setPausedContext] = useState(null)

    const fileInputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const messageIdCounter = useRef(0)
    const flowStartedRef = useRef(false)
    const flowStateRef = useRef("idle") // "idle" | "started" | "paused" | "completed"

    const dispatch = useDispatch()
    const flowOutput = useSelector((state) => state?.studio?.flowOutput)
    const sessionId = useSelector((state) => state?.studio?.sessionId)

    const generateUniqueId = () => {
      messageIdCounter.current += 1
      return `msg-${Date.now()}-${messageIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`
    }

    const colorConfig = {
      blue: {
        primary: "bg-blue-600 hover:bg-blue-700",
        gradient: "from-blue-600 to-blue-700",
        text: "text-blue-600",
        border: "border-blue-200 hover:border-blue-300",
        bg: "bg-blue-50",
        userBubble: "bg-blue-600",
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
    const colors = colorConfig[primaryColor] || colorConfig.blue

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

    // ---------------------------
    // File upload helpers
    // ---------------------------
    const convertFileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const base64 = reader.result.split(",")[1]
          resolve(base64)
        }
        reader.onerror = (error) => reject(error)
      })
    }

    const handleFileUpload = async (event) => {
      const files = Array.from(event.target.files)
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ]

      const validFiles = files.filter((file) => allowedTypes.includes(file.type))

      if (validFiles.length === 0) {
        alert("Please select only PDF, XLS, XLSX, or CSV files.")
        return
      }

      try {
        const filePromises = validFiles.map(async (file) => {
          const base64 = await convertFileToBase64(file)
          return {
            id: generateUniqueId(),
            name: file.name,
            base64,
            size: file.size,
            formattedData: `${file.name};${base64}`,
          }
        })

        const processedFiles = await Promise.all(filePromises)
        setUploadedFiles((prev) => [...prev, ...processedFiles])

        if (fileInputRef.current) fileInputRef.current.value = ""
      } catch (error) {
        console.error("Error processing files:", error)
        addMessage("Error processing files. Please try again.", "bot", "error")
      }
    }

    const removeFile = (fileId) => setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    // ---------------------------
    // Message helpers
    // ---------------------------
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
      if (onMessageSent) onMessageSent(newMessage)
      return newMessage
    }

    const removeMessageById = (messageId) => setMessages((prev) => prev.filter((m) => m.id !== messageId))

    // ---------------------------
    // processApiResponse: central response handler
    // ---------------------------
    const processApiResponse = (data) => {
      if (!data) {
        addMessage("Empty response from server.", "bot", "error")
        return
      }

      // Save thread id if returned
      if (data.thread_id) setThreadId(data.thread_id)

      // Centralized status handling (keeps flowStateRef in sync)
      if (data.status) {
        const st = data.status.toString().toUpperCase()
        if (st === "PAUSED") {
          flowStateRef.current = "paused"
          setPausedContext({
            agent_id: flow?.id || null,
            user_id: data?.user_id || null,
            session_id: data?.session_id || null,
            thread_id: data?.thread_id || null,
            node_id: data?.payload?.node_id || null,
            input_type: data?.payload?.input_type || null
          })
        } else if (st === "COMPLETED" || st === "END_OF_FLOW" || st === "FINISHED") {
          flowStateRef.current = "completed"
          setPausedContext(null)
          setThreadId(null)
          flowStartedRef.current = false
        } else {
          flowStateRef.current = "started"
          setPausedContext(null)
        }
      }

      // File responses: pdf/doc (base64)
      if (data.response_type === "pdf" || data.response_type === "doc" || data.type === "file") {
        const base64 = data.agent_response || data.payload?.base64 || null
        const respType = data.response_type || data.payload?.fileType || (data.type === "file" && data.payload?.fileType) || "pdf"
        const fileName = respType === "pdf" ? (data.payload?.fileName || "document.pdf") : (data.payload?.fileName || "document.docx")

        if (base64) {
          addMessage("File received", "bot", "file", null, { base64, fileType: respType, fileName })
          return
        }
      }

      // If flow returns a 'form' structure (handle older runFlow-style responses)
      if (data.type === "form" || data.response_type === "form") {
        try {
          const parsed = typeof data.agent_response === "string" ? parseAndNormalizeFormData(data.agent_response) : data.payload || {}
          if (parsed && parsed.formValues && parsed.submit) {
            addMessage(parsed['template Name'] || 'Please fill out this form', "bot", "form", null, { formData: parsed })
            return
          }
        } catch (e) {
          console.error("Form parse error:", e)
          addMessage("Received a form but couldn't display it.", "bot", "error")
          return
        }
      }

      // Map typical response types used in File A
      const respTypeUpper = (data.response_type || "").toString().toUpperCase()

      switch (respTypeUpper) {
        case "QUESTION":
          {
            const questionText = data.payload?.question_text || data.payload?.question || data.agent_response || "Question"
            addMessage(questionText, "bot", "question", null, { payload: data.payload || {} })
          }
          break

        case "END_OF_FLOW":
          {
            const msg = data.payload?.message || data.agent_response || "The flow has completed."
            addMessage(msg, "bot", "text")
            setThreadId(null)
            flowStartedRef.current = false
            setPausedContext(null)
            flowStateRef.current = "completed"
          }
          break

        case "MESSAGE":
        case "TEXT":
          {
            const msg = data.payload?.text || data.agent_response || data.message || "Message from bot."
            addMessage(msg, "bot", "text")
          }
          break

        default:
          // If response has agent_response string, show it
          if (data.agent_response) {
            const botResp = data.agent_response
            addMessage(botResp, "bot", "text")
          } else {
            // If we have payload with options/questions, surface them
            if (data.payload && data.payload.options) {
              addMessage(data.payload.question_text || data.payload.question || "Choose an option", "bot", "question", null, { payload: data.payload })
            } else {
              addMessage("Sorry, I'm not sure how to handle that response.", "bot", "error")
            }
          }
          break
      }
    }

    // ---------------------------
    // startNewFlow: called only when first user message sent
    // Uses runFlow-style payload for execute-graph
    // ---------------------------
    const startNewFlow = async (firstUserMessage, fileBase64Array = []) => {
      setIsLoading(true)
      const loadingMsg = addMessage("Processing...", "bot", "loading")
      try {
        const payload = {
          agent_id: flow?.id || apiConfig?.agent_id,
          userInput: {
            message: firstUserMessage,
            uploadedFiles: fileBase64Array,
            ...(sessionId && { session_id: sessionId })
          }
        }
        const token = localStorage.getItem("token") || "";

        // execute-graph endpoint
        const res = await fetch(`http://1.6.37.35/engine/agents/invoke/${flow?.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${token}`},
          body: JSON.stringify(payload)
        })

        removeMessageById(loadingMsg.id)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        processApiResponse(data)
        flowStartedRef.current = true
        // flowStateRef will be set by processApiResponse based on response.status
      } catch (error) {
        console.error("Error starting flow:", error)
        removeMessageById(loadingMsg.id)
        addMessage("Sorry, I couldn't start the conversation. Please try again.", "bot", "error")
      } finally {
        setIsLoading(false)
      }
    }

    // ---------------------------
    // handleResumeFlow: unchanged behavior but updates flow state based on response
    // ---------------------------
    const handleResumeFlow = async (resumeValue) => {
      // resumeValue is user's selected option or typed value
      // addMessage(resumeValue, "user")
      setIsLoading(true)
      const loadingMsg = addMessage("Thinking...", "bot", "loading")
      try {
        let body
        if (pausedContext) {
          // when paused, send full resume payload (preserve original format)
          body = {
            agent_id: pausedContext.agent_id,
            user_id: pausedContext.user_id,
            session_id: pausedContext.session_id,
            thread_id: pausedContext.thread_id,
            node_id: pausedContext.node_id,
            user_response: resumeValue,
            input_type: pausedContext.input_type
          }
        } else {
          // fallback to thread-based resume
          body = {
            agent_id: flow?.id || apiConfig?.agent_id,
            thread_id: threadId,
            user_response: resumeValue
          }
        }
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`http://1.6.37.35/engine/agents/resume/${flow?.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" ,"Authorization": `Bearer ${token}`},
          body: JSON.stringify(body)
        })

        removeMessageById(loadingMsg.id)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        processApiResponse(data)
        // If resume succeeded and response didn't set paused/completed, mark flow started or completed
        if (!data?.status || data.status.toString().toUpperCase() !== "PAUSED") {
          flowStateRef.current = data?.status && data.status.toString().toUpperCase() === "COMPLETED" ? "completed" : "started"
        }
      } catch (error) {
        console.error("Error resuming flow:", error)
        removeMessageById(loadingMsg.id)
        addMessage("Sorry, something went wrong. Please try again.", "bot", "error")
      } finally {
        setIsLoading(false)
      }
    }

    // ---------------------------
    // handleSendMessage: adjusted so that when flow is COMPLETED it will call startNewFlow again
    // - If flow is PAUSED -> resumeFlow
    // - Else -> always call startNewFlow (so the API call is always made when not paused)
    // ---------------------------
    const handleSendMessage = async () => {
      if (!(inputValue.trim()) && uploadedFiles.length === 0) return

      // prepare message text and files
      let userMessage = inputValue.trim()
      let fileData = []
      if (uploadedFiles.length > 0) {
        fileData = uploadedFiles.map(f => f.base64)
        if (!userMessage) {
          userMessage = `Uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(", ")}`
        }
      }

      // Show user's message in chat
      addMessage(userMessage, "user")
      setInputValue("")

      const currentState = flowStateRef.current

      // CASE: Flow is PAUSED -> resume
      if (currentState === "paused" && pausedContext) {
        await handleResumeFlow(userMessage)
        setUploadedFiles([])
        return
      }

      // For all other states (idle, completed, started but not paused) we make an API call via startNewFlow.
      // This ensures API call is always made except when resuming a paused flow.
      setPausedContext(null)
      // reset thread info for a fresh invocation
      setThreadId(null)
      flowStartedRef.current = false
      await startNewFlow(userMessage, fileData)
      setUploadedFiles([])
    }

    // ---------------------------
    // handleFormSubmit (unchanged)
    // ---------------------------
    const handleFormSubmit = async (formData, submitInfo) => {
      addMessage(`Submitted: ${submitInfo.templateName}`, 'user');
      setIsLoading(true);

      const loadingId = generateUniqueId();
      addMessage("Processing your submission...", "bot", "loading", loadingId);

      try {
        const response = await fetch(submitInfo.submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        removeMessageById(loadingId);

        if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);

        const result = await response.json();
        const botResponse = result?.agent_response || "Thank you! Your submission has been received.";
        addMessage(botResponse, "bot", "text");
      } catch (error) {
        console.error('Error in handleFormSubmit -> fetch:', error);
        removeMessageById(loadingId);
        addMessage("Sorry, there was an error submitting your form. Please try again.", "bot", "error");
      } finally {
        setIsLoading(false);
      }
    }

    // ---------------------------
    // UI & message renderers
    // ---------------------------
    const handleOptionClick = async (option, messageData) => {
      // When option clicked, show as user message
      addMessage(option.text, "user")

      // if option has nextMessage, show it locally
      if (option.nextMessage) {
        setTimeout(() => {
          const nextMessage = { ...option.nextMessage, id: generateUniqueId(), timestamp: new Date() }
          setMessages((prev) => [...prev, nextMessage])
        }, 400)
      }

      // Only resume flow if paused (ensures we don't accidentally call resume when not in paused state)
      if (flowStateRef.current === "paused") {
        await handleResumeFlow(option.text)
      } else {
        // If not paused, optionally handle as normal chat or ignore (we currently ignore backend call)
      }

      if (onOptionClicked) onOptionClicked(option, messageData)
    }

    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    }

    const formatTime = (timestamp) => timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const DefaultUserMessage = ({ message, colors }) => (
      <div className={`px-4 py-3 rounded-2xl ${colors.userBubble} text-white rounded-br-md`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
    )

    const DefaultBotMessage = ({ message, colors, onOptionClick, onFormSubmit }) => (
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
        ) : message.messageType === "form" ? (
          <DynamicFormComponent
              formData={message.customData.formData}
              resultActionbmit={onFormSubmit}
              colors={colors}
          />
        ) : message.messageType === "file" ? (
          // File card
          <div className="bg-white text-gray-800 rounded-xl shadow flex items-center border border-gray-200 p-4 space-x-4 hover:shadow-md transition-all">
            <div className="flex-shrink-0">
              {message.customData.fileType === "pdf" ? (
                <FileText className="w-10 h-10 text-red-500" />
              ) : (
                <FileText className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.customData.fileName}</p>
              <p className="text-xs text-gray-500">{(() => {
                const bytes = Math.ceil((message.customData.base64.length * 3) / 4)
                const kb = (bytes / 1024)
                return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb/1024).toFixed(2)} MB`
              })()}</p>
            </div>
            <button
              onClick={() => {
                const link = document.createElement("a")
                link.href = `data:application/${message.customData.fileType};base64,${message.customData.base64}`
                link.download = message.customData.fileName
                link.click()
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs transition"
            >
              Download
            </button>
          </div>
        ) : message.messageType === "question" ? (
          // question + options rendering
          <div>
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3">
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
            {message.customData?.payload?.options && (
              <div className="mt-3 space-y-2">
                {Object.entries(message.customData.payload.options).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => onOptionClick({ text: value }, message)}
                    disabled={isLoading}
                    className={`block w-full text-left px-4 py-2 text-sm bg-white border ${colors.border} ${colors.text} rounded-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3">
            <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }} />
          </div>
        )}

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
    )

    const renderMessage = (message) => {
      const commonProps = { message, colors, onFormSubmit: handleFormSubmit, onOptionClick: handleOptionClick }
      if (message.sender === "user") {
        return CustomUserMessage ? <CustomUserMessage {...commonProps} /> : <DefaultUserMessage {...commonProps} />
      } else {
        return CustomBotMessage ? <CustomBotMessage {...commonProps} /> : <DefaultBotMessage {...commonProps} />
      }
    }

    // ---------------------------
    // UI - return
    // ---------------------------
    return (
      <div className={`fixed ${positionConfig[position]} z-50`}>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`${colors.primary} text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        )}

        {isOpen && (
          <div className="bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden" style={{ width, height }}>
            {/* Header */}
            <div className={`bg-gradient-to-r ${colors.gradient} text-white p-5 flex justify-between items-center`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <img src="https://images.scalebranding.com/chatbot-woman-logo-0a79f97c-1fde-4cf9-8796-dbbbac54bb34.jpg" alt="Chatbot Logo" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{botName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${botStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <p className="text-sm opacity-90">{botStatus}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white cursor-pointer hover:bg-opacity-20 rounded-full p-2 transition-colors focus:outline-none" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} items-end space-x-2`}>
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mb-1">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                  )}

                  <div className={`max-w-xs lg:max-w-sm ${message.sender === "user" ? "order-2" : "order-1"}`}>
                    {renderMessage(message)}
                    <p className={`text-xs mt-2 ${message.sender === "user" ? "text-right" : "text-left"} text-gray-400`}>{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* File upload area (bottom of chat, shows uploaded files before sending) */}
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
                      <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Remove file">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-5 border-t bg-white">
              <div className="flex space-x-3 items-end">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf, .xls, .xlsx, .csv" multiple className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100" aria-label="Upload files" disabled={isLoading}>
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
                <button onClick={handleSendMessage} disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading} className={`${colors.primary} disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-all duration-200 focus:outline-none`}>
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
