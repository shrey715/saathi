"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

// Bitmoji style expressions library - more expressive and relatable
const characterExpressions = {
  default: [
    { image: "/bitmoji/happy.png", fallbackEmoji: "😊", description: "Happy" },
    { image: "/bitmoji/listen.png", fallbackEmoji: "🤔", description: "Listening" },
    { image: "/bitmoji/neutral.png", fallbackEmoji: "🙂", description: "Neutral" },
    { image: "/bitmoji/excited.png", fallbackEmoji: "😄", description: "Excited" },
  ],
  thinking: [
    { image: "/bitmoji/thinking.png", fallbackEmoji: "🤔", description: "Thinking" },
    { image: "/bitmoji/curious.png", fallbackEmoji: "🧐", description: "Curious" }
  ],
  supportive: [
    { image: "/bitmoji/supportive.png", fallbackEmoji: "🫂", description: "Supportive" },
    { image: "/bitmoji/caring.png", fallbackEmoji: "❤️", description: "Caring" },
    { image: "/bitmoji/empathy.png", fallbackEmoji: "🥺", description: "Empathetic" }
  ],
  celebration: [
    { image: "/bitmoji/celebrate.png", fallbackEmoji: "🎉", description: "Celebrating" },
    { image: "/bitmoji/cheer.png", fallbackEmoji: "🙌", description: "Cheering" }
  ],
  concern: [
    { image: "/bitmoji/concerned.png", fallbackEmoji: "😟", description: "Concerned" },
    { image: "/bitmoji/worried.png", fallbackEmoji: "😨", description: "Worried" }
  ],
  calm: [
    { image: "/bitmoji/calm.png", fallbackEmoji: "😌", description: "Calm" }
  ],
  motivated: [
    { image: "/bitmoji/motivated.png", fallbackEmoji: "💪", description: "Motivated" }
  ],
  curious: [
    { image: "/bitmoji/curious.png", fallbackEmoji: "🧐", description: "Curious" }
  ],
  empathetic: [
    { image: "/bitmoji/empathy.png", fallbackEmoji: "🥺", description: "Empathetic" }
  ],
  hopeful: [
    { image: "/bitmoji/hopeful.png", fallbackEmoji: "✨", description: "Hopeful" }
  ],
  gentle: [
    { image: "/bitmoji/gentle.png", fallbackEmoji: "🌸", description: "Gentle" }
  ],
  confident: [
    { image: "/bitmoji/confident.png", fallbackEmoji: "😎", description: "Confident" }
  ],
  reflective: [
    { image: "/bitmoji/reflective.png", fallbackEmoji: "🤔", description: "Reflective" }
  ],
  respectful: [
    { image: "/bitmoji/respectful.png", fallbackEmoji: "🙏", description: "Respectful" }
  ],
  warm: [
    { image: "/bitmoji/warm.png", fallbackEmoji: "☀️", description: "Warm" }
  ]
};

// Background colors for chat bubbles
const bubbleColors = {
  user: "#EBF5FF",      // Light blue
  bot: "#F9FAFB",       // Light gray
  system: "#FFEDD5"     // Light orange
};

// Emotion-based background tint colors
const emotionTints = {
  default: "from-blue-50 to-indigo-50",
  thinking: "from-purple-50 to-indigo-50",
  supportive: "from-green-50 to-emerald-50",
  celebration: "from-yellow-50 to-amber-50",
  concern: "from-red-50 to-pink-50",
  calm: "from-blue-50 to-cyan-50",
  motivated: "from-orange-50 to-amber-50",
  curious: "from-violet-50 to-purple-50",
  empathetic: "from-rose-50 to-pink-50",
  hopeful: "from-emerald-50 to-green-50",
  gentle: "from-pink-50 to-rose-50",
  confident: "from-amber-50 to-yellow-50",
  reflective: "from-slate-50 to-gray-50",
  respectful: "from-indigo-50 to-blue-50",
  warm: "from-orange-50 to-yellow-50"
};

