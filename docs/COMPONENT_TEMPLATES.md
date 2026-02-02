# Tumaro Component Templates

## Overview
Standardized component templates for consistent development across the Tumaro application. All components follow TypeScript best practices with proper interfaces and responsive design.

## Base Component Template

```typescript
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

interface ComponentNameProps {
  // Required props
  id: string;
  title: string;
  // Optional props  
  description?: string;
  isActive?: boolean;
  onClick?: () => void;
  // Children if needed
  children?: React.ReactNode;
  // Style overrides
  className?: string;
}

export function ComponentName({ 
  id, 
  title, 
  description,
  isActive = false,
  onClick,
  children,
  className = ""
}: ComponentNameProps) {
  const [localState, setLocalState] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`base-classes ${className}`}
    >
      {/* Component content */}
    </motion.div>
  );
}
```

## Card Components

### Standard Card Template
```typescript
"use client";

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ title, description, children, onClick, className = "" }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`
        bg-brand-900/50 border border-brand-800 rounded-2xl p-6 
        hover:border-brand-700 transition-colors group cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-accent-DEFAULT transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-brand-400 text-sm mt-1">{description}</p>
          )}
        </div>
        {onClick && (
          <ChevronRight className="h-5 w-5 text-brand-400 group-hover:text-accent-DEFAULT transition-colors" />
        )}
      </div>
      {children}
    </motion.div>
  );
}
```

### Status Card Template
```typescript
"use client";

import { motion } from 'framer-motion';

interface StatusCardProps {
  title: string;
  value: string | number;
  status?: 'success' | 'warning' | 'error' | 'info';
  description?: string;
  icon?: React.ReactNode;
}

const statusColors = {
  success: 'text-green-400 bg-green-400/10 border-green-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
};

export function StatusCard({ title, value, status, description, icon }: StatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-brand-400">{icon}</div>}
        <h3 className="text-sm font-medium text-brand-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-bold text-white">{value}</p>
        {status && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        )}
      </div>
      {description && (
        <p className="text-brand-400 text-sm mt-2">{description}</p>
      )}
    </motion.div>
  );
}
```

## Button Templates

### Primary Button
```typescript
"use client";

import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const variants = {
  primary: 'bg-accent-DEFAULT text-white hover:bg-accent-hover',
  secondary: 'bg-brand-800 text-white hover:bg-brand-700 border border-brand-700',
  ghost: 'text-accent-DEFAULT hover:bg-accent-DEFAULT/10',
  destructive: 'bg-red-500 text-white hover:bg-red-600'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  className = ""
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-lg font-medium transition-colors
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
```

## Form Templates

### Input Field Template
```typescript
"use client";

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-brand-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white
            placeholder:text-brand-400 focus:border-accent-DEFAULT focus:ring-2 
            focus:ring-accent-DEFAULT/20 transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-brand-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
```

### Select Field Template
```typescript
"use client";

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = "",
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-brand-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full bg-brand-950 border border-brand-700 rounded-lg px-4 py-3 text-white
            focus:border-accent-DEFAULT focus:ring-2 focus:ring-accent-DEFAULT/20 
            transition-colors appearance-none cursor-pointer
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-brand-950">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-brand-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
```

## Navigation Templates

### Tab Navigation Template
```typescript
"use client";

import { motion } from 'framer-motion';

interface TabProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabProps) {
  return (
    <div className="flex bg-brand-900 rounded-xl p-1 border border-brand-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300
            flex items-center justify-center gap-2
            ${activeTab === tab.id
              ? 'text-white'
              : 'text-brand-400 hover:text-brand-200'
            }
          `}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-950 rounded-lg shadow-lg"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-brand-700 text-brand-300 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
```

### Breadcrumb Template
```typescript
"use client";

import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-brand-500 mx-2" />
          )}
          {item.href ? (
            <a 
              href={item.href}
              className="text-brand-400 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

## List Templates

### Data List Template
```typescript
"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface ListItem {
  id: string;
  [key: string]: any;
}

interface DataListProps<T extends ListItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export function DataList<T extends ListItem>({ 
  items, 
  renderItem, 
  emptyState,
  loading = false 
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-brand-800 rounded-2xl h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### Empty State Template
```typescript
"use client";

import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      {icon && (
        <div className="flex justify-center mb-4 text-brand-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-brand-300 mb-2">
        {title}
      </h3>
      <p className="text-brand-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-accent-DEFAULT text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
```

## Modal Templates

### Modal Base Template
```typescript
"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              relative bg-brand-900 border border-brand-800 rounded-2xl shadow-2xl
              w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
            `}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-brand-800">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-brand-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

## Usage Guidelines

### Component File Structure
```
src/components/
├── ui/                 # Base UI components (buttons, inputs, etc.)
├── layout/            # Layout components (header, nav, etc.)
├── customer/          # Customer-specific components
├── detailer/          # Detailer-specific components
├── booking/           # Booking flow components
└── map/               # Map-related components
```

### Naming Conventions
- Component files: `PascalCase.tsx`
- Props interfaces: `ComponentNameProps`
- Event handlers: `onActionName` or `handleActionName`
- Boolean props: `isActive`, `hasError`, `canEdit`

### Best Practices
- Always use TypeScript with proper interfaces
- Include default props where appropriate
- Use Framer Motion for animations consistently
- Follow responsive design patterns
- Include proper accessibility attributes
- Use semantic HTML elements
- Implement proper error boundaries for critical components