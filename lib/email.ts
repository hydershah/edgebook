import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  const mailOptions = {
    from: `"EdgeBook" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password - EdgeBook',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4A9B7F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">EdgeBook</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4A9B7F; margin-top: 0;">Reset Your Password</h2>

            <p>Hello,</p>

            <p>We received a request to reset your password for your EdgeBook account. Click the button below to create a new password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #4A9B7F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #e9e9e9; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              <strong>This link will expire in 1 hour.</strong>
            </p>

            <p style="color: #666; font-size: 14px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated email from EdgeBook. Please do not reply to this message.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Reset Your Password

Hello,

We received a request to reset your password for your EdgeBook account.

Click the link below to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
This is an automated email from EdgeBook. Please do not reply to this message.
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: `"EdgeBook" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to EdgeBook!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EdgeBook</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4A9B7F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to EdgeBook!</h1>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #4A9B7F; margin-top: 0;">Hello ${name || 'there'}!</h2>

            <p>Thank you for joining EdgeBook - your premier platform for sports betting insights and community.</p>

            <p>Here's what you can do now:</p>

            <ul style="line-height: 2;">
              <li>Follow expert bettors and get their premium picks</li>
              <li>Share your own picks and build your following</li>
              <li>Get AI-powered betting advice from our advisor</li>
              <li>Track your performance and improve your strategy</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/feed"
                 style="background-color: #4A9B7F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Explore Picks
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to reach out to our support team.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated email from EdgeBook. Please do not reply to this message.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to EdgeBook!

Hello ${name || 'there'}!

Thank you for joining EdgeBook - your premier platform for sports betting insights and community.

Here's what you can do now:
- Follow expert bettors and get their premium picks
- Share your own picks and build your following
- Get AI-powered betting advice from our advisor
- Track your performance and improve your strategy

Visit ${process.env.NEXTAUTH_URL}/feed to get started!

If you have any questions, feel free to reach out to our support team.

---
This is an automated email from EdgeBook. Please do not reply to this message.
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}