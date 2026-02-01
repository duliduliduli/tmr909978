"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Camera, Paperclip, Phone, Video, Star } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

interface Detailer {
  id: string;
  name: string;
  profileImage: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  phone?: string;
}

interface ChatModalProps {
  detailer: Detailer | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function ChatModal({ detailer, isOpen, onClose, currentUserId }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample messages
  useEffect(() => {
    if (detailer && isOpen) {
      const sampleMessages: Message[] = [
        {
          id: '1',
          senderId: detailer.id,
          senderName: detailer.name,
          content: `Hi! Thanks for reaching out. I'm available to help with your car detailing needs. What kind of service are you looking for?`,
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          type: 'text'
        },
        {
          id: '2',
          senderId: currentUserId,
          senderName: 'You',
          content: 'Hi! I\'m interested in a premium wash and wax for my sedan. When would you be available?',
          timestamp: new Date(Date.now() - 240000), // 4 minutes ago
          type: 'text'
        },
        {
          id: '3',
          senderId: detailer.id,
          senderName: detailer.name,
          content: 'Perfect! I have availability tomorrow afternoon or this weekend. The premium package includes exterior wash, wax, interior vacuum, and dashboard conditioning. Would you like to see some before/after photos of my recent work?',
          timestamp: new Date(Date.now() - 180000), // 3 minutes ago
          type: 'text'
        }
      ];
      setMessages(sampleMessages);
    }
  }, [detailer, isOpen, currentUserId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !detailer) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate detailer typing and response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          "Thanks for the message! I'll get back to you shortly.",
          "I can definitely help with that. Let me check my schedule.",
          "Great question! I'd be happy to provide more details.",
          "Sounds good! I'll prepare a quote for you.",
          "Perfect timing! I just had a cancellation tomorrow."
        ];
        
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: detailer.id,
          senderName: detailer.name,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 2000);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCall = () => {
    if (detailer?.phone) {
      window.location.href = `tel:${detailer.phone}`;
    }
  };

  if (!detailer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 md:max-w-2xl md:mx-auto bg-white rounded-2xl overflow-hidden z-50 flex flex-col max-h-[calc(100vh-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={detailer.profileImage}
                      alt={detailer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      detailer.availability === 'available' ? 'bg-green-500' :
                      detailer.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{detailer.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600">{detailer.rating}</span>
                      </div>
                      <span className={`text-xs ${
                        detailer.availability === 'available' ? 'text-green-600' :
                        detailer.availability === 'busy' ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {detailer.availability === 'available' ? 'Online' :
                         detailer.availability === 'busy' ? 'Busy' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {detailer.phone && (
                    <button
                      onClick={handleCall}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.senderId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${detailer.name}...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-20"
                    rows={1}
                  />
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Handle file upload here
                  console.log('File selected:', e.target.files?.[0]);
                }}
              />
            </div>

            {/* Quick actions */}
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  Send location
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  Book service
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  Get quote
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}