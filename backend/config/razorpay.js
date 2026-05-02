import Razorpay from "razorpay";

let instance = null;

const getRazorpay = () => {
  if (!instance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
      );
    }
    instance = new Razorpay({ key_id, key_secret });
  }
  return instance;
};

export default {
  orders: {
    create: (...args) => getRazorpay().orders.create(...args),
    fetch: (...args) => getRazorpay().orders.fetch(...args),
  },
  payments: {
    fetch: (...args) => getRazorpay().payments.fetch(...args),
  },
};
