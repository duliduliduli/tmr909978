# Tumaro Design System

## Overview
Tumaro uses a premium dark theme design system optimized for mobile-first experiences with glassmorphism effects and smooth animations.

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

### Type Scale
```typescript
// Headings
text-4xl font-bold     // 36px - Page titles
text-3xl font-bold     // 30px - Section headers  
text-2xl font-bold     // 24px - Card titles
text-xl font-semibold  // 20px - Subsection headers
text-lg font-medium    // 18px - Component titles

// Body Text
text-base              // 16px - Primary body text
text-sm                // 14px - Secondary text
text-xs                // 12px - Captions, labels

// Interactive
text-sm font-medium    // Buttons, links
text-xs uppercase tracking-wider // Form labels
```

## Color System

### Brand Colors (Dark Theme Base)
```typescript
brand: {
  950: '#020617', // Body background, deepest dark
  900: '#0f172a', // Card backgrounds, navigation
  800: '#1e293b', // Elevated surfaces, hover states
  700: '#334155', // Borders, dividers
  600: '#475569', // Disabled states
  500: '#64748b', // Muted text
  400: '#94a3b8', // Placeholder text  
  300: '#cbd5e1', // Secondary text
  200: '#e2e8f0', // Light borders
  100: '#f1f5f9', // Light backgrounds
  50: '#f8fafc'   // Lightest backgrounds
}
```

### Accent Colors (Primary Actions)
```typescript
accent: {
  DEFAULT: '#38bdf8', // Primary buttons, links
  hover: '#0ea5e9',   // Hover states
  light: '#7dd3fc',   // Subtle highlights
  dark: '#0284c7',    // Pressed states
  50: '#f0f9ff'       // Light backgrounds
}
```

### Semantic Colors
```typescript
// Success
green-400: '#4ade80'   // Success states
green-500: '#22c55e'   // Success buttons

// Warning  
yellow-400: '#facc15'  // Warning states
yellow-500: '#eab308'  // Warning buttons

// Error
red-400: '#f87171'     // Error states  
red-500: '#ef4444'     // Error buttons

// Info
blue-400: '#60a5fa'    // Info states
blue-500: '#3b82f6'    // Info buttons
```

## Component Patterns

### Cards
```typescript
// Standard card
<div className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6 hover:border-brand-700 transition-colors">

// Elevated card
<div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-2xl">

// Glassmorphism card
<div className="bg-brand-900/80 backdrop-blur-md border border-brand-800/50 rounded-2xl p-6">
```

### Buttons
```typescript
// Primary button
<button className="bg-accent-DEFAULT text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors">

// Secondary button
<button className="bg-brand-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors border border-brand-700">

// Ghost button
<button className="text-accent-DEFAULT px-6 py-3 rounded-lg font-medium hover:bg-accent-DEFAULT/10 transition-colors">

// Destructive button  
<button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors">
```

### Form Inputs
```typescript
// Text input
<input className="bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white placeholder:text-brand-400 focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-DEFAULT/20 transition-colors">

// Select dropdown
<select className="bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white focus:border-accent-DEFAULT transition-colors">

// Textarea
<textarea className="bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white placeholder:text-brand-400 focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-DEFAULT/20 transition-colors resize-none">
```

### Navigation
```typescript
// Tab active state
<div className="bg-brand-800 text-accent-DEFAULT rounded-xl px-4 py-3">

// Tab inactive state  
<div className="text-brand-400 hover:text-brand-200 rounded-xl px-4 py-3 transition-colors">

// Breadcrumb
<div className="text-brand-400 text-sm flex items-center gap-2">
  <span>Home</span>
  <ChevronRight className="h-4 w-4" />
  <span className="text-white">Current Page</span>
</div>
```

## Animation Patterns

### Page Transitions
```typescript
// Standard page enter
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Staggered list items
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
  >
))}
```

### Hover Effects
```typescript
// Scale on hover
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>

// Glow effect
<div className="hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-shadow">
```

### Loading States
```typescript
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-DEFAULT">

// Skeleton
<div className="animate-pulse bg-brand-800 rounded-lg h-4 w-full">

// Pulse effect
<div className="animate-pulse bg-gradient-to-r from-brand-800 to-brand-700 rounded-lg">
```

