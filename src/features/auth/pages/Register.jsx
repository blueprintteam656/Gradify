import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthCenteredLayout from '../../../layouts/AuthCenteredLayout';
import Logo from '../../../components/ui/Logo';
import Stepper from '../../../components/ui/Stepper';
import Button from '../../../components/ui/Button';
import PersonalStep from '../components/register/PersonalStep';
import AcademicStep from '../components/register/AcademicStep';
import SecurityStep from '../components/register/SecurityStep';
import { STEP_VALIDATORS, FIELD_STEP } from '../utils/registerValidation';
import * as authService from '../../../services/mock/mockAuthService';

const STEPS = ['Personal', 'Academic', 'Security'];
const STEP_COMPONENTS = [PersonalStep, AcademicStep, SecurityStep];
const LAST_STEP = STEPS.length - 1;

const initialForm = {
  profilePicture: null,
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  role: 'student',
  university: 'eelu',
  faculty: '',
  department: '',
  academicId: '',
  graduationYear: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

function formReducer(state, { name, value }) {
  const next = { ...state, [name]: value };
  if (name === 'faculty' && value !== state.faculty) next.department = '';
  return next;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(null);
  const pendingFocus = useRef(null);
  const previewUrlRef = useRef(null);

  // Move focus to the first invalid field once its step has rendered.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const selectors = {
      role: '[role="radio"][aria-checked="true"]',
      profilePicture: '[aria-describedby="profilePicture-error"]',
    };
    const el = selectors[target] ? document.querySelector(selectors[target]) : document.getElementById(target);
    el?.focus();
  });

  // Release the preview blob when leaving the page.
  useEffect(() => () => previewUrlRef.current && URL.revokeObjectURL(previewUrlRef.current), []);

  const setFocusTarget = (field) => {
    pendingFocus.current = field;
  };

  const updatePreview = (file) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setProfilePreviewUrl(previewUrlRef.current);
  };

  const handleFieldChange = (name, value) => {
    if (name === 'profilePicture') updatePreview(value);
    dispatch({ name, value });
    setErrors((prev) => {
      if (!prev[name] && !(name === 'faculty' && prev.department)) return prev;
      const next = { ...prev, [name]: undefined };
      if (name === 'faculty') next.department = undefined;
      if (name === 'password' && prev.confirmPassword === 'Passwords do not match.') next.confirmPassword = undefined;
      return next;
    });
  };

  const handleFieldError = (name, message) => setErrors((prev) => ({ ...prev, [name]: message }));

  const goToStep = (index) => {
    setErrors({});
    setServerError('');
    setStep(index);
  };

  const handleBack = () => {
    if (step === 0) navigate('/auth/login');
    else goToStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const stepErrors = STEP_VALIDATORS[step](form);
    setErrors(stepErrors);
    setServerError('');
    const firstInvalid = Object.keys(stepErrors)[0];
    if (firstInvalid) {
      setFocusTarget(firstInvalid);
      return;
    }

    if (step < LAST_STEP) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await authService.register(form);
      navigate('/verify-email', { state: { email: user.email } });
    } catch (err) {
      setIsSubmitting(false);
      if (err.field && err.field in FIELD_STEP) {
        setStep(FIELD_STEP[err.field]);
        setErrors({ [err.field]: err.message });
        setFocusTarget(err.field);
      } else {
        setServerError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <AuthCenteredLayout>
      <div className="flex w-full max-w-[640px] flex-col gap-10 rounded-xl border border-border-subtle bg-white p-6 shadow-panel sm:p-10">
        <header className="flex flex-col items-center gap-[7px] text-center">
          <Logo size="md" />
          <h1 className="text-2xl font-bold text-primary">Create Your Account</h1>
          <p className="text-sm text-gray-600">Tell us about your academic journey to tailor your experience.</p>
        </header>

        <Stepper steps={STEPS} currentStep={step} onStepClick={goToStep} label="Registration progress" />

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[23px]">
          {serverError && (
            <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <StepComponent
            form={form}
            errors={errors}
            onFieldChange={handleFieldChange}
            onFieldError={handleFieldError}
            profilePreviewUrl={profilePreviewUrl}
          />

          <div className="flex justify-between gap-3 border-t border-border-subtle pt-4">
            <Button variant="outline" size="md" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" size="md" loading={isSubmitting}>
              {step < LAST_STEP ? 'Next Step' : isSubmitting ? 'Creating Account…' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </AuthCenteredLayout>
  );
}
