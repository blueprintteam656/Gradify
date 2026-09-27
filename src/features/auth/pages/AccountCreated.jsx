import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Sparkle } from 'lucide-react';

import AuthCenteredLayout from '../../../layouts/AuthCenteredLayout';
import Button from '../../../components/ui/Button';
import ProtectedByNote from '../components/ProtectedByNote';
import { useAuth } from '../../../hooks/useAuth';

function SuccessBadge() {
  return (
    <div className="relative motion-safe:animate-scale-in">
      <div className="rounded-full bg-linear-to-br from-step-active to-ai-accent p-0.5 shadow-[0_0_40px_rgba(124,58,237,0.35)]">
        <div className="rounded-full bg-white p-1">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary">
            <Check size={32} strokeWidth={3} className="text-white" aria-hidden="true" />
          </div>
        </div>
      </div>
      <Sparkle aria-hidden="true" className="absolute -top-2 -right-4 size-4 fill-ai-accent text-ai-accent" />
      <Sparkle aria-hidden="true" className="absolute -bottom-1 -left-4 size-2.5 fill-ai-accent/70 text-ai-accent/70" />
      <span aria-hidden="true" className="absolute top-1 -left-2 size-1.5 rounded-full bg-amber-400" />
    </div>
  );
}

export default function AccountCreated() {
  const location = useLocation();
  const { currentUser, signInAfterVerification } = useAuth();
  const email = location.state?.verified ? location.state.email : null;

  const [destination, setDestination] = useState(null);
  const [error, setError] = useState('');

  // After signing in (or if already signed in), continue to the chosen page.
  if (currentUser) return <Navigate to={destination ?? '/dashboard'} replace />;
  if (!email) return <Navigate to="/register" replace />;

  const continueTo = async (path) => {
    setDestination(path);
    setError('');
    try {
      await signInAfterVerification(email);
    } catch (err) {
      setDestination(null);
      setError(err.message || 'Something went wrong. Please sign in to continue.');
    }
  };

  return (
    <AuthCenteredLayout footer={<ProtectedByNote showIcon />}>
      <div className="relative w-full max-w-[580px]">
        {/* Soft glow: violet above the card, faint shadow below it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 h-64 w-[110%] -translate-x-1/2 rounded-full bg-ai-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-12 -bottom-8 h-16 rounded-full bg-gray-400/20 blur-2xl"
        />

        <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-border-subtle bg-white px-6 pt-12 pb-10 text-center sm:px-10">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-ai-accent via-step-active to-primary" />

          <SuccessBadge />

          <h1 className="mt-6 text-3xl font-extrabold text-primary">
            Welcome{' '}
            <span className="whitespace-nowrap">
              aboard! <span aria-hidden="true">🎉</span>
            </span>
          </h1>
          <p className="mt-3 max-w-[380px] text-sm text-gray-600">
            Your Gradify account is fully active. Start setting up your graduation project or join your team now.
          </p>

          {error && (
            <div role="alert" className="mt-6 w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              className="px-8"
              onClick={() => continueTo('/projects')}
              loading={destination === '/projects'}
              disabled={destination !== null}
            >
              Create / Join Team
            </Button>
            <Button
              size="lg"
              onClick={() => continueTo('/dashboard')}
              loading={destination === '/dashboard'}
              disabled={destination !== null}
              rightIcon={<ArrowRight size={16} />}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AuthCenteredLayout>
  );
}
