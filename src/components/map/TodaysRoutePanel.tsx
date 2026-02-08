"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle, Clock, MapPin, Navigation, Send, ChevronDown, ChevronUp, DollarSign, ChevronRight, Calendar, Check, CheckCircle2 } from 'lucide-react';
import type { Appointment } from '@/lib/store';
import { useAppStore } from '@/lib/store';
import { RescheduleModal } from '@/components/appointment/RescheduleModal';
import { useTranslation } from '@/lib/i18n';

interface TodaysRoutePanelProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  etaMinutes: number[]; // ETA in minutes between consecutive jobs
  onJobClick: (appointment: Appointment) => void;
  onFitAllMarkers?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingArrivals?: string[];
  onConfirmArrival?: (appointmentId: string) => void;
  onDismissArrival?: (appointmentId: string) => void;
}

export function TodaysRoutePanel({ isOpen, onClose, appointments, etaMinutes, onJobClick, onFitAllMarkers, isCollapsed = false, onToggleCollapse, pendingArrivals = [], onConfirmArrival, onDismissArrival }: TodaysRoutePanelProps) {
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const { activeDetailerId, addChatMessage, getChatMessages, markAppointmentArrived, unmarkAppointmentMissed } = useAppStore();

  const totalEarnings = appointments.reduce((sum, apt) => sum + apt.price, 0);

  const getTimeStatus = (apt: Appointment) => {
    if (apt.isMissed) return { label: 'Missed Wash', color: 'text-red-600' };
    if (apt.isArrived) return { label: 'Arrived', color: 'text-green-600' };
    const appointmentTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    const now = new Date();
    const diffMs = appointmentTime.getTime() - now.getTime();
    if (diffMs <= 0) return { label: 'Past Wash', color: 'text-amber-600' };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeStr = hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`;
    return { label: timeStr, color: 'text-orange-600' };
  };

  const getMessages = (apt: Appointment) => {
    return getChatMessages(activeDetailerId, apt.customerId);
  };

  const handleSendMessage = (apt: Appointment) => {
    if (!chatInput.trim()) return;
    const newMsg = { text: chatInput.trim(), fromMe: true, timestamp: new Date().toISOString() };
    addChatMessage(activeDetailerId, apt.customerId, newMsg);
    setChatInput('');

    // Simulated response
    setTimeout(() => {
      const responses = [
        `Thanks for the heads up! I'll be ready.`,
        `Got it, see you soon!`,
        `Sounds good, thanks for letting me know.`,
        `Great, I'll make sure the car is accessible.`,
      ];
      const reply = { text: responses[Math.floor(Math.random() * responses.length)], fromMe: false, timestamp: new Date().toISOString() };
      addChatMessage(activeDetailerId, apt.customerId, reply);
    }, 1500);
  };

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [expandedChatId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Collapsed state - just show expand arrow */}
          {isCollapsed ? (
            <motion.button
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={onToggleCollapse}
              className="absolute top-1/2 -translate-y-1/2 left-0 z-40 bg-white shadow-lg border border-gray-200 rounded-r-xl p-3 hover:bg-gray-50 transition-colors lg:hidden"
              style={{ borderLeft: 'none' }}
            >
              <div className="flex flex-col items-center gap-1">
                <ChevronRight className="h-5 w-5 text-gray-600" />
                <div className="w-6 h-6 rounded-full text-gray-800 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#B7E892' }}>
                  {appointments.length}
                </div>
              </div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute top-0 left-0 bottom-0 z-40 w-[320px] lg:w-[360px] bg-white shadow-2xl border-r border-gray-200 flex flex-col overflow-hidden"
              style={{ maxHeight: '100%' }}
            >
              {/* Header */}
              <div className="text-gray-800 px-4 lg:px-5 py-3 lg:py-4 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(to right, #B7E892, #a5d880)' }}>
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
                  onClick={onFitAllMarkers}
                >
                  <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
                    <Navigation className="h-4 w-4 lg:h-5 lg:w-5" />
                    Today&apos;s Route
                  </h2>
                  <p className="text-gray-600 text-xs lg:text-sm">{appointments.length} job{appointments.length !== 1 ? 's' : ''} remaining</p>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                  {/* Total earnings */}
                  <div className="flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 bg-white/60 rounded-full">
                    <DollarSign className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-green-700" />
                    <span className="text-xs lg:text-sm font-bold text-green-800">{totalEarnings.toFixed(2)}</span>
                  </div>
                  {/* Collapse button (mobile only) */}
                  {onToggleCollapse && (
                    <button
                      onClick={onToggleCollapse}
                      className="p-1.5 lg:hidden hover:bg-black/10 rounded-full transition-colors"
                      title="Collapse panel"
                    >
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 lg:p-2 hover:bg-black/10 rounded-full transition-colors"
                    title="Close route"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

          {/* Job List */}
          <div className="flex-1 overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Navigation className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium">No more jobs today</p>
                <p className="text-sm text-center mt-1">All caught up! Enjoy the rest of your day.</p>
              </div>
            ) : (
              appointments.map((apt, index) => {
                const messages = getMessages(apt);
                return (
                <div key={apt.id}>
                  {/* ETA to this job (index 0 = from current location, index 1+ = between jobs) */}
                  {etaMinutes[index] !== undefined && (
                    <div className="flex items-center gap-2 px-5 py-2 bg-blue-50 border-y border-blue-100">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-700">
                        {index === 0 ? `${etaMinutes[0]} min from current location` : `${etaMinutes[index]} min drive`}
                      </span>
                      <div className="flex-1 border-t border-dashed border-blue-200" />
                    </div>
                  )}

                  {/* Job Card */}
                  <div className="border-b border-gray-100">
                    <div
                      className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onJobClick(apt)}
                    >
                      {/* Job number and time */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: apt.isMissed ? '#EF4444' : apt.isArrived ? '#10B981' : '#B7E892' }}
                          >
                            {apt.isArrived ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : apt.isMissed ? (
                              <X className="h-4 w-4 text-white" />
                            ) : (
                              <span className="text-gray-800">{index + 1}</span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{apt.serviceName}</span>
                          {apt.isMissed ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-medium">
                              Missed
                            </span>
                          ) : apt.isArrived && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">
                              {t('todaysRoute.arrived') || 'Arrived'}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{apt.scheduledTime}</div>
                          <div className={`text-xs font-medium ${getTimeStatus(apt).color}`}>
                            {getTimeStatus(apt).label}
                          </div>
                        </div>
                      </div>

                      {/* Service description */}
                      <p className="text-xs text-gray-500 mb-2">{apt.serviceDescription}</p>

                      {/* Customer */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {apt.customerName?.charAt(0) || 'C'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{apt.customerName || 'Customer'}</span>
                        <span className="text-sm text-green-600 font-medium ml-auto">${apt.price}</span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-1.5 mt-2">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-500">{apt.address}</span>
                      </div>

                      {/* Notes */}
                      {apt.notes && (
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded px-2 py-1">
                          {apt.notes}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="px-5 pb-3 flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${apt.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {apt.phone}
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedChatId(expandedChatId === apt.id ? null : apt.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {t('todaysRoute.message') || 'Message'}
                        {messages.length > 0 && (
                          <span className="ml-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                            {messages.length}
                          </span>
                        )}
                        {expandedChatId === apt.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRescheduleAppointment(apt);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {t('todaysRoute.reschedule') || 'Reschedule'}
                      </button>
                      {apt.isMissed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unmarkAppointmentMissed(apt.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          I Did Complete It
                        </button>
                      ) : !apt.isArrived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAppointmentArrived(apt.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t('todaysRoute.markArrived') || 'Mark Arrived'}
                        </button>
                      )}
                    </div>

                    {/* Arrival Proximity Prompt */}
                    {pendingArrivals.includes(apt.id) && (
                      <div className="mx-5 mb-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                        <p className="text-xs font-medium text-teal-800 mb-2">
                          You&apos;ve arrived at {apt.customerName}&apos;s location. Mark as arrived?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onConfirmArrival?.(apt.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                          >
                            Mark Arrived
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismissArrival?.(apt.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white text-teal-700 border border-teal-300 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors"
                          >
                            Not Yet
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Chat */}
                    <AnimatePresence>
                      {expandedChatId === apt.id && (
                        <motion.div
                          ref={chatContainerRef}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          onAnimationComplete={() => {
                            chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }}
                        >
                          <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                            {/* Messages */}
                            <div className="max-h-40 overflow-y-auto py-2 space-y-2">
                              {messages.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-2">
                                  Send a message to {apt.customerName || 'the customer'}
                                </p>
                              )}
                              {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${
                                    msg.fromMe
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white text-gray-800 border border-gray-200'
                                  }`}>
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                              <div ref={chatEndRef} />
                            </div>
                            {/* Input */}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(apt);
                                  }
                                }}
                                placeholder={`Message ${apt.customerName || 'customer'}...`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                              />
                              <button
                                onClick={() => handleSendMessage(apt)}
                                disabled={!chatInput.trim()}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </motion.div>
          )}

          {/* Reschedule Modal */}
          {rescheduleAppointment && (
            <RescheduleModal
              appointment={rescheduleAppointment}
              isOpen={true}
              onClose={() => setRescheduleAppointment(null)}
              onReschedule={(newDate, newTime) => {
                console.log(`Rescheduled to ${newDate} at ${newTime}`);
                setRescheduleAppointment(null);
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
