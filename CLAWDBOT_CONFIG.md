# ClawdBot Configuration for Tumaro

## Integration Setup

### Required Files
- `TUMARO_SPEC.md` - Product source of truth ✅ 
- `clawdbot_rules.txt` - Operating system rules ✅
- `COMPREHENSIVE BREAKDOWN.txt` - Technical architecture ✅
- `project constitution and more.txt` - Project guidelines ✅

### Environment Verification
Before ClawdBot starts any task, verify:

```bash
# Ensure development server starts clean
npm run type-check
npm run lint  
npm run dev

# Key routes must load without errors:
curl -f http://localhost:4024/customer/map
curl -f http://localhost:4024/customer/appointments
curl -f http://localhost:4024/detailer/dashboard
curl -f http://localhost:4024/detailer/appointments
```

## Task Template (Mandatory Format)

Every ClawdBot task must follow this exact structure:

```
TASK NAME: [Short descriptive name]
GOAL: [One sentence objective]
SCOPE: Only touch: [specific files/folders]
DO NOT: [explicit restrictions]
CONTEXT: [relevant code snippets or file structure]
ACCEPTANCE TESTS:
1) [Specific verifiable outcome]
2) [Another verifiable outcome] 
3) [Third verifiable outcome]
DELIVERABLE:
- unified diff
- verify commands
- rollback plan
STOP AFTER DONE.
```

## Sprint Roadmap Priority Order

### Sprint 0: Foundation ✅
- [x] Route structure stable
- [x] Navigation tabs working
- [x] Appointments tab present
- [x] Global state management

### Sprint 1: Map Reliability (CURRENT PRIORITY)
**Next recommended task:**
```
TASK NAME: Customer map reliability + Mapbox GPU layers
GOAL: Make /customer/map load reliably with proper Mapbox implementation
SCOPE: Only touch: src/components/map/**, src/app/customer/map/**
DO NOT: Add dependencies, use MapLibre, refactor unrelated code
ACCEPTANCE TESTS:
1) Map centers on user location within 3 seconds
2) Zoom controls and "center on me" work
3) Detailers render as Mapbox GPU layers (not DOM)
4) No console errors on map load
```

### Sprint 2: Authentication
- User registration/login
- Role-based permissions
- Profile management

### Sprint 3: Booking System
- Real booking creation
- Status management 
- Appointment scheduling

### Sprint 4: Business Operations
- Detailer dashboard
- Service management
- Coin program configuration

## File Change Limits

### Hard Limits (Never Exceed)
- **Max files changed per task**: 3
- **Max new files per task**: 2
- **Max lines changed per file**: 200

### Allowed Paths Only
```
✅ ALLOWED:
- src/app/**
- src/components/**
- src/lib/**
- prisma/** (schema changes only with migration plan)
- scripts/**

❌ FORBIDDEN:
- .git/**, .github/**
- package*.json, lock files
- .env* files
- deployment configs
- root config files (except documented exceptions)
```

## Verification Gates (All Must Pass)

### 1. Code Quality
```bash
npm run type-check  # Must pass
npm run lint        # Must pass
```

### 2. Runtime Safety  
```bash
npm run dev         # Must start without errors
```

### 3. Route Health Check
All core routes must respond:
- `/customer/home`
- `/customer/map` 
- `/customer/appointments`
- `/detailer/dashboard`
- `/detailer/map`
- `/detailer/appointments`

### 4. Component Smoke Tests
For UI changes, verify:
- Component renders without crashing
- Interactive elements are clickable
- Responsive design works on mobile/desktop
- No accessibility violations

## Output Requirements

### Every Task Response Must Include:

1. **Plan Summary** (max 8 bullet points)
2. **Files Modified** (exact paths, max 3)
3. **Unified Diff** (minimal, focused changes only)
4. **Verification Commands** (copy-pasteable)
5. **Expected Results** (what user should see)
6. **Rollback Steps** (how to undo changes)
7. **Next Recommended Task** (one task only)

## Design System Integration

### Component Standards
- All components use TypeScript with proper interfaces
- Tailwind classes via `clsx` utility for conditional styling
- Framer Motion for animations (import from existing patterns)
- Icons from Lucide React (already installed)

### Styling Patterns
```typescript
// Consistent card pattern
<div className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6 hover:border-brand-700 transition-colors">

// Button patterns  
<button className="bg-accent-DEFAULT text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors">

// Input patterns
<input className="bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white placeholder:text-brand-400">
```

### Animation Patterns
```typescript
// Standard page transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Staggered list items
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

## Error Handling Standards

### Frontend Error Boundaries
- Wrap major sections in error boundaries
- Graceful fallbacks for component failures
- User-friendly error messages

### API Error Responses
```typescript
// Standard API error format
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "User-friendly message",
    details: [...] // Array of field-specific errors
  }
}
```

### State Management Errors
- Handle async errors in Zustand actions
- Provide loading/error states in UI
- Clear error states on retry

## Security Guidelines

### Never Log Sensitive Data
- No customer addresses in console
- No payment information in logs
- No API keys in client-side code

### Input Validation
- Use Zod schemas for all API inputs
- Sanitize user content before storage
- Rate limit booking endpoints

### Location Privacy
- Implement provider location scrambling
- Respect privacy settings
- Secure geolocation data transmission

## Performance Standards

### Map Performance
- Use Mapbox GPU layers (not DOM markers)
- Cluster providers for large datasets
- Lazy load non-visible map features

### Bundle Size
- No unnecessary dependencies
- Code splitting for large components
- Image optimization for all assets

### Runtime Performance
- 60fps animations on mobile
- < 3 second map initialization
- < 2 second location detection

## Testing Integration

### Manual Testing Checklist
For each task, verify:
- [ ] Desktop Chrome/Firefox/Safari
- [ ] Mobile Chrome/Safari (responsive)
- [ ] Dark mode appearance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Automated Testing (Future)
- Unit tests for business logic
- Component testing with React Testing Library
- E2E tests for critical user flows

## Rollback Procedures

### Git Safety
```bash
# Before starting any task
git status                    # Ensure clean working directory
git branch task-backup       # Create backup branch

# If rollback needed
git reset --hard HEAD~1      # Undo last commit
git clean -fd                # Remove new files
npm run dev                  # Verify rollback worked
```

### File-Level Rollback
- Keep backup copies of modified files
- Document original file states
- Provide step-by-step restoration

## Integration Testing

### ClawdBot Handoff Checklist
Before considering a task complete:

1. [ ] All verification commands pass
2. [ ] No TypeScript errors
3. [ ] No ESLint warnings  
4. [ ] App starts successfully
5. [ ] Target feature works as specified
6. [ ] No regressions in existing features
7. [ ] Mobile responsive design intact
8. [ ] Documentation updated if needed

### Success Metrics
- Task completed within specified scope
- Zero breaking changes to existing functionality
- Code quality maintained or improved
- User experience enhanced
- Clear path to next task identified