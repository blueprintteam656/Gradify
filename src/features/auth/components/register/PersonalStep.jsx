import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

import Input from '../../../../components/ui/Input';
import { validateProfilePicture } from '../../utils/registerValidation';

function ProfilePicturePicker({ file, previewUrl, error, onChange, onError }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!selected) return;
    const message = validateProfilePicture(selected);
    if (message) {
      onError(message);
      return;
    }
    onChange(selected);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={file ? 'Change profile picture' : 'Upload profile picture'}
          aria-describedby={error ? 'profilePicture-error' : undefined}
          className={`flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#EFEDE8] text-gray-600 transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:ring-offset-2 focus-visible:outline-none ${
            error ? 'ring-2 ring-red-500' : ''
          }`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus size={24} aria-hidden="true" />
          )}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove profile picture"
            className="absolute -top-0.5 -right-0.5 flex size-6 cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-white text-gray-600 shadow-button hover:text-red-600 focus-visible:ring-2 focus-visible:ring-step-active/40 focus-visible:outline-none"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id="profilePicture"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleFile}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-700">Profile Picture (optional)</span>
      {error && (
        <p id="profilePicture-error" className="text-center text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function PersonalStep({ form, errors, onFieldChange, onFieldError, profilePreviewUrl }) {
  const handleChange = (e) => onFieldChange(e.target.name, e.target.value);

  return (
    <>
      <ProfilePicturePicker
        file={form.profilePicture}
        previewUrl={profilePreviewUrl}
        error={errors.profilePicture}
        onChange={(file) => onFieldChange('profilePicture', file)}
        onError={(message) => onFieldError('profilePicture', message)}
      />

      <div className="grid grid-cols-1 items-start gap-[23px] sm:grid-cols-2 sm:gap-4">
        <Input
          size="md"
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Your first name"
          autoComplete="given-name"
          error={errors.firstName}
        />
        <Input
          size="md"
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Your last name"
          autoComplete="family-name"
          error={errors.lastName}
        />
      </div>

      <Input
        size="md"
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Choose a username"
        autoComplete="username"
        error={errors.username}
      />

      <div className="grid grid-cols-1 items-start gap-[23px] sm:grid-cols-2 sm:gap-4">
        <Input
          size="md"
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@university.edu"
          autoComplete="email"
          error={errors.email}
        />
        <Input
          size="md"
          label="Phone Number"
          name="phone"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="01xxxxxxxxx"
          autoComplete="tel"
          error={errors.phone}
        />
      </div>
    </>
  );
}
