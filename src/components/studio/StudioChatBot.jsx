"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, CheckCircle, Loader2, XCircle, Paperclip, FileText, Trash2, Mic, Square, Play, Pause, Volume2, VolumeX, Settings, MicOff } from "lucide-react"
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
// MAIN CHATBOT COMPONENT
// ============================================================================
const StudioChatBot = ({
  primaryColor = "primary",
  botName = "Sify Aurora Assistant",
  botStatus = "Online",
  width = "500px",
  height = "550px",
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
  voiceEnabled: propsVoiceEnabled = false,
  voiceConfig: propsVoiceConfig = {
    tts_provider: "piper",
    stt_provider: "whisper",
    mode: "voice_in_voice_out"
  }
}) => {
  const sanitizeMessageText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Normalize line endings
    let cleaned = text.replace(/\r\n/g, '\n').trim();

    // Check if the text contains HTML tags (e.g., <div>, <br>, <b>)
    const hasHtml = /<[a-z/][^>]*>/i.test(cleaned);

    if (hasHtml) {
      // If it contains HTML, clean it up more aggressively to prevent 
      // whitespace-pre-wrap from rendering formatting newlines.
      return cleaned
        .replace(/>\s*\n\s*</g, '><') // Remove newlines/indentation between tags
        .replace(/\n\s*</g, ' <')    // Replace newline before tag with a single space
        .replace(/>\s*\n/g, '> ')    // Replace newline after tag with a single space
        .replace(/\n/g, ' ')          // Replace remaining newlines with spaces
        .replace(/\s{2,}/g, ' ')      // Collapse multiple spaces
        .trim();
    }

    // For plain text, keep newlines but collapse excessive ones (3+ into 2)
    return cleaned.replace(/\n{3,}/g, '\n\n');
  };

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() =>
    messagesData.map(m => ({ ...m, text: sanitizeMessageText(m.text) }))
  )
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null) // { blob: Blob, url: string }
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Audio Playback & Mute State
  const [isMuted, setIsMuted] = useState(false)
  const currentAudioRef = useRef(null)

  // State for IDs
  const [threadId, setThreadId] = useState(null)
  const [localSessionId, setLocalSessionId] = useState(null)

  const [pausedContext, setPausedContext] = useState(null)

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const messageIdCounter = useRef(0)
  const flowStartedRef = useRef(false)
  const flowStateRef = useRef("idle")

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
  // Mute / Unmute Logic
  // ---------------------------
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      // If user is muting now, and audio is currently playing, stop it.
      if (newState && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      return newState;
    });
  }

  // ---------------------------
  // Audio Playback Helper (Background)
  // ---------------------------
  const playBackgroundAudio = (base64Content) => {
    // 1. Check if Muted
    if (isMuted) return;
    if (!base64Content) return;

    try {
      // 2. Stop any previously playing audio to prevent overlap
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      // Detect MIME Type
      const mimeType = base64Content.startsWith("UklGR") ? "audio/wav" : "audio/mp3";
      const src = `data:${mimeType};base64,${base64Content}`;

      const audio = new Audio(src);
      currentAudioRef.current = audio; // Store ref

      audio.play().catch(err => {
        console.error("Auto-play blocked or failed:", err);
      });

      // Cleanup ref when done
      audio.onended = () => {
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
      }

    } catch (e) {
      console.error("Error playing background audio:", e);
    }
  }

  // ---------------------------
  // Voice Recording Helpers
  // ---------------------------

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Save to state for review instead of sending immediately
        setRecordedAudio({ blob: audioBlob, url: audioUrl });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordedAudio(null); // Clear previous recording
    } catch (err) {
      console.error("Error accessing microphone:", err);
      addMessage("Could not access microphone. Please check permissions.", "bot", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    setRecordedAudio(null);
  };

  const sendRecording = async () => {
    if (!recordedAudio) return;

    try {
      // 1. Convert to Base64
      const base64Audio = await blobToBase64(recordedAudio.blob);

      // 2. Add visual audio message to chat (User)
      addMessage("", "user", "audio", null, { audioUrl: recordedAudio.url, base64: base64Audio });

      // 3. Clear recording state
      setRecordedAudio(null);

      // 4. Check current flow state and handle accordingly
      const currentState = flowStateRef.current;

      if (currentState === "paused" && pausedContext) {
        // Resume the flow with voice
        await handleResumeFlow(null, base64Audio);
      } else {
        // Start new flow with voice
        setPausedContext(null);
        setThreadId(null);
        flowStartedRef.current = false;
        await startNewFlow(null, [], base64Audio);
      }

    } catch (err) {
      console.error("Error sending audio:", err);
      addMessage("Error sending voice input.", "bot", "error");
    }
  };

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

    const cleanedText = sanitizeMessageText(text);

    const newMessage = {
      id: messageId,
      text: cleanedText,
      sender,
      messageType, // 'text' | 'file' | 'form' | 'question' | 'loading' | 'error' | 'audio'
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
    console.log("LOGGGG", data)

    if (data.thread_id) setThreadId(data.thread_id)
    if (data.session_id) setLocalSessionId(data.session_id)

    // Centralized status handling
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

    // File responses
    if (data.response_type === "pdf" || data.response_type === "doc" || data.type === "file") {
      const base64 = data.agent_response || data.payload?.base64 || null
      const respType = data.response_type || data.payload?.fileType || (data.type === "file" && data.payload?.fileType) || "pdf"
      const fileName = respType === "pdf" ? (data.payload?.fileName || "document.pdf") : (data.payload?.fileName || "document.docx")

      if (base64) {
        addMessage("File received", "bot", "file", null, { base64, fileType: respType, fileName })
        return
      }
    }

    // Form responses
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

    // General Response Types
    const respTypeUpper = (data.response_type || "").toString().toUpperCase()

    switch (respTypeUpper) {
      case "AUDIO":
        {
          // Requirement 3: Handle explicit audio response (e.g. file sharing)
          // agent_response should be base64
          const audioBase64 = data.agent_response || data.payload?.audio || "";
          if (audioBase64) {
            addMessage("", "bot", "audio", null, { base64: audioBase64 });
          } else {
            addMessage("Received audio response but data was empty.", "bot", "error");
          }
        }
        break;

      case "QUESTION":
        {
          const questionText = data.payload?.question_text || data.payload?.question || data.agent_response || "Question"
          addMessage(questionText, "bot", "question", null, { payload: data.payload || {} })

          // NEW: Play background audio if available
          if (data.voiceOutput) playBackgroundAudio(data.voiceOutput);
        }
        break

      case "END_OF_FLOW":
        {
          const msg = data.payload?.message || data.agent_response || "The flow has completed."
          addMessage(msg, "bot", "text")

          // NEW: Play background audio if available
          if (data.voiceOutput) playBackgroundAudio(data.voiceOutput);

          setThreadId(null)
          flowStartedRef.current = false
          setPausedContext(null)
          flowStateRef.current = "completed"
        }
        break

      case "MESSAGE":
      case "TEXT":
        {
          const msg = data.agent_response || data.message || "Message from bot."
          addMessage(msg, "bot", "text")

          // NEW: Play background audio if available
          if (data.voiceOutput) playBackgroundAudio(data.voiceOutput);
        }
        break

      default:
        // Fallback
        if (data.agent_response) {
          const botResp = data.agent_response
          addMessage(botResp, "bot", "text")
          // NEW: Play background audio if available
          if (data.voiceOutput) playBackgroundAudio(data.voiceOutput);

        } else {
          if (data.payload && data.payload.options) {
            addMessage(data.payload.question_text || data.payload.question || "Choose an option", "bot", "question", null, { payload: data.payload })
            // NEW: Play background audio if available
            if (data.voiceOutput) playBackgroundAudio(data.voiceOutput);
          } else {
            addMessage("Sorry, I'm not sure how to handle that response.", "bot", "error")
          }
        }
        break
    }
  }

  // ---------------------------
  // startNewFlow: handles Text, Files, and Voice inputs
  // ---------------------------
  const startNewFlow = async (firstUserMessage, fileBase64Array = [], voiceBase64 = null) => {
    setIsLoading(true)
    const loadingMsg = addMessage("Processing...", "bot", "loading")
    try {
      const activeSessionId = localSessionId || sessionId;

      let payload = {
        agent_id: flow?.id || apiConfig?.agent_id,
      }

      if (activeSessionId) {
        payload.session_id = activeSessionId
      }

      if (voiceBase64) {
        payload.voice_enabled = true;
        payload.userInput = {
          voiceInput: voiceBase64
        };
      } else {
        payload.userInput = {
          message: firstUserMessage,
          uploadedFiles: fileBase64Array
        }
      }

      if (propsVoiceEnabled) {
        payload.voice_config = propsVoiceConfig;
      }

      const token = localStorage.getItem("token") || "";

      const res = await fetch(`https://apidev.sifymodernization.digital/engine/agents/invoke/${flow?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      removeMessageById(loadingMsg.id)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log("LOGGGGG", data);
      processApiResponse(data)
      flowStartedRef.current = true
    } catch (error) {
      console.error("Error starting flow:", error)
      removeMessageById(loadingMsg.id)
      addMessage("Sorry, I couldn't start the conversation. Please try again.", "bot", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------------------
  // handleResumeFlow - FIXED to handle voice input
  // ---------------------------
  const handleResumeFlow = async (resumeValue, voiceBase64 = null) => {
    setIsLoading(true)
    const loadingMsg = addMessage("Thinking...", "bot", "loading")
    try {
      let body
      if (pausedContext) {
        body = {
          agent_id: pausedContext.agent_id,
          user_id: pausedContext.user_id,
          session_id: pausedContext.session_id,
          thread_id: pausedContext.thread_id,
          node_id: pausedContext.node_id,
        }

        // Handle voice vs text input
        if (voiceBase64) {
          // For voice input, add voice fields at root level (not nested)
          body.voice_enabled = true;
          body.voiceInput = voiceBase64;
          // Don't include input_type for voice as per your requirement
        } else {
          // For text input
          body.user_response = resumeValue;
          body.input_type = pausedContext.input_type;
        }
      } else {
        // Fallback when no paused context
        body = {
          agent_id: flow?.id || apiConfig?.agent_id,
          thread_id: threadId,
        }

        if (voiceBase64) {
          body.voice_enabled = true;
          body.voiceInput = voiceBase64;
        } else {
          body.user_response = resumeValue;
        }
      }

      if (propsVoiceEnabled) {
        body.voice_config = propsVoiceConfig;
      }

      const token = localStorage.getItem("token") || "";
      const res = await fetch(`https://apidev.sifymodernization.digital/engine/agents/resume/${flow?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body)
      })

      removeMessageById(loadingMsg.id)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      processApiResponse(data)
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
  // handleSendMessage
  // ---------------------------
  const handleSendMessage = async () => {
    if (!(inputValue.trim()) && uploadedFiles.length === 0) return

    let userMessage = sanitizeMessageText(inputValue)
    let fileData = []
    if (uploadedFiles.length > 0) {
      fileData = uploadedFiles.map(f => f.base64)
      if (!userMessage) {
        userMessage = `Uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(", ")}`
      }
    }

    addMessage(userMessage, "user")
    setInputValue("")

    const currentState = flowStateRef.current

    if (currentState === "paused" && pausedContext) {
      await handleResumeFlow(userMessage)
      setUploadedFiles([])
      return
    }

    setPausedContext(null)
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
    addMessage(option.text, "user")

    if (option.nextMessage) {
      setTimeout(() => {
        const nextMessage = {
          ...option.nextMessage,
          id: generateUniqueId(),
          timestamp: new Date(),
          text: sanitizeMessageText(option.nextMessage.text)
        }
        setMessages((prev) => [...prev, nextMessage])
      }, 400)
    }

    if (flowStateRef.current === "paused") {
      await handleResumeFlow(option.text)
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

  const DefaultUserMessage = ({ message, colors }) => {
    if (message.messageType === "audio") {
      // Requirement 2: Render User Audio
      const src = message.customData.audioUrl || `data:audio/webm;base64,${message.customData.base64}`;
      return (
        <div className={`px-4 py-3 rounded-2xl ${colors.userBubble} text-white rounded-br-md flex items-center min-w-[200px]`}>
          <audio controls src={src} className="w-full h-8 max-w-[240px]" />
        </div>
      );
    }
    return (
      <div className={`px-4 py-3 rounded-2xl ${colors.userBubble} text-white rounded-br-md`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
    );
  }

  const DefaultBotMessage = ({ message, colors, onOptionClick, onFormSubmit }) => {
    if (message.messageType === "audio") {
      // Explicit File Transfer Audio (keep player visible)
      const src = `data:audio/mp3;base64,${message.customData.base64}`;
      return (
        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3 min-w-[220px]">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-semibold mb-1">Voice Response</p>
            <audio controls src={src} className="w-full h-8" />
          </div>
        </div>
      );
    }

    return (
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
                return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`
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
          <div>
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 px-4 py-3">
              <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text }} />
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
  }

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
              <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{botName}</h3>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${botStatus === 'Online' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <p className="text-xs text-white/80">{botStatus}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Mute/Unmute Toggle Button */}
              <button
                onClick={toggleMute}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button onClick={() => setIsOpen(false)} className="text-white cursor-pointer hover:bg-opacity-20 rounded-full p-2 transition-colors focus:outline-none" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>
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
              {/* File Attachment */}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf, .xls, .xlsx, .csv" multiple className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100" aria-label="Upload files" disabled={isLoading || isRecording}>
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Voice Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${isRecording ? "text-red-500 bg-red-50 animate-pulse" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"} transition-colors p-2 rounded-full`}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                disabled={isLoading}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              {recordedAudio ? (
                // REVIEW MODE UI
                <div className="flex flex-1 items-center gap-2 bg-gray-50 rounded-md px-2 py-1">
                  <audio controls src={recordedAudio.url} className="h-8 flex-1 w-full" />
                  <button onClick={cancelRecording} className="text-red-500 p-1 hover:bg-gray-200 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRecording ? "Recording..." : "Type your message..."}
                  className="custom-scroll flex-1 border border-gray-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none overflow-y-auto h-15 disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={isLoading || isRecording}
                />
              )}

              {/* Send Button */}
              {recordedAudio ? (
                <button onClick={sendRecording} disabled={isLoading} className={`${colors.primary} text-white rounded-full p-3 transition-all duration-200 focus:outline-none`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              ) : (
                <button onClick={handleSendMessage} disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isLoading || isRecording} className={`${colors.primary} disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-all duration-200 focus:outline-none`}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudioChatBot
