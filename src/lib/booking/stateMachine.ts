import { 
  BookingStatus, 
  BookingEvent, 
  BookingStateContext,
  BookingStateError 
} from './types';

// ===== STATE MACHINE CONFIGURATION =====

export interface StateTransition {
  from: BookingStatus;
  to: BookingStatus;
  event: string;
  guard?: (context: BookingStateContext, event: BookingEvent) => boolean;
  action?: (context: BookingStateContext, event: BookingEvent) => Promise<void>;
}

// Define all valid state transitions
export const BOOKING_TRANSITIONS: StateTransition[] = [
  // Draft phase transitions
  {
    from: BookingStatus.DRAFT,
    to: BookingStatus.QUOTE_REQUESTED,
    event: 'REQUEST_QUOTE'
  },
  {
    from: BookingStatus.DRAFT,
    to: BookingStatus.PENDING_PAYMENT,
    event: 'PROCEED_TO_PAYMENT',
    guard: (context) => context.booking.totalAmount > 0
  },

  // Quote phase transitions
  {
    from: BookingStatus.QUOTE_REQUESTED,
    to: BookingStatus.QUOTE_PROVIDED,
    event: 'PROVIDE_QUOTE',
    guard: (context) => context.user.role === 'provider'
  },
  {
    from: BookingStatus.QUOTE_PROVIDED,
    to: BookingStatus.PENDING_PAYMENT,
    event: 'ACCEPT_QUOTE',
    guard: (context) => context.user.role === 'customer'
  },
  {
    from: BookingStatus.QUOTE_PROVIDED,
    to: BookingStatus.CANCELLED,
    event: 'DECLINE_QUOTE',
    guard: (context) => context.user.role === 'customer'
  },

  // Payment phase transitions
  {
    from: BookingStatus.PENDING_PAYMENT,
    to: BookingStatus.CONFIRMED,
    event: 'PAYMENT_SUCCESS'
  },
  {
    from: BookingStatus.PENDING_PAYMENT,
    to: BookingStatus.PAYMENT_FAILED,
    event: 'PAYMENT_FAILED'
  },
  {
    from: BookingStatus.PAYMENT_FAILED,
    to: BookingStatus.PENDING_PAYMENT,
    event: 'RETRY_PAYMENT'
  },
  {
    from: BookingStatus.PAYMENT_FAILED,
    to: BookingStatus.CANCELLED,
    event: 'CANCEL_BOOKING'
  },

  // Confirmed phase transitions
  {
    from: BookingStatus.CONFIRMED,
    to: BookingStatus.PROVIDER_ASSIGNED,
    event: 'PROVIDER_ACCEPT',
    guard: (context) => context.user.role === 'provider'
  },
  {
    from: BookingStatus.CONFIRMED,
    to: BookingStatus.CANCELLED,
    event: 'PROVIDER_DECLINE',
    guard: (context) => context.user.role === 'provider'
  },

  // Service phase transitions
  {
    from: BookingStatus.PROVIDER_ASSIGNED,
    to: BookingStatus.IN_PROGRESS,
    event: 'START_SERVICE',
    guard: (context) => context.user.role === 'provider'
  },
  {
    from: BookingStatus.IN_PROGRESS,
    to: BookingStatus.COMPLETED,
    event: 'COMPLETE_SERVICE',
    guard: (context) => context.user.role === 'provider'
  },

  // Cancellation transitions (from various states)
  {
    from: BookingStatus.DRAFT,
    to: BookingStatus.CANCELLED,
    event: 'CANCEL_BOOKING'
  },
  {
    from: BookingStatus.QUOTE_REQUESTED,
    to: BookingStatus.CANCELLED,
    event: 'CANCEL_BOOKING'
  },
  {
    from: BookingStatus.CONFIRMED,
    to: BookingStatus.CANCELLED,
    event: 'CANCEL_BOOKING',
    guard: (context, event) => {
      // Check cancellation policy based on timing
      const timeUntilService = context.booking.scheduledStartTime.getTime() - Date.now();
      const hoursUntilService = timeUntilService / (1000 * 60 * 60);
      
      if (context.user.role === 'customer') {
        return hoursUntilService >= 24; // Customer can cancel 24h before
      } else if (context.user.role === 'provider') {
        return hoursUntilService >= 4; // Provider can cancel 4h before  
      }
      return context.user.role === 'platform'; // Platform can always cancel
    }
  },
  {
    from: BookingStatus.PROVIDER_ASSIGNED,
    to: BookingStatus.CANCELLED,
    event: 'CANCEL_BOOKING',
    guard: (context, event) => {
      const timeUntilService = context.booking.scheduledStartTime.getTime() - Date.now();
      const hoursUntilService = timeUntilService / (1000 * 60 * 60);
      
      if (context.user.role === 'customer') {
        return hoursUntilService >= 4; // Stricter cancellation after provider assigned
      } else if (context.user.role === 'provider') {
        return hoursUntilService >= 2; // Emergency cancellation for provider
      }
      return context.user.role === 'platform';
    }
  },

  // No-show transitions
  {
    from: BookingStatus.PROVIDER_ASSIGNED,
    to: BookingStatus.NO_SHOW_CUSTOMER,
    event: 'CUSTOMER_NO_SHOW',
    guard: (context) => context.user.role === 'provider'
  },
  {
    from: BookingStatus.PROVIDER_ASSIGNED,
    to: BookingStatus.NO_SHOW_PROVIDER,
    event: 'PROVIDER_NO_SHOW', 
    guard: (context) => context.user.role === 'customer'
  },

  // Dispute transitions
  {
    from: BookingStatus.COMPLETED,
    to: BookingStatus.DISPUTED,
    event: 'INITIATE_DISPUTE'
  },
  {
    from: BookingStatus.NO_SHOW_PROVIDER,
    to: BookingStatus.REFUNDED,
    event: 'PROCESS_REFUND',
    guard: (context) => context.user.role === 'platform'
  },
  {
    from: BookingStatus.DISPUTED,
    to: BookingStatus.REFUNDED,
    event: 'RESOLVE_DISPUTE_REFUND',
    guard: (context) => context.user.role === 'platform'
  }
];

