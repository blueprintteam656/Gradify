import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import AuthCenteredLayout from '../../../layouts/AuthCenteredLayout';
import Logo from '../../../components/ui/Logo';
import Button from '../../../components/ui/Button';
import ProtectedByNote from '../components/ProtectedByNote';
import * as authService from '../../../services/mock/mockAuthService';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
const emptyCode = () => Array(CODE_LENGTH).fill('');

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [digits, setDigits] = useState(emptyCode);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!email) return <Navigate to="/register" replace />;

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;
  const focusBox = (index) => inputsRef.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();

  // Writes `value` (digits) starting at `start`, then focuses the next empty box.
  const fillFrom = (start, value) => {
    const next = [...digits];
    const chars = value.slice(0, CODE_LENGTH - start).split('');
    chars.forEach((char, offset) => {
      next[start + offset] = char;
    });
    setDigits(next);
    setError('');
    focusBox(start + chars.length);
  };

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (!value) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }
    // Typing into a filled box (caret not over the digit) yields old + new: keep only the new one.
    // Longer values come from autofill dropping the whole code into one box.
    if (value.length === 2 && digits[index]) {
      fillFrom(index, value[0] === digits[index] ? value[1] : value[0]);
      return;
    }
    fillFrom(index, value);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      focusBox(index - 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index, e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    fillFrom(pasted.length >= CODE_LENGTH ? 0 : index, pasted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete || isVerifying) return;
    setIsVerifying(true);
    setResendNote('');
    try {
      await authService.verifyEmail(email, code);
      navigate('/welcome', { replace: true, state: { email, verified: true } });
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
      setIsShaking(true);
      setIsVerifying(false);
      focusBox(CODE_LENGTH - 1);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendNote('');
    try {
      await authService.resendVerification(email);
      setDigits(emptyCode());
      setError('');
      setSecondsLeft(RESEND_SECONDS);
      setResendNote('Code sent');
      focusBox(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const boxClasses = (digit) => {
    const state = error
      ? 'border-red-500 bg-white'
      : digit
        ? 'border-primary bg-white ring-2 ring-primary/10'
        : 'border-slate-200 bg-slate-50';
    return `h-14 w-10 rounded-xl border-2 text-center text-xl font-semibold text-primary transition outline-none focus:border-ai-accent focus:ring-4 focus:ring-ai-accent/15 ${state}`;
  };

  const canResend = secondsLeft === 0 && !isResending;

  return (
    <AuthCenteredLayout footer={<ProtectedByNote />}>
      <div className="flex w-full max-w-[490px] flex-col items-center rounded-2xl border border-border-subtle bg-white p-6 text-center shadow-panel sm:p-10">
        <Logo size="sm" />
        <p className="mt-6 text-xs tracking-widest text-gray-500 uppercase">Security Verification</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Verify your email</h1>
        <p className="mt-3 max-w-[340px] text-sm text-gray-500">
          We&apos;ve sent a 6-digit verification code to{' '}
          <strong className="font-semibold wrap-break-word text-gray-700">{email}</strong>. Enter the code below to confirm
          your account.
        </p>

        <form noValidate onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-7">
          <div className="flex flex-col items-center gap-2">
            <div
              role="group"
              aria-label="Verification code"
              aria-describedby={error ? 'otp-error' : undefined}
              onAnimationEnd={() => setIsShaking(false)}
              className={`flex justify-center gap-2 sm:gap-3 ${isShaking ? 'motion-safe:animate-shake' : ''}`}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={index === 0 ? CODE_LENGTH : 2}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(index, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                  aria-invalid={error ? true : undefined}
                  className={`${boxClasses(digit)} sm:w-12`}
                />
              ))}
            </div>
            {error && (
              <p id="otp-error" role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="xl"
            fullWidth
            disabled={!isComplete}
            loading={isVerifying}
            rightIcon={<ArrowRight size={18} />}
          >
            {isVerifying ? 'Verifying…' : 'Verify Email'}
          </Button>
        </form>

        <div className="mt-7 flex w-full flex-col items-center gap-4 border-t border-border-subtle pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span>Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`rounded font-medium focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:outline-none ${
                canResend ? 'cursor-pointer text-step-active hover:underline' : 'cursor-not-allowed text-gray-300'
              }`}
            >
              {isResending ? 'Sending…' : 'Resend Code'}
            </button>
            {secondsLeft > 0 && (
              <span
                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-gray-600"
                aria-label={`You can resend in ${secondsLeft} seconds`}
              >
                {formatTime(secondsLeft)}
              </span>
            )}
          </div>
          <p className="min-h-4 text-xs text-green-700" aria-live="polite">
            {resendNote}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:outline-none"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Sign Up
          </Link>
        </div>
      </div>
    </AuthCenteredLayout>
  );
}
