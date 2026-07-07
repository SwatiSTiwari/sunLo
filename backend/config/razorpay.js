const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay;
if (keyId && keySecret) {
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
} else {
  console.warn("[dev] Razorpay not configured; payment endpoints will return 503.");
  razorpay = null;
}

module.exports = razorpay;
