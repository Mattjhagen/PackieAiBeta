import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send password change notification to admin
export async function notifyAdminPasswordChange(userEmail: string, resetToken: string): Promise<boolean> {
  const subject = `PackieAI Password Change Request - ${userEmail}`;
  const text = `
A password change has been requested for user: ${userEmail}

Reset Token: ${resetToken}
Time: ${new Date().toISOString()}

Please verify this request and update the password accordingly.

- PackieAI Security System
  `;

  const html = `
    <h2>PackieAI Password Change Request</h2>
    <p>A password change has been requested for user: <strong>${userEmail}</strong></p>
    <p><strong>Reset Token:</strong> ${resetToken}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <p>Please verify this request and update the password accordingly.</p>
    <hr>
    <p><em>PackieAI Security System</em></p>
  `;

  return await sendEmail({
    to: 'info@pacmacmobile.com',
    from: 'noreply@pacmacmobile.com',
    subject,
    text,
    html
  });
}

// Send account verification email to user
export async function sendVerificationEmail(userEmail: string, verificationToken: string): Promise<boolean> {
  const subject = 'Welcome to PackieAI - Verify Your Account';
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/verify?token=${verificationToken}`;
  
  const text = `
Welcome to PackieAI!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Best regards,
The PackieAI Team
  `;

  const html = `
    <h2>Welcome to PackieAI!</h2>
    <p>Thank you for joining our fight against phone scammers.</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
    <p>Or copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p><small>This link will expire in 24 hours.</small></p>
    <p>If you didn't create this account, please ignore this email.</p>
    <hr>
    <p>Best regards,<br>The PackieAI Team</p>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@pacmacmobile.com',
    subject,
    text,
    html
  });
}

// Send password reset email to user
export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  const subject = 'PackieAI - Password Reset Request';
  const resetUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/reset-password?token=${resetToken}`;
  
  const text = `
You requested a password reset for your PackieAI account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
The PackieAI Team
  `;

  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your PackieAI account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p>${resetUrl}</p>
    <p><small>This link will expire in 1 hour.</small></p>
    <p>If you didn't request this reset, please ignore this email.</p>
    <hr>
    <p>Best regards,<br>The PackieAI Team</p>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@pacmacmobile.com',
    subject,
    text,
    html
  });
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    return await sendEmail({
      to: 'info@pacmacmobile.com',
      from: 'noreply@pacmacmobile.com',
      subject: 'PackieAI Email Service Test',
      text: 'This is a test email to verify SendGrid connection.',
      html: '<p>This is a test email to verify SendGrid connection.</p>'
    });
  } catch (error) {
    console.error('Email test failed:', error);
    return false;
  }
}