import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AtSign,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  X,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';
import ProfileShell from '../components/ProfileShell';

const INITIAL_PROFILE = {
  firstName: '',
  lastName: '',
  username: '',
  phoneNumber: '',
  bio: '',
  skills: [],
  publishToGallery: false,
};

const BIO_MAX = 300;
const MAX_SKILLS = 15;
const NAME_PATTERN = /^[A-Za-z\u0600-\u06FF\s]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/;
const IMAGE_TYPES = ['image/jpeg', 'image/png'];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_ERROR = 'Profile picture must be JPG, JPEG, or PNG and under 5 MB.';

const formatRole = (role) => (role ?? '').replace(/([a-z])([A-Z])/g, '$1 $2');

function normalizePhone(value) {
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (!cleaned) return null;

  if (cleaned.startsWith('+')) {
    if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) return null;
    if (cleaned.startsWith('+20') && !/^\+201[0125]\d{8}$/.test(cleaned)) return null;
    return cleaned;
  }

  const national = cleaned.replace(/^0/, '');
  return /^1[0125]\d{8}$/.test(national) ? `+20${national}` : null;
}

function validateImage(file) {
  if (!file) return '';
  if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES) return IMAGE_ERROR;
  return '';
}

function validateProfile(profile, image) {
  const errors = {};
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  const username = profile.username.trim();

  if (!firstName) errors.firstName = 'First name is required.';
  else if (firstName.length < 3 || firstName.length > 50)
    errors.firstName = 'First name must be between 3 and 50 characters.';
  else if (!NAME_PATTERN.test(firstName))
    errors.firstName = 'First name can contain Arabic or English letters only.';

  if (lastName) {
    if (lastName.length < 3 || lastName.length > 50)
      errors.lastName = 'Last name must be between 3 and 50 characters.';
    else if (!NAME_PATTERN.test(lastName))
      errors.lastName = 'Last name can contain Arabic or English letters only.';
  }

  if (!username) errors.username = 'Username is required.';
  else if (username.length < 4 || username.length > 20)
    errors.username = 'Username must be between 4 and 20 characters.';
  else if (!USERNAME_PATTERN.test(username))
    errors.username = 'Username can contain letters, numbers and underscore (_) only.';

  if (!profile.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';
  else if (!normalizePhone(profile.phoneNumber)) errors.phoneNumber = 'Invalid phone number format.';

  if (profile.bio.length > BIO_MAX) errors.bio = 'Bio must not exceed 300 characters.';

  const imageError = validateImage(image);
  if (imageError) errors.profilePicture = imageError;

  return errors;
}

function toProfile(user) {
  if (!user) return INITIAL_PROFILE;

  const [first = '', ...rest] = (user.name ?? '').trim().split(/\s+/);

  return {
    firstName: user.firstName ?? first,
    lastName: user.lastName ?? rest.join(' '),
    username: user.username ?? '',
    phoneNumber: user.phone ?? '',
    bio: user.bio ?? '',
    skills: user.skills ?? [],
    publishToGallery: Boolean(user.publishToGallery),
  };
}

function LockedItem({ label, value, verified, icon }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2 text-sm font-medium text-slate-800">
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <span className="truncate">{value || '—'}</span>
        </span>
        {verified && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Verified
          </span>
        )}
      </div>
    </div>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {children}
    </p>
  );
}

