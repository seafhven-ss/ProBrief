import { NextResponse } from "next/server";
import { checkCode, createToken, getUsageCount, MAX_USES } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, code } = (await request.json()) as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json({ error: "邮箱和验证码为必填项" }, { status: 400 });
    }

    const valid = await checkCode(email, code);
    if (!valid) {
      return NextResponse.json({ error: "验证码无效或已过期" }, { status: 401 });
    }

    const token = await createToken(email);
    const used = await getUsageCount(email);
    const remaining = Math.max(0, MAX_USES - used);

    return NextResponse.json({ token, remaining, maxUses: MAX_USES });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "验证失败，请稍后再试" }, { status: 500 });
  }
}
