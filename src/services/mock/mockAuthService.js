/**
 * Mock auth service — frontend only, no real backend.
 *
 * Demo accounts (password for all: Gradify@123). Sign in with email OR username:
 *   TeamLeader  alice@gradify.io / alice  → /dashboard
 *   TeamMember  bob@gradify.io   / bob    → /dashboard
 *   Supervisor  carol@gradify.io / carol  → /supervisor
 *   Unverified  eve@gradify.io   / eve    → "Account not verified…"
 *
 * Lockout: 5 consecutive failed attempts lock the account (or unknown identifier)
 * for 15 minutes. State is in memory only and resets on page reload.
 *
 * Registration: new accounts are kept in memory (lost on reload) and start unverified.
 * Mock email verification code: 123456
 * Taken phone numbers (for duplicate checks): 01012345678, 01112345678, 01212345678,
 * 01512345678, 01098765432.
 *
 * Password reset: forgotPassword() creates a 30-minute single-use token and logs the
 * reset link in the console (no email server yet). Tokens are in memory only.
 */
import usersData from '../../mocks/data/users.json';
import { ROLES } from '../../constants/roles';

export const MOCK_VERIFICATION_CODE = '123456';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const ERRORS = {
  invalid: 'Invalid email/username or password.',
  unverified: 'Account not verified. Please check your email.',
  locked: 'Account temporarily locked. Try again later.',
};

// key → { count, lockedUntil }
const failedAttempts = new Map();

// Accounts created through register() during this page session.
const registeredUsers = [];
const allUsers = () => [...usersData, ...registeredUsers];

function toPublicUser({ password: _password, ...user }) {
  return user;
}

function findUser(identifier) {
  return allUsers().find(
    (u) => u.email.toLowerCase() === identifier || u.username?.toLowerCase() === identifier,
  );
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return allUsers().find((u) => u.email.toLowerCase() === normalized);
}

// +20 1xxxxxxxxx and 01xxxxxxxxx are the same Egyptian number.
function normalizePhone(phone = '') {
  const compact = phone.replace(/[\s-]/g, '');
  return compact.startsWith('+20') ? `0${compact.slice(3)}` : compact;
}

// Error tied to a form field, so the UI can show it on that input.
function fieldError(field, message) {
  const error = new Error(message);
  error.field = field;
  return error;
}

function issueTokens(user, rememberMe = false) {
  const issuedAt = Date.now();
  return {
    accessToken: `mock-access-${user.id}-${issuedAt}`,
    refreshToken: `mock-refresh-${user.id}-${issuedAt}${rememberMe ? '-remember' : ''}`,
    user: toPublicUser(user),
  };
}

export async function login({ emailOrUsername, password, rememberMe = false }) {
  await delay(800);

  const identifier = emailOrUsername.trim().toLowerCase();
  const user = findUser(identifier);
  // Track by account when it exists, so email and username share one counter.
  const key = user ? `user:${user.id}` : `id:${identifier}`;

  const record = failedAttempts.get(key);
  if (record?.lockedUntil) {
    if (record.lockedUntil > Date.now()) throw new Error(ERRORS.locked);
    failedAttempts.delete(key);
  }

  if (!user || user.password !== password) {
    const count = (failedAttempts.get(key)?.count ?? 0) + 1;
    if (count >= MAX_FAILED_ATTEMPTS) {
      failedAttempts.set(key, { count, lockedUntil: Date.now() + LOCKOUT_MS });
      throw new Error(ERRORS.locked);
    }
    failedAttempts.set(key, { count, lockedUntil: null });
    throw new Error(ERRORS.invalid);
  }

  failedAttempts.delete(key);

  if (!user.isVerified) throw new Error(ERRORS.unverified);

  return issueTokens(user, rememberMe);
}

export async function register(payload) {
  await delay(1000);

  const email = payload.email.trim().toLowerCase();
  const username = payload.username.trim();
  const phone = normalizePhone(payload.phone);
  const users = allUsers();

  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw fieldError('email', 'Email already exists.');
  }
  if (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
    throw fieldError('username', 'Username already exists.');
  }
  if (users.some((u) => u.phone && normalizePhone(u.phone) === phone)) {
    throw fieldError('phone', 'Phone number already exists.');
  }

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const user = {
    id: `u${Date.now()}`,
    name: [firstName, lastName].filter(Boolean).join(' '),
    firstName,
    lastName,
    username,
    email,
    phone,
    password: payload.password,
    // Students join as team members; they become leaders by creating a team.
    role: payload.role === 'supervisor' ? ROLES.SUPERVISOR : ROLES.TEAM_MEMBER,
    isVerified: false,
    avatar: payload.profilePicture ? URL.createObjectURL(payload.profilePicture) : null,
    academic: {
      university: payload.university,
      faculty: payload.faculty,
      department: payload.department,
      academicId: payload.academicId.trim() || null,
      graduationYear: Number(payload.graduationYear),
    },
    createdAt: new Date().toISOString(),
  };
  registeredUsers.push(user);

  return { user: toPublicUser(user) };
}

