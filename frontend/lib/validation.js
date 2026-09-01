export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPasswordErrors(password) {
  const errors = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special character");
  return errors;
}

export function isStrongPassword(password) {
  return getPasswordErrors(password).length === 0;
}
