import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AtSign,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  ExternalLink,
  Globe,
  HelpCircle,
  KanbanSquare,
  LayoutDashboard,
  Lock,
  MoreVertical,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import { useAuth } from '../../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* constants + validation                                              */
/* ------------------------------------------------------------------ */

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

// Change the paths to match your router
const WORKSPACE_NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Project & Team', to: '/projects', icon: Users, badge: 'Alpha' },
  { label: 'Kanban Board', to: '/tasks', icon: KanbanSquare, count: 8 },
  { label: 'Deliverables', to: '/deliverables', icon: CheckSquare, badge: 'Phase 2' },
  { label: 'AI Assistant', to: '/ai-workspace', icon: Sparkles, dot: 'bg-blue-400' },
];

const COMMUNICATION_NAV = [
  { label: 'Notifications', to: '/notifications', icon: Bell, dot: 'bg-red-500' },
  { label: 'Meetings & Schedule', to: '/meetings', icon: CalendarDays },
  { label: 'Analytics & Audit', to: '/analytics', icon: BarChart3 },
];

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

function splitName(user) {
  if (user.firstName) return [user.firstName, user.lastName ?? ''];
  const [first = '', ...rest] = (user.name ?? user.fullName ?? '').trim().split(/\s+/);
  return [first, rest.join(' ')];
}

function toProfile(user) {
  if (!user) return INITIAL_PROFILE;
  const [firstName, lastName] = splitName(user);

  return {
    firstName,
    lastName,
    username: user.username ?? '',
    phoneNumber: (user.phoneNumber ?? '').replace(/^\+20/, ''),
    bio: user.bio ?? '',
    skills: (user.skills ?? []).map((skill) => (typeof skill === 'string' ? skill : skill.name)),
    publishToGallery: Boolean(user.publishToGallery),
  };
}

/* ------------------------------------------------------------------ */
/* small components                                                    */
/* ------------------------------------------------------------------ */

function SidebarItem({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      <Icon size={15} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
          {item.badge}
        </span>
      )}
      {item.count && (
        <span className="rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
          {item.count}
        </span>
      )}
      {item.dot && <span className={`size-1.5 rounded-full ${item.dot}`} />}
    </Link>
  );
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

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function EditProfile() {
  const { currentUser } = useAuth();

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
  const savedPicture = currentUser?.profilePictureUrl ?? currentUser?.profilePicture ?? '';

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
    setErrors((previous) => ({ ...previous, [name]: '' }));
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
      // TODO: Connect PUT /api/users/profile with:
      //   firstName, lastName, username, phoneNumber: normalizePhone(profile.phoneNumber),
      //   bio, skills, publishToGallery, profilePicture: image, removeProfilePicture: removeImage
      // Username uniqueness must be verified by the backend
      // (409 -> setErrors({ username: 'Username already exists.' })).
      // On success, show 'Profile updated successfully.'
      setMessage('Validation passed. Profile saving is not connected to the backend yet.');
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
  const displayName =
    `${profile.firstName} ${profile.lastName}`.trim() || currentUser?.name || 'Student Name';
  const teamRole = currentUser?.teamRole ?? currentUser?.role;
  const cardClass = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f3f5f9] text-slate-800">
      {/* ===================== sidebar ===================== */}
      <aside className="hidden w-60 shrink-0 flex-col bg-[#1b2559] p-4 lg:flex">
        <div className="mb-7 flex items-center gap-2 px-2 text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck size={18} />
          </span>
          <span className="text-lg font-bold">Gradify</span>
          <span className="rounded bg-indigo-400/30 px-1.5 text-[10px] font-bold">AI</span>
        </div>

        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400">WORKSPACE</p>
        <nav className="flex flex-col gap-0.5">
          {WORKSPACE_NAV.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold tracking-wider text-slate-400">
          COMMUNICATION
        </p>
        <nav className="flex flex-col gap-0.5">
          {COMMUNICATION_NAV.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5 text-white">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck size={14} />
            </span>
            <div className="min-w-0 text-xs">
              <p className="truncate font-semibold">{currentUser?.supervisorName ?? 'Supervisor Name'}</p>
              <p className="truncate text-slate-400">Academic Advisor • Assigned</p>
            </div>
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-lg bg-white/10 p-2.5 text-white"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-slate-800">
              {initials || 'SN'}
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="truncate text-slate-400">{teamRole ?? 'Team Leader'}</p>
            </div>
            <MoreVertical size={14} className="text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* ===================== main ===================== */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-xs text-slate-500">
            Workspace › Dashboard › <b className="text-slate-800">Overview</b>
          </p>

          <div className="flex items-center gap-4 text-slate-500">
            <label className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:flex">
              <Search size={13} />
              <input
                className="w-44 bg-transparent outline-none placeholder:text-slate-400"
                placeholder="Search projects, docs..."
              />
              <kbd className="rounded bg-slate-200 px-1 text-[10px]">⌘K</kbd>
            </label>
            <span className="relative">
              <Bell size={16} />
              <i className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" />
            </span>
            <Sun size={16} />
            <HelpCircle size={16} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-6 py-5">
          {/* success banner */}
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
                  {teamRole && (
                    <span className="shrink-0 rounded-full bg-[#1b2559] px-3 py-1 text-[11px] font-semibold text-white">
                      {teamRole}
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

              {/* read-only: email, role and academic fields are set at registration */}
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
                    verified={currentUser?.isVerified ?? Boolean(currentUser?.email)}
                    icon={<Lock size={12} className="text-slate-400" />}
                  />
                  <LockedItem label="University affiliation" value={currentUser?.university} />
                  <div className="grid grid-cols-2 gap-2">
                    <LockedItem label="Faculty / School" value={currentUser?.faculty} />
                    <LockedItem label="Department" value={currentUser?.department} />
                    <LockedItem
                      label="Account hierarchy"
                      value={[currentUser?.role, currentUser?.teamRole && `(${currentUser.teamRole})`]
                        .filter(Boolean)
                        .join(' ')}
                    />
                    <LockedItem
                      label="Graduation year"
                      value={currentUser?.graduationYear ? `Class of ${currentUser.graduationYear}` : ''}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">
                    {currentUser?.advisorName && `Advisor: ${currentUser.advisorName}`}
                  </span>
                  <a
                    href="/support/request-modification"
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                  >
                    Request Modification
                    <ExternalLink size={11} />
                  </a>
                </div>
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
                {currentUser?.studentId && (
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                    ID: #{currentUser.studentId}
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

          {/* bottom notice */}
          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-200/60 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-bold text-slate-900">
                Need to change your degree plan or academic advisor?
              </span>
              <br />
              Administrative changes require verification through the EELU Student Affairs portal.
            </p>
            <a
              href="/support/student-affairs"
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-center font-semibold text-[#0f1d4a] hover:bg-slate-50"
            >
              Contact Academic Affairs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}