// ===== STATE MACHINE ENGINE =====

export class BookingStateMachine {
  private transitions: Map<string, StateTransition[]>;

  constructor() {
    // Index transitions by current state for fast lookup
    this.transitions = new Map();
    
    BOOKING_TRANSITIONS.forEach(transition => {
      const key = transition.from;
      if (!this.transitions.has(key)) {
        this.transitions.set(key, []);
      }
      this.transitions.get(key)!.push(transition);
    });
  }

  /**
   * Check if a state transition is valid
   */
  canTransition(
    currentState: BookingStatus,
    event: string,
    context: BookingStateContext
  ): boolean {
    const possibleTransitions = this.transitions.get(currentState) || [];
    
    const validTransition = possibleTransitions.find(transition => {
      if (transition.event !== event) return false;
      if (transition.guard) {
        return transition.guard(context, { type: event, timestamp: new Date() });
      }
      return true;
    });

    return !!validTransition;
  }

  /**
   * Execute a state transition
   */
  async transition(
    currentState: BookingStatus,
    event: string,
    context: BookingStateContext,
    eventData?: any
  ): Promise<BookingStatus> {
    const possibleTransitions = this.transitions.get(currentState) || [];
    
    const validTransition = possibleTransitions.find(transition => {
      if (transition.event !== event) return false;
      if (transition.guard) {
        const bookingEvent: BookingEvent = {
          type: event,
          data: eventData,
          timestamp: new Date(),
          userId: context.user.id
        };
        return transition.guard(context, bookingEvent);
      }
      return true;
    });

    if (!validTransition) {
      throw new BookingStateError(
        `Invalid transition: ${currentState} -> ${event}`,
        currentState,
        event
      );
    }

    // Execute transition action if defined
    if (validTransition.action) {
      const bookingEvent: BookingEvent = {
        type: event,
        data: eventData,
        timestamp: new Date(),
        userId: context.user.id
      };
      await validTransition.action(context, bookingEvent);
    }

    return validTransition.to;
  }

  /**
   * Get all possible transitions from current state
   */
  getPossibleTransitions(
    currentState: BookingStatus,
    context: BookingStateContext
  ): string[] {
    const possibleTransitions = this.transitions.get(currentState) || [];
    
    return possibleTransitions
      .filter(transition => {
        if (transition.guard) {
          const mockEvent: BookingEvent = {
            type: transition.event,
            timestamp: new Date(),
            userId: context.user.id
          };
          return transition.guard(context, mockEvent);
        }
        return true;
      })
      .map(transition => transition.event);
  }

  /**
   * Check if state is terminal (no outgoing transitions)
   */
  isTerminalState(state: BookingStatus): boolean {
    const terminalStates = [
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED, 
      BookingStatus.NO_SHOW_CUSTOMER,
      BookingStatus.NO_SHOW_PROVIDER,
      BookingStatus.REFUNDED
    ];
    return terminalStates.includes(state);
  }

  /**
   * Check if state allows cancellation
   */
  canCancel(
    currentState: BookingStatus,
    context: BookingStateContext
  ): boolean {
    return this.canTransition(currentState, 'CANCEL_BOOKING', context);
  }

  /**
   * Get cancellation policy for current state
   */
  getCancellationPolicy(
    currentState: BookingStatus,
    context: BookingStateContext
  ): {
    canCancel: boolean;
    feePercentage: number;
    minimumNoticeHours: number;
    reason: string;
  } {
    const timeUntilService = context.booking.scheduledStartTime.getTime() - Date.now();
    const hoursUntilService = timeUntilService / (1000 * 60 * 60);

    // Default no cancellation policy
    let policy = {
      canCancel: false,
      feePercentage: 100,
      minimumNoticeHours: 0,
      reason: 'Cancellation not allowed in current state'
    };

    if (currentState === BookingStatus.DRAFT || currentState === BookingStatus.QUOTE_REQUESTED) {
      policy = {
        canCancel: true,
        feePercentage: 0,
        minimumNoticeHours: 0,
        reason: 'Free cancellation before payment'
      };
    } else if (currentState === BookingStatus.CONFIRMED || currentState === BookingStatus.PROVIDER_ASSIGNED) {
      if (hoursUntilService >= 24) {
        policy = {
          canCancel: true,
          feePercentage: 0,
          minimumNoticeHours: 24,
          reason: 'Free cancellation with 24+ hours notice'
        };
      } else if (hoursUntilService >= 4) {
        policy = {
          canCancel: true,
          feePercentage: 25,
          minimumNoticeHours: 4,
          reason: '25% cancellation fee with 4-24 hours notice'
        };
      } else if (hoursUntilService >= 1) {
        policy = {
          canCancel: true,
          feePercentage: 50,
          minimumNoticeHours: 1,
          reason: '50% cancellation fee with 1-4 hours notice'
        };
      } else {
        policy = {
          canCancel: context.user.role === 'platform',
          feePercentage: 100,
          minimumNoticeHours: 0,
          reason: 'No cancellation within 1 hour of service'
        };
      }
    }

    return policy;
  }
}