// Common mental health topics users might want to explore
const suggestedTopics = [
  "I've been feeling anxious lately",
  "How can I improve my sleep?",
  "I need help with stress management",
  "Tell me about mindfulness techniques",
  "How to deal with negative thoughts?",
  "Ways to improve my mood today",
  "Tips for better work-life balance"
];

// More dynamic filler messages for different scenarios
const fillerMessages = {
  greeting: [
    "Hey there! I'm Saathi, your mental wellness buddy. What's brewing in your mind today?",
    "Oh hi! Saathi here, ready to chat about life's rollercoaster. How's your ride going?",
    "Welcome aboard! I'm Saathi, your friendly thought-untangler. What's the brain cooking today?",
    "Hello! I'm Saathi, here for you anytime. How are you feeling right now?",
    "Greetings! Saathi at your service. What would you like to talk about today?",
    "Hi there! Saathi's the name, mental wellness is my game. How can I support you?",
    "Good day! I'm Saathi, your digital companion. What's on your mind?",
    "Welcome back! Saathi here, ready to listen. How has your day been so far?"
  ],
  error: [
    "Whoops! My brain cells are doing the macarena. Mind trying again?",
    "Houston, we have a problem! My circuits need a quick nap. Let's reconnect in a jiffy.",
    "Well, this is awkward. I seem to have tripped over my digital shoelaces. One more try?"
  ]
};

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'saathi',
      content: fillerMessages.greeting[Math.floor(Math.random() * fillerMessages.greeting.length)],
      timestamp: new Date().toISOString(),
      expression: "default"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inCrisisMode, setInCrisisMode] = useState(false);
  const [previousMessages, setPreviousMessages] = useState<{
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    expression: string;
  }[]>([]);
  const [isResettingChat, setIsResettingChat] = useState(false);
  const [token, setToken] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(70); // default estimation
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check authentication before showing content
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No authentication token found, redirecting to login');
          router.push('/login');
          return;
        }

        // Verify the token with a request to the backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/get-user-details';
        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          console.log('Authentication failed, redirecting to login');
          router.push('/login');
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setToken(token);

        // Initialize chat with greeting message
        setMessages([
          {
            id: 1,
            sender: 'saathi',
            content: fillerMessages.greeting[Math.floor(Math.random() * fillerMessages.greeting.length)],
            timestamp: new Date().toISOString(),
            expression: "default"
          }
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    console.log("Current emotion updated:", currentEmotion);
    console.log("Current emotion tint:", emotionTints[currentEmotion]);
  }, [currentEmotion]);


  // Scroll to bottom when messages change
  useEffect(() => {
    if (isLoading) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Periodically change Saathi's expression for a more dynamic feel
  useEffect(() => {
    if (isLoading) return;
    const expressionInterval = setInterval(() => {
      if (messages.length > 0 && !isTyping) {
        const expressionType = messages[messages.length - 1].expression || "default";
        const expressionsOfType = characterExpressions[expressionType] || characterExpressions.default;
        const newExpression = Math.floor(Math.random() * expressionsOfType.length);
        setCurrentExpression(newExpression);
      }
    }, 8000);

    return () => clearInterval(expressionInterval);
  }, [messages, isTyping]);

  // Measure the actual footer height
  useEffect(() => {
    if (isLoading) return;
    const footer = document.querySelector('footer');

    const updateFooterHeight = () => {
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        setFooterHeight(footerRect.height + 16); // Add some padding
      }
    };

    // Initial measurement
    updateFooterHeight();

    // Re-measure on resize
    window.addEventListener('resize', updateFooterHeight);

    // Setup a mutation observer to detect DOM changes that might affect footer
    const resizeObserver = new ResizeObserver(() => {
      updateFooterHeight();
    });

    if (footer) {
      resizeObserver.observe(footer);
    }

    return () => {
      window.removeEventListener('resize', updateFooterHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // Function to send chat message to the server
  const sendMessageToServer = async (message) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/chat';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", data); // Debug the server response
      console.log("Emotion received from backend:", data.emotion); // Log the specific emotion

      // Return both the response text and emotion
      return data;
    } catch (error) {
      console.error('Error sending message to server:', error);
      setCurrentEmotion('concern'); // Set emotion to concern on error
      return {
        response: fillerMessages.error[Math.floor(Math.random() * fillerMessages.error.length)],
        emotion: 'concern'
      };
    }
  };

  // Reset the chat thread
  const resetChatThread = async () => {
    setIsResettingChat(true);
    try {
      const response = await fetch('http://localhost:8000/api/reset-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset the UI
      setMessages([{
        id: Date.now(),
        sender: 'saathi',
        content: fillerMessages.greeting[Math.floor(Math.random() * fillerMessages.greeting.length)],
        timestamp: new Date().toISOString(),
        expression: "default"
      }]);
      setShowSuggestions(true);
      setInCrisisMode(false);
      setPreviousMessages([]);
      setCurrentEmotion('default');
    } catch (error) {
      console.error('Error resetting chat thread:', error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'system',
        content: "There was an error resetting the chat. Please try again.",
        timestamp: new Date().toISOString(),
        expression: "concern"
      }]);
    } finally {
      setIsResettingChat(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent, suggestedMessage?: string) => {
    e?.preventDefault();
    const content = suggestedMessage || inputMessage;
    if (content.trim() === '') return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: content,
      timestamp: new Date().toISOString(),
      expression: "default" // Add the required expression property
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false); // Hide suggestions after user sends a message

    try {
      // Send message to server - now returns { response, emotion }
      const data = await sendMessageToServer(content);

      // Extract the emotion from the response and update state
      const messageEmotion = data.emotion || 'default';
      setCurrentEmotion(messageEmotion);

      console.log("Setting emotion to:", messageEmotion);

      // Add AI response with correct emotion
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'saathi',
        content: data.response,
        timestamp: new Date().toISOString(),
        expression: messageEmotion
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat conversation:', error);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'saathi',
        content: fillerMessages.error[Math.floor(Math.random() * fillerMessages.error.length)],
        timestamp: new Date().toISOString(),
        expression: "concern"
      };

      setMessages(prev => [...prev, errorMessage]);
      setCurrentEmotion('concern'); // Update emotion for error state
    } finally {
      setIsTyping(false);
    }
  };

  const handleCrisisMode = async () => {
    setInCrisisMode(true);

    // Store current conversation state
    setPreviousMessages([...messages]);
    // Add system message about entering crisis mode
    const systemMessage = {
      id: Date.now(),
      sender: 'system',
      content: "Crisis support activated. If you're in immediate danger, please call emergency services (911) or text HOME to 741741 to reach Crisis Text Line.",
      timestamp: new Date().toISOString(),
      expression: "concern"
    };

    setMessages([systemMessage]);

    // Reset the chat thread on the server
    await resetChatThread();

    // Add bot message with crisis support
    const botMessage = {
      id: Date.now() + 1,
      sender: 'saathi',
      content: "I notice you've activated crisis support. I'm here for you. Can you tell me a bit about what's going on right now so I can best support you?",
      timestamp: new Date().toISOString(),
      expression: "concern"
    };

    setMessages(prev => [...prev, botMessage]);
    setCurrentEmotion('concern');
  };

  const exitCrisisMode = async () => {
    setInCrisisMode(false);

    // Reset the chat thread on the server
    await resetChatThread();

    // Restore previous conversation or start fresh
    if (previousMessages.length > 0) {
      setMessages([...previousMessages]);
    } else {
      // Start fresh with a greeting
      setMessages([{
        id: Date.now(),
        sender: 'saathi',
        content: fillerMessages.greeting[Math.floor(Math.random() * fillerMessages.greeting.length)],
        timestamp: new Date().toISOString(),
        expression: "default"
      }]);
    }
    setCurrentEmotion('default');
  };

  // Get current expression data
  const getCurrentExpression = () => {
    const expressionType = currentEmotion || "default";
    const expressionsOfType = characterExpressions[expressionType] || characterExpressions.default;
    return expressionsOfType[currentExpression % expressionsOfType.length];
  };

  const currentExpressionData = getCurrentExpression();
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-indigo-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Preparing Saathi for your chat...</p>
      </div>
    );
  }
  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br ${emotionTints[currentEmotion]} overflow-hidden`}>
      {/* Header */}
      <div className="fixed h-16 top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center">
          {inCrisisMode && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 text-gray-700"
              onClick={exitCrisisMode}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-2 overflow-hidden"
            >
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentExpressionData.fallbackEmoji}
              </motion.span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">
                Saathi
                {inCrisisMode && <span className="text-xs ml-2 text-red-500 font-normal">Crisis Mode</span>}
              </h1>
              <p className="text-xs text-gray-500">Your wellness companion</p>
            </div>
          </div>
        </div>

        {/* Reset button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetChatThread}
          disabled={isResettingChat}
          className="text-gray-500 hover:text-indigo-600"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isResettingChat ? 'animate-spin' : ''}`} />
          {isResettingChat ? 'Resetting...' : 'New Chat'}
        </Button>

        {inCrisisMode && (
          <div className="text-sm text-red-500 font-medium animate-pulse">
            Crisis Support Active
          </div>
        )}
      </div>

      {/* Main Chat Area - Adjust this container to account for fixed bottom bar */}
      <div
        ref={chatContainerRef}
        className="relative z-10 pt-16 pb-20 flex-grow flex flex-col overflow-hidden bg-white/40"
      >
        {/* Messages container */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${message.sender === 'system' ? 'justify-center' : ''}`}
              >
                {message.sender === 'system' ? (
                  <motion.div
                    className="bg-amber-50 p-3 rounded-lg max-w-md shadow-sm border border-amber-100"
                    whileHover={{ scale: 1.01 }}
                    style={{ backgroundColor: bubbleColors.system }}
                  >
                    <p className="text-gray-800 text-sm">{message.content}</p>
                  </motion.div>
                ) : message.sender === 'user' ? (
                  <motion.div
                    className="bg-blue-50 p-3 rounded-2xl rounded-tr-sm max-w-xs sm:max-w-md shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    style={{ backgroundColor: bubbleColors.user }}
                  >
                    <p className="text-gray-800">{message.content}</p>
                    <div className="mt-1 text-right">
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex group max-w-xs sm:max-w-md">
                    <div
                      className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-1 overflow-hidden"
                      style={{ padding: "0.25rem" }}
                    >
                      <motion.span
                        className="text-lg p-0.5"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {/* Show expression from message */}
                        {(characterExpressions[message.expression] || characterExpressions.default)[0].fallbackEmoji}
                      </motion.span>
                    </div>
                    <motion.div
                      className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm"
                      whileHover={{ scale: 1.01 }}
                      style={{ backgroundColor: bubbleColors.bot }}
                    >
                      <div className="text-gray-800">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}

            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Suggested topics - only shown at start of conversation */}
        {showSuggestions && messages.length < 3 && !isTyping && (
          <div className="px-4 pb-4 pt-1">
            <p className="text-sm text-gray-500 mb-2 ml-1">Suggested topics:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.slice(0, 4).map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 text-xs whitespace-normal text-left justify-start"
                  onClick={(e) => sendMessage(e, topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message input - Fixed at the bottom of screen */}
      <div className="fixed bottom-20 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm z-20 border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
            onClick={() => setShowToolbar(!showToolbar)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <div className="flex-grow relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={inCrisisMode ? "Share how you're feeling..." : "Message Saathi..."}
              className="w-full p-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 pl-4 pr-4 bg-gray-50/80 text-gray-500"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
            disabled={inputMessage.trim() === '' || isTyping}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>

        {/* Emoji toolbar */}
        <AnimatePresence>
          {showToolbar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute bottom-full left-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 mb-2 overflow-hidden"
            >
              <div className="p-2">
                <div className="grid grid-cols-8 gap-1">
                  {["😊", "😢", "😞", "😰", "😌", "😴", "🥺", "😤",
                    "😠", "😩", "🤗", "🙂", "🫤", "😔", "😬", "🫠"].map((emoji) => (
                      <button
                        key={emoji}
                        className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                        onClick={() => {
                          setInputMessage(prev => prev + emoji);
                          setShowToolbar(false);
                          inputRef.current?.focus();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}