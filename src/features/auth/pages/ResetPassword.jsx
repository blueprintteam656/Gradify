import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  X,
} from 'lucide-react';

import Button from '../../../components/ui/Button';
import { resetPassword, validateResetToken } from '../../../services/mock/mockAuthService';

const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: '1 Uppercase letter (A-Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: '1 Lowercase letter (a-z)', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: '1 Number (0-9)', test: (v) => /\d/.test(v) },
  { id: 'special', label: '1 Special character (@$!%*?&#)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// index = number of password rules met (0–5)
const STRENGTH = [
  { label: 'Weak', text: 'text-red-600', bar: 'bg-red-500' },
  { label: 'Weak', text: 'text-red-600', bar: 'bg-red-500' },
  { label: 'Weak', text: 'text-red-600', bar: 'bg-red-500' },
  { label: 'Fair', text: 'text-amber-600', bar: 'bg-amber-500' },
  { label: 'Good', text: 'text-lime-600', bar: 'bg-lime-500' },
  { label: 'Strong', text: 'text-green-600', bar: 'bg-green-500' },
];

// how many of the 4 bars are filled for each number of rules met
const FILLED_BARS = [0, 1, 1, 2, 3, 4];

const MISMATCH = 'Passwords do not match.';
const COMPLEXITY = 'Password does not meet complexity requirements.';
const INVALID_LINK = 'Reset link is invalid or expired.';

function PasswordField({ id, label, value, onChange, show, onToggle, error, hint, autoComplete }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Lock size={14} className={error ? 'text-red-500' : 'text-gray-500'} />
          {label} <span className="text-red-500">*</span>
        </label>
        {hint}
      </div>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-lg border bg-white px-4 py-3 pr-11 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-primary/10 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-border-subtle focus:border-primary'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [tokenStatus, setTokenStatus] = useState('checking'); // checking | valid | invalid
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [banner, setBanner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // FR-RP-01: validate the token from the URL before showing the form
  useEffect(() => {
    let alive = true;

    if (!token) {
      setTokenStatus('invalid');
      return undefined;
    }

    validateResetToken(token)
      .then(() => alive && setTokenStatus('valid'))
      .catch(() => alive && setTokenStatus('invalid'));

    return () => {
      alive = false;
    };
  }, [token]);

  // After a successful reset, send the user to Login
  useEffect(() => {
    if (!done) return undefined;
    const timer = setTimeout(() => navigate('/auth/login', { replace: true }), 4000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  // Password strength (keep these four lines together and in this order)
  const passed = RULES.filter((rule) => rule.test(password)).length;
  const strength = STRENGTH[passed];
  const filledBars = FILLED_BARS[passed];
  const complexityOk = passed === RULES.length;

  const mismatch = confirm.length > 0 && confirm !== password;
  const passwordError = submitted && !complexityOk ? COMPLEXITY : '';
  const confirmError = mismatch || (submitted && !confirm) ? MISMATCH : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setBanner('');

    if (!complexityOk) {
      setBanner(COMPLEXITY);
      return;
    }
    if (password !== confirm) {
      setBanner(MISMATCH);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password, confirm);
      setDone(true);
    } catch (error) {
      if (error.message === INVALID_LINK) setTokenStatus('invalid');
      else setBanner(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- states ---------- */

  if (tokenStatus === 'checking') {
    return <p className="py-10 text-center text-sm text-gray-600">Verifying your reset link...</p>;
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h1 className="text-2xl font-bold text-primary">Link expired</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
          {INVALID_LINK}
        </p>
        <p className="mt-1 text-sm text-gray-600">Reset links expire after 30 minutes and can only be used once.</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link to="/auth/forgot-password" className="block">
            <Button type="button" fullWidth rightIcon={<ArrowRight size={16} />}>
              Request a new link
            </Button>
          </Link>
          <Link to="/auth/login" className="text-sm font-medium text-link-navy hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="text-2xl font-bold text-primary">Password Reset Successfully</h1>
        <p role="status" className="mt-3 text-sm leading-6 text-gray-600">
          Your password has been reset successfully. Please log in.
        </p>

        <Link to="/auth/login" className="mt-6 block">
          <Button type="button" fullWidth rightIcon={<ArrowRight size={16} />}>
            Back to Login
          </Button>
        </Link>
        <p className="mt-3 text-xs text-gray-500">Redirecting to Login...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {banner && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">Password Reset Failed</p>
            <p className="text-red-700">{banner}</p>
          </div>
        </div>
      )}

      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RotateCcw size={24} />
        </div>
        <h1 className="text-2xl font-bold text-primary">Reset password</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your new password to secure your Gradify account.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <PasswordField
            id="newPassword"
            label="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setBanner('');
            }}
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            error={passwordError}
            autoComplete="new-password"
            hint={
              password ? (
                <span className={`text-xs font-bold ${strength.text}`}>Strength: {strength.label}</span>
              ) : null
            }
          />

          <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full ${index < filledBars ? strength.bar : 'bg-gray-200'}`}
              />
            ))}
          </div>

          <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-lg bg-gray-50 p-3 text-xs sm:grid-cols-2">
            {RULES.map((rule) => {
              const met = rule.test(password);
              const untouched = !password;

              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-1.5 ${
                    met ? 'text-green-600' : untouched ? 'text-gray-500' : 'text-red-600'
                  }`}
                >
                  {met ? <Check size={13} /> : <X size={13} />}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setBanner('');
          }}
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          error={confirmError}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
          rightIcon={<ArrowRight size={16} />}
        >
          {isSubmitting ? 'Saving...' : 'Update & Save Password'}
        </Button>

        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-link-navy hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </form>
    </div>
  );
}