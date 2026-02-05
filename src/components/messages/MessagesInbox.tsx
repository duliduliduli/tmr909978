"use client";

import { useState } from "react";
import { X, Pin, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

// Map detailer IDs to their profile images
const detailerImages: Record<string, string> = {
  'det_1': '/images/detailers/detailer-1.webp',
  'det_2': '/images/detailers/detailer-3.jpg',
  'det_3': '/images/detailers/detailer-4.jpg',
  'det_4': '/images/detailers/detailer-6.jpg',
  'det_5': '/images/detailers/detailer-5.jpg',
  'det_6': '/images/detailers/detailer-7.jpg',
};

// Mock conversations data
const mockConversations = [
  {
    id: 'conv_1',
    detailerId: 'det_1',
    businessName: 'Mobile Shine Pro',
    lastMessage: 'Your appointment is confirmed for tomorrow!',
    lastMessageTime: '2 hours ago',
    unread: 2,
    isPinned: true,
    messages: [
      { id: 'm1', text: 'Hi! I wanted to confirm my appointment for tomorrow.', sender: 'user', time: '10:30 AM' },
      { id: 'm2', text: 'Your appointment is confirmed for tomorrow!', sender: 'detailer', time: '10:45 AM' },
    ]
  },
  {
    id: 'conv_2',
    detailerId: 'det_2',
    businessName: 'Premium Auto Care',
    lastMessage: 'Thanks for your business! Hope to see you again soon.',
    lastMessageTime: '1 day ago',
    unread: 0,
    isPinned: false,
    messages: [
      { id: 'm3', text: 'Great service today, thank you!', sender: 'user', time: 'Yesterday' },
      { id: 'm4', text: 'Thanks for your business! Hope to see you again soon.', sender: 'detailer', time: 'Yesterday' },
    ]
  },
  {
    id: 'conv_3',
    detailerId: 'det_3',
    businessName: 'Elite Detail Works',
    lastMessage: 'We have a special promotion this week!',
    lastMessageTime: '3 days ago',
    unread: 1,
    isPinned: false,
    messages: [
      { id: 'm5', text: 'We have a special promotion this week!', sender: 'detailer', time: '3 days ago' },
    ]
  },
];

export function MessagesInbox() {
  const { setShowMessages } = useAppStore();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const togglePinConversation = (convId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    // In real app, send to backend
    setNewMessage('');
  };

  const handleClose = () => {
    setShowMessages(false);
    setSelectedConversation(null);
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-950 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 h-16 px-4 flex items-center gap-3 bg-brand-900 border-b border-brand-800">
        <button
          onClick={handleClose}
          className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-brand-400" />
        </button>
        <MessageCircle className="h-5 w-5 text-accent-DEFAULT" />
        <h1 className="text-xl font-bold text-white">Messages</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedConversation ? (
          // Chat View
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center gap-3 p-4 bg-brand-900/50 border-b border-brand-800">
              <img
                src={detailerImages[selectedConversation.detailerId] || '/images/detailers/detailer-1.webp'}
                alt={selectedConversation.businessName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{selectedConversation.businessName}</h3>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-brand-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-accent-DEFAULT text-white'
                        : 'bg-brand-800 text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-brand-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 bg-brand-900 border-t border-brand-800">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Conversations List
          <div className="h-full overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-2">
              {sortedConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-900/50 border border-brand-800 rounded-xl p-4 hover:border-brand-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={detailerImages[conv.detailerId] || '/images/detailers/detailer-1.webp'}
                        alt={conv.businessName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{conv.unread}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{conv.businessName}</h3>
                        {conv.isPinned && (
                          <Pin className="h-3 w-3 text-accent-DEFAULT fill-accent-DEFAULT" />
                        )}
                      </div>
                      <p className="text-brand-400 text-xs truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-brand-500 text-xs">{conv.lastMessageTime}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinConversation(conv.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          conv.isPinned ? 'text-accent-DEFAULT' : 'text-brand-600 hover:text-brand-400'
                        }`}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
