declare module "react-native-razorpay" {
  interface CheckoutOptions {
    key: string;
    amount: string;
    currency: "INR";
    name: string;
    description?: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color: string };
  }

  interface PaymentResult {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: { open(options: CheckoutOptions): Promise<PaymentResult> };
  export default RazorpayCheckout;
}