## Layout Patterns

### Grid Systems
```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">

// Dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-3"> {/* Main content */}
  <div className="lg:col-span-1"> {/* Sidebar */}
</div>
```

### Flexbox Patterns
```typescript
// Center content
<div className="flex items-center justify-center min-h-screen">

// Space between
<div className="flex items-center justify-between">

// Stack with gap
<div className="flex flex-col gap-4">

// Responsive flex
<div className="flex flex-col lg:flex-row gap-6">
```

## Responsive Design

### Breakpoints
```typescript
// Mobile-first approach
sm: '640px'   // Small tablets
md: '768px'   // Tablets  
lg: '1024px'  // Desktop (navigation switch point)
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large desktop
```

### Mobile Patterns
```typescript
// Mobile navigation
<nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-900/90 backdrop-blur-lg border-t border-brand-800">

// Mobile drawer
<div className="lg:hidden fixed inset-0 bg-black/50 z-40">
  <div className="bg-brand-900 h-full w-80 p-6">
</div>

// Mobile-first grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Icon System

### Lucide React Icons
```typescript
import { 
  Home, Map, Calendar, Wallet, User, 
  ChevronRight, Plus, Settings, Bell,
  Star, MapPin, Clock, Phone
} from "lucide-react";

// Standard icon sizing
<Icon className="h-5 w-5" />     // Default
<Icon className="h-4 w-4" />     // Small
<Icon className="h-6 w-6" />     // Large
<Icon className="h-8 w-8" />     // Extra large
```

### Icon Usage Patterns
```typescript
// With text
<div className="flex items-center gap-2">
  <Calendar className="h-4 w-4 text-brand-400" />
  <span>Schedule</span>
</div>

// Button icon
<button className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  Add Item
</button>
```

## Status Indicators

### Booking Status Colors
```typescript
const statusColors = {
  draft: 'text-brand-400 bg-brand-400/10 border-brand-400/20',
  scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/20', 
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
  in_progress: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20'
};
```

### Badge Component
```typescript
<span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
  {status.replace('_', ' ').toUpperCase()}
</span>
```

## Accessibility

### Focus States
```typescript
// Interactive elements
focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/50 focus:border-accent-DEFAULT

// Skip links
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-DEFAULT text-white px-4 py-2 rounded-lg z-50">
```

### Screen Reader Support
```typescript
// Descriptive labels
<button aria-label="Add new appointment">
  <Plus className="h-5 w-5" />
</button>

// Status announcements
<div aria-live="polite" className="sr-only">
  Booking status updated to confirmed
</div>
```

## Component Examples

### Appointment Card
```typescript
<div className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6 hover:border-brand-700 transition-colors group">
  <div className="flex items-start justify-between mb-4">
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white group-hover:text-accent-DEFAULT transition-colors">
        {appointment.serviceName}
      </h3>
      <p className="text-brand-400 text-sm mt-1">{appointment.description}</p>
    </div>
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
      CONFIRMED
    </span>
  </div>
</div>
```

### Provider Card
```typescript
<motion.div
  whileHover={{ scale: 1.02 }}
  className="bg-brand-900 border border-brand-800 rounded-2xl p-6 cursor-pointer hover:border-accent-DEFAULT/50 transition-colors"
>
  <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 bg-accent-DEFAULT/20 rounded-full flex items-center justify-center">
      <Star className="h-6 w-6 text-accent-DEFAULT fill-accent-DEFAULT" />
    </div>
    <div>
      <h4 className="font-semibold text-white">{provider.businessName}</h4>
      <p className="text-brand-400 text-sm">{provider.name}</p>
    </div>
  </div>
</motion.div>
```

### Navigation Tab
```typescript
<Link
  href={href}
  className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group"
>
  {active && (
    <motion.div
      layoutId="activeTab"
      className="absolute inset-0 bg-brand-800 rounded-xl"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )}
  <Icon className={`h-5 w-5 relative z-10 ${active ? 'text-accent-DEFAULT' : 'text-brand-400'}`} />
  <span className={`relative z-10 ${active ? 'text-white' : 'text-brand-400'}`}>
    {label}
  </span>
</Link>
```

This design system ensures consistency across all Tumaro components while maintaining the premium, dark theme aesthetic and smooth user experience.