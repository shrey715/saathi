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
import ReactMarkdown from 'react-markdown';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { chatApi } from '@/lib/api';
import { getEmotionIcon, getEmotionTone } from '@/lib/emotion-icons';
import { useMood } from '@/lib/mood-context';
import { toneClasses } from '@/lib/mood-tone';

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

interface ChatMessage {
  id: number;
  sender: 'user' | 'saathi' | 'system';
  content: string;
  timestamp: string;
  expression: string;
}

const greetingMessage = (): ChatMessage => ({
  id: Date.now(),
  sender: 'saathi',
  content: fillerMessages.greeting[Math.floor(Math.random() * fillerMessages.greeting.length)],
  timestamp: new Date().toISOString(),
  expression: "default",
});

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ ...greetingMessage(), id: 1 }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inCrisisMode, setInCrisisMode] = useState(false);
  const [previousMessages, setPreviousMessages] = useState<ChatMessage[]>([]);
  const [isResettingChat, setIsResettingChat] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoading } = useAuthGuard();
  const { setMood } = useMood();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isLoading) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessageToServer = async (message: string) => {
    try {
      return await chatApi.send(message);
    } catch (error) {
      console.error('Error sending message to server:', error);
      setCurrentEmotion('concern');
      return {
        response: fillerMessages.error[Math.floor(Math.random() * fillerMessages.error.length)],
        emotion: 'concern'
      };
    }
  };

  const resetChatThread = async () => {
    setIsResettingChat(true);
    try {
      await chatApi.reset();
      setMessages([greetingMessage()]);
      setShowSuggestions(true);
      setInCrisisMode(false);
      setPreviousMessages([]);
      setCurrentEmotion('default');
    } catch (error) {
      console.error('Error resetting chat thread:', error);
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

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
      expression: "default"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowSuggestions(false);

    try {
      const data = await sendMessageToServer(content);
      const messageEmotion = data.emotion || 'default';
      setCurrentEmotion(messageEmotion);
      setMood(messageEmotion, getEmotionTone(messageEmotion));

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'saathi',
        content: data.response,
        timestamp: new Date().toISOString(),
        expression: messageEmotion
      }]);
    } catch (error) {
      console.error('Error in chat conversation:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'saathi',
        content: fillerMessages.error[Math.floor(Math.random() * fillerMessages.error.length)],
        timestamp: new Date().toISOString(),
        expression: "concern"
      }]);
      setCurrentEmotion('concern');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCrisisMode = async () => {
    setInCrisisMode(true);
    setPreviousMessages([...messages]);
    setMessages([{
      id: Date.now(),
      sender: 'system',
      content: "Crisis support activated. If you're in immediate danger, please call emergency services (911) or text HOME to 741741 to reach Crisis Text Line.",
      timestamp: new Date().toISOString(),
      expression: "concern"
    }]);

    await resetChatThread();

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'saathi',
      content: "I notice you've activated crisis support. I'm here for you. Can you tell me a bit about what's going on right now so I can best support you?",
      timestamp: new Date().toISOString(),
      expression: "concern"
    }]);
    setCurrentEmotion('concern');
  };

  const exitCrisisMode = async () => {
    setInCrisisMode(false);
    await resetChatThread();

    if (previousMessages.length > 0) {
      setMessages([...previousMessages]);
    } else {
      setMessages([greetingMessage()]);
    }
    setCurrentEmotion('default');
  };

  const CurrentEmotionIcon = getEmotionIcon(currentEmotion);
  const emotionTone = toneClasses(getEmotionTone(currentEmotion));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Preparing Saathi for your chat...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center">
          {inCrisisMode && (
            <Button variant="ghost" size="icon" className="mr-1" onClick={exitCrisisMode}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${emotionTone.soft} ${emotionTone.text}`}>
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <CurrentEmotionIcon className="h-5 w-5" />
              </motion.span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">
                Saathi
                {inCrisisMode && <span className="text-xs ml-2 text-destructive font-normal">Crisis Mode</span>}
              </h1>
              <p className="text-xs text-muted-foreground">Your wellness companion</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inCrisisMode && (
            <div className="hidden sm:block text-sm text-destructive font-medium animate-pulse">
              Crisis Support Active
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChatThread}
            disabled={isResettingChat}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isResettingChat ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isResettingChat ? 'Resetting...' : 'New Chat'}</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-3">
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
                    className="bg-mood-alert-soft p-3 rounded-lg max-w-md shadow-neu-sm border border-mood-alert/20"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-foreground text-sm">{message.content}</p>
                  </motion.div>
                ) : message.sender === 'user' ? (
                  <motion.div
                    className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm max-w-xs sm:max-w-md shadow-neu-sm"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-foreground">{message.content}</p>
                    <div className="mt-1 text-right">
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex group max-w-xs sm:max-w-md">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 mt-1 p-1.5 shrink-0 ${toneClasses(getEmotionTone(message.expression)).soft} ${toneClasses(getEmotionTone(message.expression)).text}`}>
                      <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        {(() => {
                          const MessageIcon = getEmotionIcon(message.expression);
                          return <MessageIcon className="h-5 w-5" />;
                        })()}
                      </motion.span>
                    </div>
                    <motion.div
                      className="bg-card p-3 rounded-2xl rounded-tl-sm shadow-neu-sm"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="text-foreground text-sm leading-relaxed">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
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
          <div className="max-w-2xl mx-auto px-4 pb-4 pt-1">
            <p className="text-sm text-muted-foreground mb-2 ml-1">Suggested topics:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.slice(0, 4).map((topic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs whitespace-normal text-left justify-start"
                  onClick={(e) => sendMessage(e, topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="shrink-0 relative p-3 bg-card/80 backdrop-blur border-t border-border">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary rounded-full"
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
              className="w-full p-3 rounded-full border-transparent shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring pl-4 pr-4 bg-muted/50 text-foreground"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="icon"
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
              className="absolute bottom-full left-2 right-2 max-w-2xl mx-auto bg-popover rounded-lg shadow-lg border border-border mb-2 overflow-hidden"
            >
              <div className="p-2">
                <div className="grid grid-cols-8 gap-1">
                  {["😊", "😢", "😞", "😰", "😌", "😴", "🥺", "😤",
                    "😠", "😩", "🤗", "🙂", "🫤", "😔", "😬", "🫠"].map((emoji) => (
                      <button
                        key={emoji}
                        className="p-2 hover:bg-accent rounded-lg text-xl"
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