export default function EditProfile() {
  const { currentUser, updateProfile } = useAuth();

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillDraft, setSkillDraft] = useState('');
  const fileInputRef = useRef(null);

  const baseline = useMemo(() => toProfile(currentUser), [currentUser]);
  const savedPicture = currentUser?.avatar ?? '';
  const academic = currentUser?.academic ?? {};

  useEffect(() => {
    if (!currentUser) return;

    setProfile(toProfile(currentUser));
    setPreview(savedPicture);
    setImage(null);
    setRemoveImage(false);
  }, [currentUser, savedPicture]);

  useEffect(() => {
    if (!image) return;

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const isDirty =
    JSON.stringify(profile) !== JSON.stringify(baseline) || Boolean(image) || removeImage;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: '', form: '' }));
    setMessage('');
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!selectedImage) return;

    const imageError = validateImage(selectedImage);
    setErrors((previous) => ({ ...previous, profilePicture: imageError }));
    setMessage('');
    if (imageError) return;

    setImage(selectedImage);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    setRemoveImage(true);
    setErrors((previous) => ({ ...previous, profilePicture: '' }));
    setMessage('');
  };

  const commitSkill = () => {
    const skill = skillDraft.trim();
    const exists = profile.skills.some((item) => item.toLowerCase() === skill.toLowerCase());

    if (skill && skill.length <= 30 && !exists && profile.skills.length < MAX_SKILLS) {
      setProfile((previous) => ({ ...previous, skills: [...previous.skills, skill] }));
      setMessage('');
    }

    setSkillDraft('');
    setIsAddingSkill(false);
  };

  const removeSkill = (skill) => {
    setProfile((previous) => ({
      ...previous,
      skills: previous.skills.filter((item) => item !== skill),
    }));
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProfile(profile, image);
    setErrors(validationErrors);
    setMessage('');

    if (Object.values(validationErrors).some(Boolean)) return;

    setIsSaving(true);

    try {
      await updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        username: profile.username.trim(),
        phoneNumber: normalizePhone(profile.phoneNumber),
        bio: profile.bio,
        skills: profile.skills,
        publishToGallery: profile.publishToGallery,
        profilePicture: image,
        removeProfilePicture: removeImage,
      });

      setMessage('Profile updated successfully. Your changes are now visible across Gradify.');
    } catch (error) {
      if (error.field) {
        const field = error.field === 'phone' ? 'phoneNumber' : error.field;
        setErrors({ [field]: error.message });
      } else {
        setErrors({ form: error.message || 'Failed to update profile.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
      hasError ? 'border-red-400' : 'border-slate-200'
    }`;

  const initials =
    `${profile.firstName.trim()[0] ?? ''}${profile.lastName.trim()[0] ?? ''}`.toUpperCase();
  const roleLabel = formatRole(currentUser?.role);
  const cardClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

  return (
    <ProfileShell active="Dashboard">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        {message && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{message}</span>
            </span>
            <button type="button" onClick={() => setMessage('')} aria-label="Dismiss message">
              <X size={14} />
            </button>
          </div>
        )}

        {errors.form && (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
            {errors.form}
          </div>
        )}

        {/* header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Dashboard › My Profile › <span className="font-medium text-indigo-600">Edit Profile</span>
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0f1d4a]">Edit Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Update and fine-tune your public student portfolio and communication channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Back to Profile
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-700">
              <Sparkles size={12} />
              AI Portfolio Ready
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(300px,360px)_1fr]"
        >
          {/* ---------------- left column ---------------- */}
          <div className="flex flex-col gap-5">
            <section className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Profile Avatar</h2>
                  <p className="text-xs text-slate-500">
                    Visible to supervisors, team peers, and reviewers.
                  </p>
                </div>
                {roleLabel && (
                  <span className="shrink-0 rounded-full bg-[#1b2559] px-3 py-1 text-[11px] font-semibold text-white">
                    {roleLabel}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1b2559] to-indigo-600 text-3xl font-bold text-white">
                    {preview ? (
                      <img src={preview} alt="Profile preview" className="size-full object-cover" />
                    ) : initials ? (
                      initials
                    ) : (
                      <UserRound size={42} />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                    <Check size={12} />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                    >
                      <Upload size={12} />
                      Upload New
                    </button>
                    {preview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-500">
                    JPG, JPEG or PNG. Maximum size 5 MB. Square aspect ratio recommended.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              </div>

              <FieldError>{errors.profilePicture}</FieldError>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-violet-600" />
                  <div>
                    <p className="font-semibold text-violet-900">Enhance Academic Portrait</p>
                    <p className="text-violet-700/80">
                      Gradify AI can format lighting and neutral backgrounds for formal thesis defenses.
                    </p>
                  </div>
                </div>
                {/* TODO: connect to the AI Workspace module */}
                <button
                  type="button"
                  disabled
                  className="text-xs font-semibold text-violet-700 underline disabled:opacity-60"
                >
                  Try
                </button>
              </div>
            </section>

            {/* read-only: set at registration */}
            <section className={cardClass}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1b2559]" />
                <h2 className="text-sm font-bold text-slate-900">Institutional Details</h2>
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  <Lock size={9} />
                  LOCKED
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Academic credentials are verified by the registrar and can only be amended by the
                System Administrator.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <LockedItem
                  label="Registered academic email"
                  value={currentUser?.email}
                  verified={Boolean(currentUser?.isVerified)}
                  icon={<Lock size={12} className="text-slate-400" />}
                />
                <LockedItem label="University affiliation" value={academic.university} />
                <div className="grid grid-cols-2 gap-2">
                  <LockedItem label="Faculty / School" value={academic.faculty} />
                  <LockedItem label="Department" value={academic.department} />
                  <LockedItem label="Account hierarchy" value={roleLabel} />
                  <LockedItem
                    label="Graduation year"
                    value={academic.graduationYear ? `Class of ${academic.graduationYear}` : ''}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Need a correction? Contact your System Administrator.
              </p>
            </section>
          </div>

          {/* ---------------- right column ---------------- */}
          <section className={`${cardClass} flex flex-col`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">
                  Manage the public identity details and contact preferences associated with your
                  account.
                </p>
              </div>
              {academic.academicId && (
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                  ID: #{academic.academicId}
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Primary legal</span>
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    autoComplete="given-name"
                    className={fieldClass(errors.firstName)}
                  />
                  <FieldError>{errors.firstName}</FieldError>
                </div>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                      Last Name
                    </label>
                    <span className="text-[11px] text-slate-400">(Family Name)</span>
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    autoComplete="family-name"
                    className={fieldClass(errors.lastName)}
                  />
                  <FieldError>{errors.lastName}</FieldError>
                </div>
              </div>

              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AtSign
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    autoComplete="username"
                    className={`${fieldClass(errors.username)} pl-9`}
                  />
                </div>
                {errors.username ? (
                  <FieldError>{errors.username}</FieldError>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Used for capstone repo attribution, team tagging, and grading manifests.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-700">
                    +20
                  </span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    placeholder="101 234 5678"
                    autoComplete="tel-national"
                    className={fieldClass(errors.phoneNumber)}
                  />
                </div>
                {errors.phoneNumber ? (
                  <FieldError>{errors.phoneNumber}</FieldError>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Used strictly for critical advisor announcements and project meeting SMS
                    broadcasts.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="bio" className="text-xs font-semibold text-slate-700">
                    Bio &amp; Research Statement
                  </label>
                  {/* TODO: connect to the AI Workspace module */}
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 disabled:opacity-60"
                  >
                    <Sparkles size={11} />
                    AI Rephrase
                  </button>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell your team a little about yourself..."
                  className={`${fieldClass(errors.bio)} resize-none`}
                />
                <div className="mt-1 flex justify-between gap-3">
                  {errors.bio ? (
                    <FieldError>{errors.bio}</FieldError>
                  ) : (
                    <span className="text-[11px] text-slate-400">Markdown formatting is supported.</span>
                  )}
                  <p
                    className={`text-[11px] ${
                      profile.bio.length > BIO_MAX ? 'font-semibold text-red-600' : 'text-slate-400'
                    }`}
                  >
                    {profile.bio.length} / {BIO_MAX} characters
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">Technical Skills &amp; Stack</span>
                  <span className="text-[11px] text-slate-400">Shown on graduation showcase directory</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                    >
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  {isAddingSkill ? (
                    <input
                      autoFocus
                      value={skillDraft}
                      maxLength={30}
                      onChange={(event) => setSkillDraft(event.target.value)}
                      onBlur={commitSkill}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          commitSkill();
                        }
                        if (event.key === 'Escape') {
                          setSkillDraft('');
                          setIsAddingSkill(false);
                        }
                      }}
                      placeholder="e.g. Docker"
                      className="w-28 rounded-md border border-indigo-300 bg-white px-2 py-1 text-xs outline-none"
                    />
                  ) : (
                    profile.skills.length < MAX_SKILLS && (
                      <button
                        type="button"
                        onClick={() => setIsAddingSkill(true)}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-200/70 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        <Plus size={11} />
                        Add Skill
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Privacy &amp; defense settings
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <Globe size={16} className="mt-0.5 shrink-0 text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Publish to University Capstone Gallery
                      </p>
                      <p className="text-xs text-slate-500">
                        Allows accredited industry scouts to view graduation defense projects.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={profile.publishToGallery}
                    aria-label="Publish to University Capstone Gallery"
                    onClick={() => {
                      setProfile((previous) => ({
                        ...previous,
                        publishToGallery: !previous.publishToGallery,
                      }));
                      setMessage('');
                    }}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      profile.publishToGallery ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
                        profile.publishToGallery ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* footer actions */}
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                {currentUser?.updatedAt && (
                  <>
                    <Clock size={12} />
                    Last updated:{' '}
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(currentUser.updatedAt))}{' '}
                    by you
                  </>
                )}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0f1d4a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b2a66] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </ProfileShell>
  );
}