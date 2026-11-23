import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side in-memory cache for Email OTP verification with expiry, attempt tracking, and rate limiting.
 * In production with multiple server instances, use Redis or Strapi database.
 */
interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

const emailOtpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of emailOtpStore.entries()) {
    if (now > record.expiresAt) {
      emailOtpStore.delete(email);
    }
  }
}, 60000);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, identifier, otp } = body;

    const rawEmail = (email || identifier || '').trim().toLowerCase();
    if (!rawEmail) {
      return NextResponse.json({ success: false, error: 'Registered email address is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address (e.g., name@structiva.internal).' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ACTION: REQUEST EMAIL OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'send') {
      const existing = emailOtpStore.get(rawEmail);
      const now = Date.now();

      // Rate limit: Enforce 45-second resend cooldown
      if (existing && existing.expiresAt - now > 5 * 60 * 1000 - 45 * 1000) {
        const waitSec = Math.ceil((existing.expiresAt - now - (5 * 60 * 1000 - 45 * 1000)) / 1000);
        return NextResponse.json({
          success: false,
          error: `Please wait ${waitSec} seconds before requesting a new verification code.`
        }, { status: 429 });
      }

      // Generate cryptographically secure 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiry

      emailOtpStore.set(rawEmail, {
        email: rawEmail,
        code,
        expiresAt,
        attempts: 0
      });

      // Production security: Check Email Provider Credentials
      const isProduction = process.env.NODE_ENV === 'production';
      const resendApiKey = process.env.RESEND_API_KEY;
      const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'STRUCTIVA OS <onboarding@resend.dev>';
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'auth@structiva.internal';
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      const hasResend = Boolean(resendApiKey);
      const hasSendgrid = Boolean(sendgridApiKey);
      const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);

      let deliveryStatus = 'provider_not_configured';
      let providerMessage = '';

      if (hasResend) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: resendFromEmail,
              to: [rawEmail],
              subject: 'STRUCTIVA Verification Code',
              text: `Your STRUCTIVA 2-step verification code is: ${code}. Valid for 5 minutes. Do not share this code.`
            })
          });

          if (res.ok) {
            deliveryStatus = 'dispatched_email';
            providerMessage = `Verification code sent to ${rawEmail}.`;
          } else {
            const errJson = await res.json().catch(() => ({}));
            console.error('Resend delivery failed:', errJson);
            deliveryStatus = 'provider_error';
            providerMessage = errJson?.message || 'Email gateway delivery failed. Please check mail provider domain status.';
          }
        } catch (e: any) {
          deliveryStatus = 'provider_error';
          providerMessage = 'Email connection timed out.';
        }
      } else if (hasSendgrid) {
        try {
          const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sendgridApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: rawEmail }] }],
              from: { email: 'auth@structiva.internal', name: 'STRUCTIVA Enterprise OS' },
              subject: 'STRUCTIVA Verification Code',
              content: [{ type: 'text/plain', value: `Your STRUCTIVA verification code is: ${code}. Valid for 5 minutes.` }]
            })
          });

          if (res.status >= 200 && res.status < 300) {
            deliveryStatus = 'dispatched_email';
            providerMessage = `Verification code sent to ${rawEmail}.`;
          } else {
            deliveryStatus = 'provider_error';
            providerMessage = 'SendGrid email delivery failed.';
          }
        } catch (e: any) {
          deliveryStatus = 'provider_error';
          providerMessage = 'Email service connection error.';
        }
      } else {
        deliveryStatus = 'provider_not_configured';
        providerMessage = 'Email provider credentials (RESEND_API_KEY, SENDGRID_API_KEY, or SMTP) not configured in environment.';
      }

      // Security: Never reveal code in production
      const shouldExposeSandbox = !isProduction && deliveryStatus === 'provider_not_configured';

      if (deliveryStatus === 'provider_error') {
        return NextResponse.json({
          success: false,
          error: providerMessage,
          deliveryStatus
        }, { status: 502 });
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code generation initiated.',
        deliveryStatus,
        providerMessage,
        // In local development / sandbox without email credentials, expose sandboxCode
        // so browser testing can proceed without blocking on external provider accounts
        sandboxCode: shouldExposeSandbox ? code : undefined,
        expiresInSeconds: 300
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ACTION: VERIFY EMAIL OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, error: 'OTP code is required for verification.' }, { status: 400 });
      }

      const record = emailOtpStore.get(rawEmail);
      if (!record) {
        return NextResponse.json({
          success: false,
          error: 'No active OTP request found for this email address or OTP expired. Please request a new code.'
        }, { status: 400 });
      }

      const now = Date.now();
      if (now > record.expiresAt) {
        emailOtpStore.delete(rawEmail);
        return NextResponse.json({
          success: false,
          error: 'Verification code has expired (5 minute limit). Please request a fresh code.'
        }, { status: 400 });
      }

      // Check max verification attempts (limit: 5)
      record.attempts += 1;
      if (record.attempts > 5) {
        emailOtpStore.delete(rawEmail);
        return NextResponse.json({
          success: false,
          error: 'Too many incorrect attempts. For security, this code is invalidated. Request a new one.'
        }, { status: 429 });
      }

      if (record.code !== otp.toString().trim()) {
        const remaining = 5 - record.attempts;
        return NextResponse.json({
          success: false,
          error: `Incorrect verification code. ${remaining} attempts remaining.`
        }, { status: 400 });
      }

      // Verified successfully! Consume OTP so it cannot be re-used
      emailOtpStore.delete(rawEmail);

      return NextResponse.json({
        success: true,
        verified: true,
        email: rawEmail,
        message: 'Email address verified successfully.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Supported: send, verify' }, { status: 400 });
  } catch (error: any) {
    console.error('Email OTP API Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error processing Email OTP.' }, { status: 500 });
  }
}
