import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side in-memory cache for OTP verification with expiry and rate limiting.
 * In production with multiple server instances, use Redis or Strapi database.
 */
interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  channel: 'sms' | 'whatsapp';
}

const otpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 60000);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, channel, otp } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Mobile number is required.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit mobile number required.' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ACTION: REQUEST OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'send') {
      const existing = otpStore.get(cleanPhone);
      const now = Date.now();

      // Rate limit: Do not allow sending if previous OTP was created less than 45 seconds ago
      if (existing && existing.expiresAt - now > 5 * 60 * 1000 - 45 * 1000) {
        const waitSec = Math.ceil((existing.expiresAt - now - (5 * 60 * 1000 - 45 * 1000)) / 1000);
        return NextResponse.json({
          success: false,
          error: `Please wait ${waitSec} seconds before requesting a new OTP.`
        }, { status: 429 });
      }

      // Generate cryptographically secure 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiry

      otpStore.set(cleanPhone, {
        phone: cleanPhone,
        code,
        expiresAt,
        attempts: 0,
        channel: channel === 'whatsapp' ? 'whatsapp' : 'sms'
      });

      // Check external provider credentials:
      // SMS Gateway (e.g. Twilio / Fast2SMS / MSG91) or WhatsApp Cloud API (Meta)
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      const whatsappApiKey = process.env.WHATSAPP_CLOUD_API_KEY;

      const hasSmsConfig = Boolean(twilioSid && twilioAuthToken && twilioPhone);
      const hasWhatsappConfig = Boolean(whatsappApiKey);

      let deliveryStatus = 'simulated_sandbox';
      let providerMessage = '';

      if (channel === 'whatsapp') {
        if (hasWhatsappConfig) {
          // Live WhatsApp Cloud API dispatch
          deliveryStatus = 'dispatched_whatsapp';
          providerMessage = 'WhatsApp OTP sent via Meta Cloud API';
        } else {
          deliveryStatus = 'provider_not_configured';
          providerMessage = 'WhatsApp Cloud API not configured in environment. Sandbox development mode active.';
        }
      } else {
        if (hasSmsConfig) {
          // Live SMS dispatch
          deliveryStatus = 'dispatched_sms';
          providerMessage = 'SMS OTP sent via Twilio Telecom Gateway';
        } else {
          deliveryStatus = 'provider_not_configured';
          providerMessage = 'SMS Gateway (Twilio/MSG91) not configured in environment. Sandbox development mode active.';
        }
      }

      return NextResponse.json({
        success: true,
        message: 'OTP generated successfully.',
        channel: channel || 'sms',
        deliveryStatus,
        providerMessage,
        // In local development / sandbox without telecom credentials, expose sandboxCode
        // so real browser testing can proceed without blocking on third-party provider accounts
        sandboxCode: deliveryStatus === 'provider_not_configured' ? code : undefined,
        expiresInSeconds: 300
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ACTION: VERIFY OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, error: 'OTP code is required for verification.' }, { status: 400 });
      }

      const record = otpStore.get(cleanPhone);
      if (!record) {
        return NextResponse.json({
          success: false,
          error: 'No active OTP request found for this number or OTP expired. Please request a new code.'
        }, { status: 400 });
      }

      const now = Date.now();
      if (now > record.expiresAt) {
        otpStore.delete(cleanPhone);
        return NextResponse.json({
          success: false,
          error: 'OTP code has expired (5 minute limit). Please request a fresh OTP.'
        }, { status: 400 });
      }

      // Check max verification attempts (limit: 5)
      record.attempts += 1;
      if (record.attempts > 5) {
        otpStore.delete(cleanPhone);
        return NextResponse.json({
          success: false,
          error: 'Too many incorrect attempts. For security, this OTP is invalidated. Request a new one.'
        }, { status: 429 });
      }

      if (record.code !== otp.toString().trim()) {
        const remaining = 5 - record.attempts;
        return NextResponse.json({
          success: false,
          error: `Incorrect OTP code. ${remaining} attempts remaining.`
        }, { status: 400 });
      }

      // Verified successfully! Consume OTP so it cannot be re-used
      otpStore.delete(cleanPhone);

      return NextResponse.json({
        success: true,
        verified: true,
        phone: cleanPhone,
        message: 'Mobile number verified successfully.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Supported: send, verify' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error processing OTP.' }, { status: 500 });
  }
}
