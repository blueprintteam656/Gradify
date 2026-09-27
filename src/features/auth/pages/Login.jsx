import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { MdPsychology } from 'react-icons/md';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../constants/roles';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ emailOrUsername, password }) {
  const errors = {};
  const identifier = emailOrUsername.trim();
  if (!identifier) {
    errors.emailOrUsername = 'Email or username is required.';
  } else if (identifier.includes('@') && !EMAIL_PATTERN.test(identifier)) {
    errors.emailOrUsername = 'Enter a valid email address.';
  }
  if (!password) errors.password = 'Password is required.';
  return errors;
}

function getHomeRoute(role) {
  return role === ROLES.SUPERVISOR ? '/supervisor' : '/dashboard';
}

export default function Login() {
  const { currentUser, login } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ emailOrUsername: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Covers both "already logged in" and "just logged in": send back to the
  // protected route that bounced here, otherwise to the role's home.
  if (currentUser) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : getHomeRoute(currentUser.role);
    return <Navigate to={target} replace />;
  }

  const canSubmit = form.emailOrUsername.trim() !== '' && form.password !== '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate(form);
    setFieldErrors(errors);
    setServerError('');
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({
        emailOrUsername: form.emailOrUsername.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });
      // Redirect happens on re-render via the currentUser check above.
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-[23px]">
      <h1 className="text-center text-2xl font-bold text-primary">Welcome Back</h1>

      {serverError && (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Input
          label="Email or Username"
          name="emailOrUsername"
          value={form.emailOrUsername}
          onChange={handleChange}
          placeholder="student@university.edu"
          autoComplete="username"
          leftIcon={<User size={18} />}
          error={fieldErrors.emailOrUsername}
        />

        <Input
          label="Password"
          labelAction={
            <Link to="/auth/forgot-password" className="text-xs font-medium text-link hover:underline">
              Forgot password?
            </Link>
          }
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          leftIcon={<Lock size={18} />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded text-gray-400 transition-colors hover:text-gray-600 focus-visible:text-primary focus-visible:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          error={fieldErrors.password}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={form.rememberMe}
          onChange={handleChange}
          className="size-4 cursor-pointer rounded border-border-subtle accent-primary"
        />
        <label htmlFor="rememberMe" className="cursor-pointer text-sm text-gray-600">
          Remember me for 30 days
        </label>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={!canSubmit}
        loading={isSubmitting}
        rightIcon={<ArrowRight size={16} />}
      >
        {isSubmitting ? 'Signing In…' : 'Sign In'}
      </Button>

      <p className="pb-[18px] text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register"className="font-semibold text-link-navy hover:underline">
          Sign Up
        </Link>
      </p>

      <hr className="border-border-subtle" />

      <div className="flex justify-center">
        <Badge icon={<MdPsychology size={16} aria-hidden="true" />}>AI-Powered Academic Planning</Badge>
      </div>
    </form>
  );
}