export async function verifyEmail(email, code) {
  await delay(800);
  const user = findUserByEmail(email);
  if (!user) throw new Error('We couldn’t find this sign-up. Please register again.');
  if (code !== MOCK_VERIFICATION_CODE) throw new Error('Invalid verification code.');
  user.isVerified = true;
  return { user: toPublicUser(user) };
}

export async function resendVerification(email) {
  await delay(600);
  if (!findUserByEmail(email)) throw new Error('We couldn’t find this sign-up. Please register again.');
  return { message: 'Code sent' };
}

// Starts a session right after email verification (no password re-entry).
export async function signInVerifiedUser(email) {
  await delay(300);
  const user = findUserByEmail(email);
  if (!user?.isVerified) throw new Error('Please verify your email before continuing.');
  return issueTokens(user);
}

// ── Password reset (mock) ───────────────────────────────────────────
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // reset link expires after 30 minutes
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// token → { userId, expiresAt, used }  (in memory only, like the rest of this mock)
const resetTokens = new Map();

function getValidResetRecord(token) {
  const record = resetTokens.get(token ?? '');
  if (!record || record.used || record.expiresAt < Date.now()) {
    throw new Error('Reset link is invalid or expired.');
  }
  return record;
}

export async function forgotPassword(email) {
  await delay(600);

  const user = findUserByEmail(email);
  if (!user) throw new Error('No account found with this email.');

  // Only one active token per user: a new request invalidates the previous one.
  for (const [token, record] of resetTokens) {
    if (record.userId === user.id) resetTokens.delete(token);
  }

  const token = `reset-${user.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + RESET_TOKEN_TTL_MS, used: false });

  const devResetPath = `/auth/reset-password?token=${token}`;
  // No email server yet: the link is logged and returned so the page can show it in dev mode.
  console.info(`[mock email] Password reset link for ${user.email}: ${window.location.origin}${devResetPath}`);

  return { message: 'A password reset link has been sent to your email.', devResetPath };
}

export async function validateResetToken(token) {
  await delay(300);
  getValidResetRecord(token);
  return { valid: true };
}

export async function resetPassword(token, newPassword, confirmPassword) {
  await delay(800);

  const record = getValidResetRecord(token);

  if (!PASSWORD_PATTERN.test(newPassword)) {
    throw new Error('Password does not meet complexity requirements.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const user = allUsers().find((u) => u.id === record.userId);
  if (!user) throw new Error('Reset link is invalid or expired.');

  user.password = newPassword;
  record.used = true; // the token can only be used once
  failedAttempts.delete(`user:${user.id}`); // clear any login lockout

  return { message: 'Your password has been reset successfully. Please log in.' };
}

export async function getCurrentUser() {
  await delay();
  return toPublicUser(usersData[0]);
}

export async function updateProfile(userId, payload) {
  await delay(800);

  const user = allUsers().find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');

  const username = payload.username.trim();
  const phone = normalizePhone(payload.phoneNumber);
  const others = allUsers().filter((u) => u.id !== userId);

  if (others.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
    throw fieldError('username', 'Username already exists.');
  }
  if (others.some((u) => u.phone && normalizePhone(u.phone) === phone)) {
    throw fieldError('phone', 'Phone number already exists.');
  }

  const firstName = payload.firstName.trim();
  const lastName = (payload.lastName ?? '').trim();

  user.firstName = firstName;
  user.lastName = lastName;
  user.name = [firstName, lastName].filter(Boolean).join(' ');
  user.username = username;
  user.phone = phone;
  user.bio = payload.bio ?? '';
  user.skills = payload.skills ?? [];
  user.publishToGallery = Boolean(payload.publishToGallery);
  if (payload.profilePicture) user.avatar = URL.createObjectURL(payload.profilePicture);
  else if (payload.removeProfilePicture) user.avatar = null;
  user.updatedAt = new Date().toISOString();

  return { user: toPublicUser(user) };
}