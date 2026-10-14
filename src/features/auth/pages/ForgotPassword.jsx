
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim();

    setError('');
    setSuccess('');

    if (!normalizedEmail) {
      setError('University email is required.');
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Invalid email format.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Frontend validation only.
      // Backend integration will be added when the API is available.
      setSuccess(
        'The form is valid. Password reset email sending is not connected yet.'
      );
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Link
        to="/auth/login"
        className="mb-6 inline-flex items-center gap-2 text-sm text-link hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Login
      </Link>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={26} />
        </div>

        <h1 className="text-2xl font-bold text-primary">
          Forgot Password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your registered university email address and we’ll help you
          reset your password.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="University Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
            setSuccess('');
          }}
          placeholder="student@university.edu"
          autoComplete="email"
          leftIcon={<Mail size={18} />}
          error={error && !success ? error : ''}
        />

        <Button
          type="submit"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
          rightIcon={<ArrowRight size={16} />}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Link
          to="/auth/login"
          className="text-center text-sm font-medium text-link-navy hover:underline"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
