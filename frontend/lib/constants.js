export const PRICING = {
  15: 49,
  30: 99,
  60: 179,
};

export const DURATIONS = [
  { value: 15, label: "15 min", price: 49 },
  { value: 30, label: "30 min", price: 99 },
  { value: 60, label: "1 hour", price: 179 },
];

export const LANGUAGES = [
  "Hindi",
  "English",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Gujarati",
];

export const TOPICS = [
  "Loneliness",
  "Relationship issues",
  "Work stress",
  "Friendship",
  "General talk",
  "Studies",
];

export const PLATFORM_FEE_PERCENT = 0.25;
export const COMPANION_SHARE_PERCENT = 0.75;
export const RAZORPAY_FEE_PERCENT = 0.02;

export function calculateBreakdown(duration) {
  const amount = PRICING[duration] || 99;
  const afterGateway = amount * (1 - RAZORPAY_FEE_PERCENT);
  const companionEarnings = Math.round(afterGateway * COMPANION_SHARE_PERCENT);
  const platformFee = Math.round(afterGateway * PLATFORM_FEE_PERCENT);
  return { amount, companionEarnings, platformFee, afterGateway };
}

export function formatCurrency(amount) {
  return `₹${amount}`;
}
