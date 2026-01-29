"use client";

import { LucideIcon } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BookingProgressProps {
  steps: ProgressStep[];
  currentStep: number;
  completedSteps: number;
}

export function BookingProgress({ steps, currentStep, completedSteps }: BookingProgressProps) {
  return (
    <div className="bg-white border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < completedSteps;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center space-x-2">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : isCurrent
                        ? 'bg-teal-100 border-teal-600 text-teal-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isCompleted || isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`ml-4 mr-4 h-0.5 w-12 transition-colors duration-200 ${
                      index < completedSteps
                        ? 'bg-teal-600'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}