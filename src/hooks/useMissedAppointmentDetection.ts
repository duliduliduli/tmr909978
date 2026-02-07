"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore, type Appointment } from '@/lib/store';
import { isAppointmentOverdue, APPOINTMENT_CONFIG } from '@/lib/utils';

interface UseMissedAppointmentDetectionOptions {
  appointments: Appointment[];
  enabled: boolean;
}

interface UseMissedAppointmentDetectionReturn {
  missedAppointments: Appointment[];
  dismissMissed: (appointmentId: string) => void;
}

export function useMissedAppointmentDetection({
  appointments,
  enabled,
}: UseMissedAppointmentDetectionOptions): UseMissedAppointmentDetectionReturn {
  const [localMissedIds, setLocalMissedIds] = useState<Set<string>>(new Set());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    markAppointmentMissed,
    addMissedAlert,
    dismissMissedAlert,
    missedAppointmentAlerts
  } = useAppStore();

  // Check all appointments for missed status
  const checkForMissedAppointments = useCallback(() => {
    for (const apt of appointments) {
      // Skip if already arrived, completed, cancelled, or already marked missed
      if (
        apt.isArrived ||
        apt.isMissed ||
        apt.status === 'completed' ||
        apt.status === 'cancelled' ||
        apt.status === 'in_progress'
      ) {
        continue;
      }

      // Check if appointment is overdue (past scheduled time + grace period)
      if (isAppointmentOverdue(apt.scheduledDate, apt.scheduledTime)) {
        console.log(`[Missed Detection] Appointment ${apt.id} is overdue`);

        // Mark as missed in store
        markAppointmentMissed(apt.id);

        // Add to alerts (only if not already dismissed locally)
        if (!localMissedIds.has(apt.id)) {
          addMissedAlert(apt.id);
        }
      }
    }
  }, [appointments, markAppointmentMissed, addMissedAlert, localMissedIds]);

  // Dismiss a missed appointment alert
  const dismissMissed = useCallback((appointmentId: string) => {
    // Track locally dismissed alerts
    setLocalMissedIds(prev => new Set([...prev, appointmentId]));
    // Also dismiss in store
    dismissMissedAlert(appointmentId);
  }, [dismissMissedAlert]);

  // Set up periodic checking
  useEffect(() => {
    if (!enabled || appointments.length === 0) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkForMissedAppointments();

    // Set up interval for periodic checks
    checkIntervalRef.current = setInterval(() => {
      checkForMissedAppointments();
    }, APPOINTMENT_CONFIG.MISSED_CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [enabled, appointments, checkForMissedAppointments]);

  // Get the actual missed appointments from store alerts
  const missedAppointments = appointments.filter(
    apt => missedAppointmentAlerts.includes(apt.id) && !localMissedIds.has(apt.id)
  );

  return {
    missedAppointments,
    dismissMissed,
  };
}
