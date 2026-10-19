// Registration rules from the SRS. Each validator returns { field: message } for the step it covers.

const NAME_PATTERN = /^[A-Za-zء-ي]+(?: [A-Za-zء-ي]+)*$/; // Arabic/English letters, single spaces
const USERNAME_PATTERN = /^[A-Za-z0-9_]{4,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EGYPT_PHONE_PATTERN = /^01[0125]\d{8}$/;
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const DIGITS_PATTERN = /^\d+$/;

export const PROFILE_PICTURE_TYPES = ['image/jpeg', 'image/png'];
export const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PICTURE_ERROR = 'Profile picture must be JPG, JPEG, or PNG and under 5 MB.';

export function validateProfilePicture(file) {
  if (!file) return null;
  const extensionOk = /\.(jpe?g|png)$/i.test(file.name);
  if (!PROFILE_PICTURE_TYPES.includes(file.type) || !extensionOk || file.size > PROFILE_PICTURE_MAX_BYTES) {
    return PROFILE_PICTURE_ERROR;
  }
  return null;
}

export const PASSWORD_RULES = [
  { id: 'length', label: 'at least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'an uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'a lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'a number', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'a special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// 0 = empty, 1 = Weak (≤2 rules met), 2 = Medium (3–4), 3 = Strong (all 5).
export function getPasswordStrength(password) {
  if (!password) return 0;
  const met = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (met === PASSWORD_RULES.length) return 3;
  return met >= 3 ? 2 : 1;
}

function validateName(value, { required, label }) {
  const name = value.trim();
  if (!name) return required ? `${label} is required.` : null;
  if (name.length < 3 || name.length > 50) return `${label} must be 3–50 characters.`;
  if (!NAME_PATTERN.test(name)) return `${label} can only contain Arabic or English letters.`;
  return null;
}

function validatePersonal(form) {
  const errors = {};
  const pictureError = validateProfilePicture(form.profilePicture);
  if (pictureError) errors.profilePicture = pictureError;

  const firstName = validateName(form.firstName, { required: true, label: 'First name' });
  if (firstName) errors.firstName = firstName;
  const lastName = validateName(form.lastName, { required: false, label: 'Last name' });
  if (lastName) errors.lastName = lastName;

  const username = form.username.trim();
  if (!username) errors.username = 'Username is required.';
  else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Username must be 4–20 characters: letters, numbers, or underscores.';
  }

  const email = form.email.trim();
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  const phone = form.phone.replace(/[\s-]/g, '');
  if (!phone) errors.phone = 'Phone number is required.';
  else if (!EGYPT_PHONE_PATTERN.test(phone) && !E164_PATTERN.test(phone)) {
    errors.phone = 'Enter a valid phone number (e.g. 01012345678 or +201012345678).';
  }
  return errors;
}


function validateAcademic(form) {
  const errors = {};

  if (!form.role) {
    errors.role = 'Please choose how you are joining.';
  }

  if (!form.university) {
    errors.university = 'University is required.';
  }

  if (!form.faculty) {
    errors.faculty = 'Faculty is required.';
  }

  if (!form.department) {
    errors.department = 'Department is required.';
  }

  if (form.role === 'student') {
    const academicId = form.academicId.trim();

    if (academicId && !DIGITS_PATTERN.test(academicId)) {
      errors.academicId = 'Academic ID must contain digits only.';
    }

    if (!form.graduationYear) {
      errors.graduationYear = 'Graduation year is required.';
    }
  }

  if (form.role === 'supervisor') {
    if (!form.academicTitle) {
      errors.academicTitle = 'Academic title is required.';
    }

    if (!form.specialization.trim()) {
      errors.specialization = 'Specialization / Research Area is required.';
    }
  }

  return errors;
}


function validateSecurity(form) {
  const errors = {};
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(form.password));
  if (!form.password) errors.password = 'Password is required.';
  else if (missing.length > 0) {
    errors.password = `Password does not meet complexity requirements. Missing: ${missing
      .map((rule) => rule.label)
      .join(', ')}.`;
  }
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';
  if (!form.acceptTerms) errors.acceptTerms = 'You must accept the Terms & Conditions.';
  return errors;
}

export const STEP_VALIDATORS = [validatePersonal, validateAcademic, validateSecurity];

// Which wizard step owns each field (used to jump back on server-side errors).
export const FIELD_STEP = {
  profilePicture: 0,
  firstName: 0,
  lastName: 0,
  username: 0,
  email: 0,
  phone: 0,
  role: 1,
  university: 1,
  faculty: 1,
  department: 1,
  academicId: 1,
  graduationYear: 1,
  password: 2,
  confirmPassword: 2,
  acceptTerms: 2,
  academicTitle: 1,
specialization: 1,
};
