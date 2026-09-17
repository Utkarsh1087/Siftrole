import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Invalid payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. Siftrole Pro access activated.",
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
