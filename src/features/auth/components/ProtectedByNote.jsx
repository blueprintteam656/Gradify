import { ShieldCheck } from 'lucide-react';

// Footer line shown under the sign-up / verification cards.
export default function ProtectedByNote({ showIcon = false }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      {showIcon && <ShieldCheck size={12} aria-hidden="true" />}
      Protected by Gradify Academic Identity Services
    </p>
  );
}
