import { Fragment } from 'react';

// Horizontal numbered stepper. Only completed steps are clickable (to go back).
export default function Stepper({ steps, currentStep, onStepClick, label = 'Progress' }) {
  return (
    <nav aria-label={label}>
      <ol className="flex w-full items-start">
        {steps.map((stepLabel, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const content = (
            <>
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive ? 'bg-step-active text-white' : 'bg-step-idle-bg text-gray-700'
                }`}
              >
                {index + 1}
              </span>
              <span className={`text-sm ${isActive ? 'font-medium text-step-active' : 'text-gray-600'}`}>
                {stepLabel}
              </span>
            </>
          );

          return (
            <Fragment key={stepLabel}>
              {index > 0 && <li aria-hidden="true" className="mx-2 mt-3.5 h-px flex-1 bg-gray-200" />}
              <li aria-current={isActive ? 'step' : undefined}>
                {isComplete && onStepClick ? (
                  <button
                    type="button"
                    onClick={() => onStepClick(index)}
                    aria-label={`Go back to step ${index + 1}: ${stepLabel}`}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-md hover:opacity-80 focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:outline-none"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">{content}</div>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
