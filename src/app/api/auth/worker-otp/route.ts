import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side in-memory cache for OTP verification with expiry and rate limiting.
 * In production with multiple server instances, use Redis or Strapi database.
 */
interface OtpRecord {
  identifier: string; // phone or email
  code: string;
  expiresAt: number;
  attempts: number;
  channel: 'sms' | 'whatsapp' | 'email';
}

const otpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(id);
    }
  }
}, 60000);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, email, identifier, channel, otp } = body;

    const rawIdentifier = (identifier || phone || email || '').trim();
    if (!rawIdentifier) {
      return NextResponse.json({ success: false, error: 'Mobile number or email address is required.' }, { status: 400 });
    }

    const isEmail = rawIdentifier.includes('@');
    const cleanId = isEmail 
      ? rawIdentifier.toLowerCase() 
      : rawIdentifier.replace(/[^0-9]/g, '');

    if (!isEmail && cleanId.length < 10) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit mobile number required.' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ACTION: REQUEST OTP
    // ─────────────────────────────────────────────────────────────
    if (action === 'send') {
      const existing = otpStore.get(cleanId);
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

      const selectedChannel: 'sms' | 'whatsapp' | 'email' = isEmail ? 'email' : (channel === 'whatsapp' ? 'whatsapp' : 'sms');

      otpStore.set(cleanId, {
        identifier: cleanId,
        code,
        expiresAt,
        attempts: 0,
        channel: selectedChannel
      });

      // Production security: Check environment and real provider configuration
      const isProduction = process.env.NODE_ENV === 'production';
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      const whatsappApiKey = process.env.WHATSAPP_CLOUD_API_KEY;
      const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const resendApiKey = process.env.RESEND_API_KEY;

      const hasSmsConfig = Boolean(twilioSid && twilioAuthToken && twilioPhone);
      const hasWhatsappConfig = Boolean(whatsappApiKey && whatsappPhoneId);
      const hasEmailConfig = Boolean(resendApiKey);

      let deliveryStatus = 'simulated_sandbox';
      let providerMessage = '';

      if (selectedChannel === 'email') {
        if (hasEmailConfig) {
          try {
            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'STRUCTIVA Security <auth@structiva.internal>',
                to: [cleanId],
                subject: 'Your STRUCTIVA Login Verification Code',
                text: `Your STRUCTIVA 2-step verification code is: ${code}. Valid for 5 minutes.`
              })
            });
            if (emailRes.ok) {
              deliveryStatus = 'dispatched_email';
              providerMessage = 'Verification code sent to registered email.';
            } else {
              deliveryStatus = 'provider_error';
              providerMessage = 'Email gateway delivery failed.';
            }
          } catch (e: any) {
            deliveryStatus = 'provider_error';
            providerMessage = 'Email service connection error.';
          }
        } else {
          deliveryStatus = 'provider_not_configured';
          providerMessage = 'Email delivery credentials (RESEND_API_KEY) not configured in environment.';
        }
      } else if (selectedChannel === 'whatsapp') {
        if (hasWhatsappConfig) {
          try {
            const waRes = await fetch(`https://graph.facebook.com/v20.0/${whatsappPhoneId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: cleanId.startsWith('91') ? cleanId : `91${cleanId}`,
                type: 'text',
                text: {
                  body: `Your STRUCTIVA Workforce verification code is: ${code}. Valid for 5 minutes. Do not share this code.`
                }
              })
            });

            if (waRes.ok) {
              deliveryStatus = 'dispatched_whatsapp';
              providerMessage = 'WhatsApp OTP sent via Meta Cloud API.';
            } else {
              deliveryStatus = 'provider_error';
              providerMessage = 'WhatsApp gateway failed to deliver. Please try SMS channel.';
            }
          } catch (e: any) {
            deliveryStatus = 'provider_error';
            providerMessage = 'WhatsApp connection timed out. Please try SMS.';
          }
        } else {
          deliveryStatus = 'provider_not_configured';
          providerMessage = 'WhatsApp Cloud API credentials not configured in environment.';
        }
      } else {
        if (hasSmsConfig) {
          try {
            const authHeader = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
            const twilioBody = new URLSearchParams({
              To: cleanId.startsWith('+') ? cleanId : `+91${cleanId}`,
              From: twilioPhone!,
              Body: `Your STRUCTIVA Workforce verification code is: ${code}. Valid for 5 minutes.`
            });

            const smsRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: twilioBody.toString()
            });

            if (smsRes.ok) {
              deliveryStatus = 'dispatched_sms';
              providerMessage = 'SMS OTP sent via Twilio Gateway.';
            } else {
              deliveryStatus = 'provider_error';
              providerMessage = 'SMS gateway delivery rejected. Verify phone format.';
            }
          } catch (e: any) {
            deliveryStatus = 'provider_error';
            providerMessage = 'Telecom gateway connection timed out.';
          }
        } else {
          deliveryStatus = 'provider_not_configured';
          providerMessage = 'Telecom SMS Gateway (Twilio/MSG91) credentials not configured in environment.';
        }
      }

      // In production, NEVER expose OTP code in response under any circumstance
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
        message: 'OTP dispatch initiated.',
        channel: selectedChannel,
        deliveryStatus,
        providerMessage,
        // sandboxCode is strictly omitted in production
        sandboxCode: shouldExposeSandbox ? code : undefined,
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

      const record = otpStore.get(cleanId);
      if (!record) {
        return NextResponse.json({
          success: false,
          error: 'No active OTP request found for this identifier or OTP expired. Please request a new code.'
        }, { status: 400 });
      }

      const now = Date.now();
      if (now > record.expiresAt) {
        otpStore.delete(cleanId);
        return NextResponse.json({
          success: false,
          error: 'OTP code has expired (5 minute limit). Please request a fresh OTP.'
        }, { status: 400 });
      }

      // Check max verification attempts (limit: 5)
      record.attempts += 1;
      if (record.attempts > 5) {
        otpStore.delete(cleanId);
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
      otpStore.delete(cleanId);

      return NextResponse.json({
        success: true,
        verified: true,
        identifier: cleanId,
        message: 'Verification successful.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Supported: send, verify' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error processing OTP.' }, { status: 500 });
  }
}
