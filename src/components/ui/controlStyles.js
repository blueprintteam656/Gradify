// Shared look for text-like form controls (Input, Select) so every form stays consistent.
const SIZES = {
  md: 'h-11 text-sm',
  lg: 'h-[46px] text-base',
};

// `muted` renders the value in placeholder gray (e.g. a <select> still on its placeholder option).
export function controlClasses({ size = 'lg', error = false, muted = false } = {}) {
  return `w-full rounded-lg border bg-white ${muted ? 'text-gray-400' : 'text-gray-900'} transition outline-none placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
    SIZES[size] ?? SIZES.lg
  } ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-border-subtle focus:border-primary focus:ring-primary/20'
  }`;
}

export const errorIdFor = (id) => `${id}-error`;
