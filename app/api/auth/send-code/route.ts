import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateCode, storeCode } from "@/lib/auth";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is required");
  return new Resend(key);
}

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const code = generateCode();
    await storeCode(email, code);

    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "ProBrief <noreply@singularity-society.com>",
      to: email,
      subject: "ProBrief 验证码 / Verification Code",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">ProBrief 验证码</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Your verification code is:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">验证码 5 分钟内有效 / Code expires in 5 minutes</p>
          <p style="color: #ccc; font-size: 11px; margin-top: 32px;">Singularity Society · ProBrief</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json({ error: "发送验证码失败，请稍后再试" }, { status: 500 });
  }
}
