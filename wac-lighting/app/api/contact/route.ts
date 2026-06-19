import { NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  message: string;
  budget?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!body.email?.trim() || !validateEmail(body.email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // In production: send email via SendGrid/SES/Resend
    // await sendEmail({ to: "info@waclighting.com", ...body });

    return NextResponse.json(
      { success: true, message: "Your inquiry has been received. We'll be in touch within 24 hours." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
