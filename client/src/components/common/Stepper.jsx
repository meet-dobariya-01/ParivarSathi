import React from 'react';
import { Check } from 'lucide-react';

const Stepper = ({
  steps = [],
  currentStep = 1,
  onStepClick,
  className = ''
}) => {
  return (
    <nav aria-label="Progress Stepper" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={step.id || step.title || stepNumber}
              className={`relative flex flex-1 items-center ${
                idx !== steps.length - 1 ? 'after:content-[""] after:w-full after:h-0.5 after:border-b after:border-gov-border after:inline-block' : ''
              } ${isCompleted ? 'after:border-gov-navy' : ''}`}
            >
              <div
                className={`flex items-center gap-2 cursor-default ${
                  onStepClick && isCompleted ? 'cursor-pointer' : ''
                }`}
                onClick={() => onStepClick && isCompleted && onStepClick(stepNumber)}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-gov-navy text-white'
                      : isCurrent
                      ? 'bg-gov-saffron text-gov-navy-900 ring-2 ring-gov-navy ring-offset-2 font-extrabold'
                      : 'bg-slate-200 text-gov-text-muted'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : stepNumber}
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-gov-navy whitespace-nowrap">
                  {step.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
