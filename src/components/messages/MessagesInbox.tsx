"use client";

import { useState } from "react";
import { X, Pin, Send, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export function MessagesInbox() {
  const {
    setShowMessages,
    conversations,
    togglePinConversation,
    deleteConversationById,
    markConversationRead,
    getChatMessages,
    addChatMessage,
    role,
    activeCustomerId,
    activeDetailerId
  } = useAppStore();

  const [selectedConversation, setSelectedConversation] = useState<typeof conversations[0] | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Add message to chat logs
    const detailerId = role === 'customer' ? selectedConversation.participantId : activeDetailerId;
    const customerId = role === 'customer' ? activeCustomerId : selectedConversation.participantId;

    addChatMessage(detailerId, customerId, {
      text: newMessage.trim(),
      fromMe: true,
      timestamp: new Date().toISOString()
    });

    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const responses = [
        'Thanks for your message!',
        'Got it, I\'ll get back to you soon.',
        'Sounds good!',
        'No problem at all.',
      ];
      addChatMessage(detailerId, customerId, {
        text: responses[Math.floor(Math.random() * responses.length)],
        fromMe: false,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  };

  const handleClose = () => {
    setShowMessages(false);
    setSelectedConversation(null);
  };

  const handleSelectConversation = (conv: typeof conversations[0]) => {
    setSelectedConversation(conv);
    markConversationRead(conv.id);
  };

  const handleDeleteConversation = (convId: string) => {
    deleteConversationById(convId);
    setShowDeleteConfirm(null);
    if (selectedConversation?.id === convId) {
      setSelectedConversation(null);
    }
  };

  const getMessagesForConversation = (conv: typeof conversations[0]) => {
    const detailerId = role === 'customer' ? conv.participantId : activeDetailerId;
    const customerId = role === 'customer' ? activeCustomerId : conv.participantId;
    return getChatMessages(detailerId, customerId);
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
                src={selectedConversation.participantImage || '/images/detailers/detailer-1.webp'}
                alt={selectedConversation.participantName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{selectedConversation.participantName}</h3>
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
              {getMessagesForConversation(selectedConversation).length === 0 ? (
                <div className="text-center text-brand-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                getMessagesForConversation(selectedConversation).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.fromMe
                          ? 'bg-accent-DEFAULT text-white'
                          : 'bg-brand-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.fromMe ? 'text-white/70' : 'text-brand-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
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
              {sortedConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-brand-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-brand-300 mb-2">No conversations yet</h3>
                  <p className="text-brand-500">Messages from detailers will appear here</p>
                </div>
              ) : (
                sortedConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-900/50 border border-brand-800 rounded-xl p-4 hover:border-brand-700 transition-colors cursor-pointer relative"
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conv.participantImage || '/images/detailers/detailer-1.webp'}
                        alt={conv.participantName}
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
                        <h3 className="font-semibold text-white text-sm">{conv.participantName}</h3>
                        {conv.isPinned && (
                          <Pin className="h-3 w-3 text-accent-DEFAULT fill-accent-DEFAULT" />
                        )}
                      </div>
                      <p className="text-brand-400 text-xs truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-brand-500 text-xs">{conv.lastMessageTime}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinConversation(conv.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            conv.isPinned ? 'text-accent-DEFAULT' : 'text-brand-600 hover:text-brand-400'
                          }`}
                          title={conv.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(conv.id);
                          }}
                          className="p-1 rounded text-brand-600 hover:text-red-400 transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === conv.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-brand-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-sm text-brand-400 mb-2">Delete this conversation?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conv.id)}
                            className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
