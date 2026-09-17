import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = 4900; // ₹49 in paise
    const currency = "INR";
    const receipt = `siftrole_rcpt_${Date.now()}`;

    // If live/test Razorpay keys are configured, call the official Razorpay API
    if (keyId && keySecret) {
      const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt,
          notes: {
            plan: "Siftrole Pro Lifetime",
          },
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        return NextResponse.json({
          success: true,
          orderId: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          keyId,
          isLiveMode: true,
        });
      } else {
        const errorData = await res.json();
        console.warn("Razorpay API error:", errorData);
      }
    }

    // Seamless fallback mode for development or until live keys are added to .env
    const simulatedOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;
    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency,
      keyId: keyId || "rzp_test_siftrole_dev",
      isLiveMode: false,
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
