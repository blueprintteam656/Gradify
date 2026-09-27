import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import Input from '../../../../components/ui/Input';
import { getPasswordStrength } from '../../utils/registerValidation';

const STRENGTH_LEVELS = [
  { label: '—', width: 'w-0', color: '' },
  { label: 'Weak', width: 'w-1/3', color: 'bg-[#C62828]' },
  { label: 'Medium', width: 'w-2/3', color: 'bg-amber-500' },
  { label: 'Strong', width: 'w-full', color: 'bg-green-600' },
];

function VisibilityToggle({ visible, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      className="cursor-pointer rounded text-gray-400 transition-colors hover:text-gray-600 focus-visible:text-primary focus-visible:outline-none"
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function StrengthMeter({ password }) {
  const level = STRENGTH_LEVELS[getPasswordStrength(password)];
  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full transition-all duration-300 ${level.width} ${level.color}`} />
      </div>
      <p className="text-xs text-gray-700" aria-live="polite">
        Password strength: {level.label}
      </p>
    </div>
  );
}

export default function SecurityStep({ form, errors, onFieldChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleChange = (e) => onFieldChange(e.target.name, e.target.value);

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-[23px] sm:grid-cols-2 sm:gap-4">
        <Input
          size="md"
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          rightSlot={
            <VisibilityToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} label="password" />
          }
          helper={<StrengthMeter password={form.password} />}
          error={errors.password}
        />
        <Input
          size="md"
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
          rightSlot={
            <VisibilityToggle
              visible={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              label="confirm password"
            />
          }
          error={errors.confirmPassword}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => onFieldChange('acceptTerms', e.target.checked)}
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border-subtle accent-primary"
          />
          <label htmlFor="acceptTerms" className="cursor-pointer text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="font-medium text-step-active hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-step-active hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p id="acceptTerms-error" className="text-xs text-red-600">
            {errors.acceptTerms}
          </p>
        )}
      </div>
    </>
  );
}
