import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (!config.smtp.host || !config.smtp.user) {
    logger.warn('SMTP not configured — emails will not be sent');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: `"MARKETRON" <${config.smtp.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error: any) {
    logger.error(`Failed to send email to ${options.to}`, { error: error.message });
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'إعادة تعيين كلمة المرور - MARKETRON',
    html: `
      <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00d4ff, #7c3aed); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MARKETRON</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">إعادة تعيين كلمة المرور</p>
        </div>
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151;">مرحباً،</p>
          <p style="font-size: 14px; color: #6b7280;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في MARKETRON.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #00d4ff, #7c3aed); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
          <p style="font-size: 12px; color: #9ca3af;">رابط إعادة التعيين صالح لمدة ساعة واحدة.</p>
        </div>
      </div>
    `,
  });
}
