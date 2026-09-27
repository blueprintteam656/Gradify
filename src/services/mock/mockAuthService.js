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

export async function forgotPassword(email) {
  await delay();
  return { message: 'Password reset link sent' };
}

export async function resetPassword(token, newPassword) {
  await delay();
  return { message: 'Password reset successful' };
}

export async function getCurrentUser() {
  await delay();
  return toPublicUser(usersData[0]);
}
